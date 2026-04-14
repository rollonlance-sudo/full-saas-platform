import { createServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

const PORT = parseInt(process.env.SOCKET_PORT || "3001", 10);
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret";
const CORS_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface AuthPayload {
  sub: string;
  name?: string;
  email?: string;
}

interface UserSocket extends Socket {
  userId?: string;
  userName?: string;
  userEmail?: string;
}

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 20000,
});

// Track online users per workspace
const workspacePresence = new Map<string, Map<string, { userId: string; name: string; joinedAt: Date }>>();

// ===== Authentication middleware =====
io.use((socket: UserSocket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    socket.userId = decoded.sub;
    socket.userName = decoded.name || "Anonymous";
    socket.userEmail = decoded.email;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// ===== Connection handler =====
io.on("connection", (socket: UserSocket) => {
  console.log(`[Socket] Connected: ${socket.userId} (${socket.userName})`);

  // ----- Workspace Rooms -----
  socket.on("join:workspace", (workspaceId: string) => {
    const room = `workspace:${workspaceId}`;
    socket.join(room);

    // Track presence
    if (!workspacePresence.has(workspaceId)) {
      workspacePresence.set(workspaceId, new Map());
    }
    const members = workspacePresence.get(workspaceId)!;
    members.set(socket.userId!, {
      userId: socket.userId!,
      name: socket.userName || "Anonymous",
      joinedAt: new Date(),
    });

    // Broadcast presence update
    io.to(room).emit("presence:update", {
      workspaceId,
      onlineMembers: Array.from(members.values()),
    });

    console.log(`[Socket] ${socket.userName} joined workspace ${workspaceId}`);
  });

  socket.on("leave:workspace", (workspaceId: string) => {
    const room = `workspace:${workspaceId}`;
    socket.leave(room);
    removePresence(workspaceId, socket.userId!);

    io.to(room).emit("presence:update", {
      workspaceId,
      onlineMembers: Array.from(
        (workspacePresence.get(workspaceId) || new Map()).values()
      ),
    });
  });

  // ----- Project Rooms -----
  socket.on("join:project", (projectId: string) => {
    socket.join(`project:${projectId}`);
  });

  socket.on("leave:project", (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });

  // ----- Document Rooms -----
  socket.on("join:document", (documentId: string) => {
    socket.join(`document:${documentId}`);

    // Notify others that someone is editing
    socket.to(`document:${documentId}`).emit("document:user-joined", {
      documentId,
      userId: socket.userId,
      name: socket.userName,
    });
  });

  socket.on("leave:document", (documentId: string) => {
    socket.leave(`document:${documentId}`);

    socket.to(`document:${documentId}`).emit("document:user-left", {
      documentId,
      userId: socket.userId,
    });
  });

  // ----- Task Events -----
  socket.on("task:created", (data: { projectId: string; task: unknown }) => {
    socket.to(`project:${data.projectId}`).emit("task:created", data);
  });

  socket.on("task:updated", (data: { projectId: string; taskId: string; changes: unknown }) => {
    socket.to(`project:${data.projectId}`).emit("task:updated", data);
  });

  socket.on("task:deleted", (data: { projectId: string; taskId: string }) => {
    socket.to(`project:${data.projectId}`).emit("task:deleted", data);
  });

  socket.on("task:moved", (data: { projectId: string; taskId: string; fromColumnId: string; toColumnId: string; newPosition: number }) => {
    socket.to(`project:${data.projectId}`).emit("task:moved", data);
  });

  // ----- Column Events -----
  socket.on("column:created", (data: { projectId: string; column: unknown }) => {
    socket.to(`project:${data.projectId}`).emit("column:created", data);
  });

  socket.on("column:updated", (data: { projectId: string; columnId: string; changes: unknown }) => {
    socket.to(`project:${data.projectId}`).emit("column:updated", data);
  });

  socket.on("column:deleted", (data: { projectId: string; columnId: string }) => {
    socket.to(`project:${data.projectId}`).emit("column:deleted", data);
  });

  // ----- Comment Events -----
  socket.on("comment:created", (data: { taskId: string; projectId: string; comment: unknown }) => {
    socket.to(`project:${data.projectId}`).emit("comment:created", data);
  });

  // ----- Document collaboration -----
  socket.on("document:update", (data: { documentId: string; content: unknown; userId: string }) => {
    socket.to(`document:${data.documentId}`).emit("document:update", {
      ...data,
      userId: socket.userId,
      userName: socket.userName,
    });
  });

  socket.on("document:cursor", (data: { documentId: string; cursor: unknown }) => {
    socket.to(`document:${data.documentId}`).emit("document:cursor", {
      ...data,
      userId: socket.userId,
      userName: socket.userName,
    });
  });

  // ----- Notification Events -----
  socket.on("notification:send", (data: { userId: string; notification: unknown }) => {
    // Send to specific user across all their connections
    io.to(`user:${data.userId}`).emit("notification:new", data.notification);
  });

  // Join user-specific room for notifications
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
  }

  // ----- Member Events -----
  socket.on("member:added", (data: { workspaceId: string; member: unknown }) => {
    io.to(`workspace:${data.workspaceId}`).emit("member:added", data);
  });

  socket.on("member:removed", (data: { workspaceId: string; memberId: string }) => {
    io.to(`workspace:${data.workspaceId}`).emit("member:removed", data);
  });

  socket.on("member:role-changed", (data: { workspaceId: string; memberId: string; newRole: string }) => {
    io.to(`workspace:${data.workspaceId}`).emit("member:role-changed", data);
  });

  // ----- Disconnect -----
  socket.on("disconnect", () => {
    console.log(`[Socket] Disconnected: ${socket.userId}`);

    // Clean up presence from all workspaces
    for (const [workspaceId, members] of workspacePresence.entries()) {
      if (members.has(socket.userId!)) {
        removePresence(workspaceId, socket.userId!);
        io.to(`workspace:${workspaceId}`).emit("presence:update", {
          workspaceId,
          onlineMembers: Array.from(members.values()),
        });
      }
    }
  });
});

function removePresence(workspaceId: string, userId: string) {
  const members = workspacePresence.get(workspaceId);
  if (members) {
    members.delete(userId);
    if (members.size === 0) {
      workspacePresence.delete(workspaceId);
    }
  }
}

// ===== Start server =====
httpServer.listen(PORT, () => {
  console.log(`[Socket.io] Server running on port ${PORT}`);
  console.log(`[Socket.io] CORS origin: ${CORS_ORIGIN}`);
});
