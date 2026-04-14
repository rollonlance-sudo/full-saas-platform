"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = params.token as string;

  const [state, setState] = useState<"loading" | "preview" | "accepting" | "success" | "error">("loading");
  const [invite, setInvite] = useState<{
    workspaceName: string;
    inviterName: string;
    role: string;
    email: string;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvite();
  }, [token]);

  const fetchInvite = async () => {
    try {
      const res = await fetch(`/api/invites/${token}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid or expired invite.");
      }
      const data = await res.json();
      setInvite(data);
      setState("preview");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid invite link.");
      setState("error");
    }
  };

  const handleAccept = async () => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/invite/${token}`);
      return;
    }

    setState("accepting");
    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to accept invite.");
      }

      const data = await res.json();
      setState("success");

      setTimeout(() => {
        router.push(`/workspace/${data.workspaceSlug}`);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept invite.");
      setState("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-2xl">FlowBoard</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          {state === "loading" && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading invite...</p>
            </div>
          )}

          {state === "preview" && invite && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                You&apos;re invited!
              </h1>
              <p className="text-gray-600 mb-6">
                <span className="font-medium text-gray-900">{invite.inviterName}</span>{" "}
                has invited you to join{" "}
                <span className="font-medium text-gray-900">{invite.workspaceName}</span>{" "}
                as a <span className="font-medium capitalize">{invite.role}</span>.
              </p>

              {status === "unauthenticated" && (
                <p className="text-sm text-gray-500 mb-4">
                  You&apos;ll need to log in or create an account to accept this invite.
                </p>
              )}

              <div className="space-y-3">
                <Button onClick={handleAccept} className="w-full" size="lg">
                  {status === "unauthenticated" ? "Log in to Accept" : "Accept Invite"}
                </Button>
                <Link href="/">
                  <Button variant="ghost" className="w-full">
                    Decline
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {state === "accepting" && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Joining workspace...</p>
            </div>
          )}

          {state === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome aboard!</h2>
              <p className="text-gray-600">
                You&apos;ve joined the workspace. Redirecting you now...
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/">
                <Button variant="outline">Go to Homepage</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
