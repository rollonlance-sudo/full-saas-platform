import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@flowboard.app";
  const password = "Demo1234!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Default user already exists:", email);
    // Ensure workspace exists
    let ws = await prisma.workspace.findFirst({ where: { slug: "demo" } });
    if (!ws) {
      ws = await prisma.workspace.create({
        data: {
          name: "Demo Workspace",
          slug: "demo",
          owner: { connect: { id: existing.id } },
          members: {
            create: { userId: existing.id, role: "owner" },
          },
        },
      });
      console.log("Created workspace for existing user.");
    }
    // Ensure project exists
    const proj = await prisma.project.findFirst({ where: { workspaceId: ws.id } });
    if (!proj) {
      await prisma.project.create({
        data: {
          name: "Getting Started",
          workspace: { connect: { id: ws.id } },
          creator: { connect: { id: existing.id } },
          columns: {
            create: [
              { name: "Backlog", position: 0 },
              { name: "In Progress", position: 1 },
              { name: "In Review", position: 2 },
              { name: "Done", position: 3 },
            ],
          },
        },
      });
      console.log("Created project for existing workspace.");
    }
    return;
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email,
      passwordHash,
      emailVerified: true,
    },
  });

  // Create a default workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
      slug: "demo",
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
    },
  });

  // Create a sample project with columns
  await prisma.project.create({
    data: {
      name: "Getting Started",
      workspace: { connect: { id: workspace.id } },
      creator: { connect: { id: user.id } },
      columns: {
        create: [
          { name: "Backlog", position: 0 },
          { name: "In Progress", position: 1 },
          { name: "In Review", position: 2 },
          { name: "Done", position: 3 },
        ],
      },
    },
  });

  console.log("Seeded default user:", email, "/ password:", password);
  console.log("Seeded workspace: Demo Workspace (slug: demo)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
