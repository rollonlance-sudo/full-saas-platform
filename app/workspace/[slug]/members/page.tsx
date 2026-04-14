"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Mail,
  MoreHorizontal,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate, getInitials } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  createdAt: string;
  status: "pending" | "expired";
}

interface MembersData {
  members: Member[];
  invites: Invite[];
  currentUserRole: "owner" | "admin" | "member" | "viewer";
}

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  admin: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  member: "bg-green-500/10 text-green-700 border-green-500/20",
  viewer: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

export default function MembersPage() {
  const params = useParams();
  const slug = params.slug as string;
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");

  const {
    data,
    isLoading,
    error,
  } = useQuery<MembersData>({
    queryKey: ["members", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
  });

  const isAdmin = data?.currentUserRole === "owner" || data?.currentUserRole === "admin";

  const sendInvite = useMutation({
    mutationFn: async (payload: { email: string; role: string }) => {
      const res = await fetch(`/api/workspaces/${slug}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to send invite");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", slug] });
      toast.success("Invite sent");
      setInviteEmail("");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const resendInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch(
        `/api/workspaces/${slug}/invites/${inviteId}/resend`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to resend invite");
    },
    onSuccess: () => toast.success("Invite resent"),
    onError: () => toast.error("Failed to resend invite"),
  });

  const revokeInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch(`/api/workspaces/${slug}/invites/${inviteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke invite");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", slug] });
      toast.success("Invite revoked");
    },
    onError: () => toast.error("Failed to revoke invite"),
  });

  const changeMemberRole = useMutation({
    mutationFn: async (payload: { memberId: string; role: string }) => {
      const res = await fetch(
        `/api/workspaces/${slug}/members/${payload.memberId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: payload.role }),
        }
      );
      if (!res.ok) throw new Error("Failed to change role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", slug] });
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(
        `/api/workspaces/${slug}/members/${memberId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", slug] });
      toast.success("Member removed");
    },
    onError: () => toast.error("Failed to remove member"),
  });

  function handleSendInvite() {
    if (!inviteEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    sendInvite.mutate({ email: inviteEmail.trim(), role: inviteRole });
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-destructive">Failed to load members.</p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["members", slug] })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="text-muted-foreground">
          Manage your workspace members and invitations
        </p>
      </div>

      {/* Invite Section (admin only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Members
            </CardTitle>
            <CardDescription>
              Send an invitation to add new members to your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendInvite();
                  }}
                />
              </div>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSendInvite}
                disabled={sendInvite.isPending}
              >
                <Mail className="mr-2 h-4 w-4" />
                {sendInvite.isPending ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : data && data.invites.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited {formatDate(invite.createdAt)} &middot;{" "}
                        <Badge
                          variant="outline"
                          className={cn("capitalize text-[10px]", ROLE_COLORS[invite.role])}
                        >
                          {invite.role}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resendInvite.mutate(invite.id)}
                        disabled={resendInvite.isPending}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => revokeInvite.mutate(invite.id)}
                        disabled={revokeInvite.isPending}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
            {data && (
              <Badge variant="secondary" className="ml-2">
                {data.members.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.members.length > 0 ? (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Member</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Joined</th>
                    {isAdmin && (
                      <th className="px-4 py-3 w-10" />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.members.map((member) => (
                    <tr key={member.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.image ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn("capitalize", ROLE_COLORS[member.role])}
                        >
                          {member.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(member.joinedAt)}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          {member.role !== "owner" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    changeMemberRole.mutate({
                                      memberId: member.id,
                                      role: "admin",
                                    })
                                  }
                                  disabled={member.role === "admin"}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    changeMemberRole.mutate({
                                      memberId: member.id,
                                      role: "member",
                                    })
                                  }
                                  disabled={member.role === "member"}
                                >
                                  Make Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    changeMemberRole.mutate({
                                      memberId: member.id,
                                      role: "viewer",
                                    })
                                  }
                                  disabled={member.role === "viewer"}
                                >
                                  Make Viewer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => removeMember.mutate(member.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No members found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
