"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, AlertTriangle, ArrowLeft, Users, Sparkles } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const InvitePage = () => {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const router = useRouter();

  const [workspaceData, setWorkspaceData] = useState(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        if (!id) {
          setErrorMessage("Invite link is invalid.");
          setLoadingWorkspace(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces/invite/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Invalid invite link");
        }

        setWorkspaceData(data);
        setErrorMessage("");
      } catch (error) {
        console.error("Workspace Fetch Error:", error);

        const message =
          error?.message || "Failed to load workspace. Invite may be invalid.";
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setLoadingWorkspace(false);
      }
    };

    fetchWorkspace();
  }, [id]);

  const { mutate: acceptInvite, isPending } = useMutation({
    mutationFn: async () => {
      if (!id) {
        throw new Error("Invite token missing");
      }

      if (!name.trim()) {
        throw new Error("Please enter your name");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces/invite/${id}/accept`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to join workspace");
      }

      return data;
    },

    onSuccess: (data) => {
      toast.success("Workspace joined successfully 🎉");

      setTimeout(() => {
        router.push(`/workspace/${data?.workspace?.id}`);
      }, 1200);
    },

    onError: (error) => {
      console.error("Join Workspace Error:", error);

      const message = error?.message || "Invitation link expired or invalid.";
      setErrorMessage(message);
      toast.error(message);
    },
  });

  const isInviteInvalid = Boolean(errorMessage || !workspaceData?.workspace);

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg font-semibold bg-background">
        NEXT_PUBLIC_BASE_URL is missing in .env.local
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none animate-fade-in">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-bg-blob-1"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[120px] pointer-events-none animate-bg-blob-2"></div>
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>

      {/* Tech Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        
        {/* Logo and Brand Header */}
        <div className="mb-7 flex flex-col items-center text-center animate-slide-up">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center bg-card/45 backdrop-blur-md rounded-2xl border border-border/40 p-2 shadow-lg animate-float-3d">
            <Image
              src="/logo.png"
              alt="Spike"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Join <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Spike</span>
          </h1>

          <p className="mt-2.5 text-muted-foreground text-sm max-w-xs leading-relaxed">
            Spike is where modern teams collaborate, chat and build projects together.
          </p>
        </div>

        {/* Invite Card */}
        <div className="w-full rounded-3xl border border-border/40 bg-card/45 backdrop-blur-xl p-8 shadow-2xl shadow-primary/5 animate-slide-up">
          
          {loadingWorkspace ? (
            /* Loading State */
            <div className="flex flex-col items-center py-8">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
              </div>
              <p className="mt-4 text-muted-foreground text-sm font-medium animate-pulse">
                Fetching workspace details...
              </p>
            </div>
          ) : isInviteInvalid ? (
            /* Error State */
            <div className="flex flex-col items-center py-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 shadow-inner">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1.5">Invitation Error</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">
                {errorMessage || "Failed to load workspace. Invite may be invalid or expired."}
              </p>
              <button
                onClick={() => router.push("/login")}
                className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Login
              </button>
            </div>
          ) : (
            /* Content State */
            <div className="flex flex-col">
              
              {/* Workspace Header Details */}
              <div className="flex flex-col items-center text-center">
                <div className="relative group/avatar mb-4">
                  <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-primary to-accent opacity-25 blur-sm group-hover/avatar:opacity-50 transition duration-300"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                    {workspaceData?.workspace?.name ? workspaceData.workspace.name.charAt(0).toUpperCase() : "W"}
                  </div>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  You have been invited to join
                </p>

                <h2 className="text-2xl font-extrabold mt-1 text-foreground tracking-tight">
                  {workspaceData?.workspace?.name}
                </h2>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                  <Users size={12} />
                  <span>Invited by {workspaceData?.invitedBy ?? "a team member"}</span>
                </div>
              </div>

              {/* Name Input */}
              <div className="mt-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Your Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-background/50 border border-border/80 text-foreground px-4 py-3 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground/60 transition duration-200"
                />
              </div>

              {/* Continue Button */}
              <button
                onClick={() => acceptInvite()}
                disabled={
                  isPending ||
                  loadingWorkspace ||
                  isInviteInvalid ||
                  !name.trim()
                }
                className="w-full mt-6 bg-primary hover:bg-primary/95 text-primary-foreground py-3.5 rounded-xl font-bold shadow-lg shadow-primary/15 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Joining Workspace...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Join Workspace
                  </>
                )}
              </button>

            </div>
          )}

          {/* Terms Footer */}
          <p className="text-[11px] text-muted-foreground text-center mt-7 leading-relaxed">
            By continuing, you agree to Spike's{" "}
            <span className="text-foreground/80 hover:text-foreground hover:underline cursor-pointer transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-foreground/80 hover:text-foreground hover:underline cursor-pointer transition-colors">
              Privacy Policy
            </span>.
          </p>

        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e1e1e",
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "14px",
          },
        }}
      />
    </div>
  );
};

export default InvitePage;

