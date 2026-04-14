import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission, type Role } from "@/lib/permissions";
import { projectSchema } from "@/lib/validations";

async function getWorkspaceAndMember(slug: string, userId: string) {
  const workspace = await db.workspace.findUnique({ where: { slug } });
  if (!workspace) return null;
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });
  if (!member) return null;
  return { workspace, member };
}

const TEMPLATES: Record<string, string[]> = {
  blank: ["To Do", "In Progress", "Done"],
  software: ["Backlog", "To Do", "In Progress", "In Review", "Done"],
  marketing: ["Ideas", "Planning", "In Progress", "Published"],
  product: ["Research", "Design", "Build", "Launch"],
};

// GET /api/workspaces/[slug]/projects
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const result = await getWorkspaceAndMember(slug, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const projects = await db.project.findMany({
    where: { workspaceId: result.workspace.id, isArchived: false },
    include: {
      _count: { select: { tasks: true } },
      creator: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

// POST /api/workspaces/[slug]/projects
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const result = await getWorkspaceAndMember(slug, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  if (!hasPermission(result.member.role as Role, "create:projects")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const template = (body.template as string) || "blank";
  const columnNames = TEMPLATES[template] || TEMPLATES.blank;

  const project = await db.project.create({
    data: {
      workspaceId: result.workspace.id,
      name: parsed.data.name,
      description: parsed.data.description,
      icon: parsed.data.icon,
      createdBy: session.user.id,
      columns: {
        create: columnNames.map((name, index) => ({
          name,
          position: index,
        })),
      },
    },
    include: { columns: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(project, { status: 201 });
}
