import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function connectSocket(token: string) {
  const s = getSocket();
  s.auth = { token };
  s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinWorkspace(workspaceId: string) {
  getSocket().emit("join:workspace", workspaceId);
}

export function leaveWorkspace(workspaceId: string) {
  getSocket().emit("leave:workspace", workspaceId);
}

export function joinProject(projectId: string) {
  getSocket().emit("join:project", projectId);
}

export function leaveProject(projectId: string) {
  getSocket().emit("leave:project", projectId);
}

export function joinDocument(docId: string) {
  getSocket().emit("join:doc", docId);
}

export function leaveDocument(docId: string) {
  getSocket().emit("leave:doc", docId);
}
