"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FadeIn } from "@/components/ui/motion";
import { toast } from "sonner";
import Link from "next/link";

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfile = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      update();
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Passwords don't match");
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="mx-auto w-full max-w-3xl p-6 md:p-8 space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display text-3xl font-bold tracking-[-0.02em] text-[var(--fg)]">Account Settings</h1>
              <p className="text-sm text-[var(--fg-muted)] mt-1">Manage your profile, security, and preferences</p>
            </div>
            <Link href="/account/workspaces">
              <Button variant="outline" size="sm">Back to workspaces</Button>
            </Link>
          </div>
        </FadeIn>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardHeader>
                <CardTitle className="tracking-[-0.01em]">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={session?.user?.email || ""} disabled />
                  <p className="text-xs text-[var(--fg-subtle)]">Email cannot be changed</p>
                </div>
                <Button
                  variant="aurora"
                  onClick={() => updateProfile.mutate()}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? "Saving..." : "Save changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardHeader>
                <CardTitle className="tracking-[-0.01em]">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Current password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>New password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <p className="text-xs text-[var(--fg-subtle)]">Use at least 8 characters with a mix of letters and numbers.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm new password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  variant="aurora"
                  onClick={() => changePassword.mutate()}
                  disabled={changePassword.isPending || !currentPassword || !newPassword}
                >
                  {changePassword.isPending ? "Changing..." : "Change password"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[color-mix(in_oklab,var(--danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--danger)_5%,transparent)]">
              <CardHeader>
                <CardTitle className="text-[var(--danger)] tracking-[-0.01em]">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--fg-muted)] mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardHeader>
                <CardTitle className="tracking-[-0.01em]">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--fg-muted)]">
                  Notification preferences are coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
