"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg font-semibold">
        NEXT_PUBLIC_BASE_URL is missing in .env.local
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f0ff] via-white to-[#faf5ff] flex flex-col items-center px-4 py-8">
      {/* Logo */}
      <div className="mb-7 flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="Spike"
          width={80}
          height={80}
          className="mb-4"
        />

        <h1 className="text-3xl md:text-5xl font-bold text-center tracking-tight">
          Join <span className="text-[#611f69]">Spike</span>
        </h1>

        <p className="mt-3 text-gray-600 text-center text-sm md:text-base max-w-lg leading-7">
          Spike is where modern teams collaborate, chat and build projects
          together.
        </p>
      </div>

      {/* Invite Card */}
      <div className="w-full max-w-md border border-[#e5d6f3] rounded-3xl p-7 shadow-xl bg-white">
        {errorMessage ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#a75ebf] flex items-center justify-center text-white text-2xl font-bold shadow-md">
            V
          </div>

          <p className="mt-4 text-gray-700 text-base">
            You are accepting an invitation to join:
          </p>

          <h2 className="text-2xl font-bold mt-2 text-[#611f69]">
            {loadingWorkspace
              ? "Loading workspace..."
              : workspaceData?.workspace?.name || "Workspace"}
          </h2>

          <p className="mt-4 text-gray-500 text-sm leading-6 max-w-sm">
            {loadingWorkspace
              ? "Fetching workspace details..."
              : `You have been invited by ${
                  workspaceData?.invitedBy ?? "a team member"
                }`}
          </p>
        </div>

        {/* Name Input */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#611f69] focus:ring-2 focus:ring-[#611f69]/20 transition-all"
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
          className="w-full mt-5 bg-[#611f69] hover:bg-[#4a154b] text-white py-3 rounded-xl font-semibold text-base transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loadingWorkspace ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Loading...
            </>
          ) : isPending ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Joining Workspace...
            </>
          ) : isInviteInvalid ? (
            "Cannot Join"
          ) : (
            "Join Workspace"
          )}
        </button>

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center mt-6 leading-5">
          By continuing, you agree to Spike's Terms of Service and Privacy
          Policy.
        </p>
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
