export type Role = "owner" | "admin" | "member";

export type Permission =
  | "view:projects"
  | "create:tasks"
  | "edit:tasks"
  | "delete:tasks"
  | "create:projects"
  | "edit:projects"
  | "delete:projects"
  | "invite:members"
  | "remove:members"
  | "change:roles"
  | "manage:settings"
  | "manage:billing"
  | "delete:workspace"
  | "transfer:ownership";

const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    "view:projects",
    "create:tasks",
    "edit:tasks",
    "delete:tasks",
    "create:projects",
    "edit:projects",
    "delete:projects",
    "invite:members",
    "remove:members",
    "change:roles",
    "manage:settings",
    "manage:billing",
    "delete:workspace",
    "transfer:ownership",
  ],
  admin: [
    "view:projects",
    "create:tasks",
    "edit:tasks",
    "delete:tasks",
    "create:projects",
    "edit:projects",
    "delete:projects",
    "invite:members",
    "remove:members",
    "change:roles",
    "manage:settings",
  ],
  member: [
    "view:projects",
    "create:tasks",
    "edit:tasks",
    "delete:tasks",
    "create:projects",
    "edit:projects",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function requirePermission(role: string, permission: Permission): void {
  if (!hasPermission(role as Role, permission)) {
    throw new Error(`Insufficient permissions: ${permission} requires higher role than ${role}`);
  }
}
