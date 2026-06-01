"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import CreateWorkspace from "../../components/CreateWorkspace";

const Onboarding = () => {
  const router = useRouter();

  const [workspaceId, setWorkspaceId] = useState("");
  const [admin, setAdmin] = useState("");

  const fetchWorkspaces = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces`,
      {
        credentials: "include",
      }
    );

    const data = await res.json();

    // ✅ Store admin email
    setAdmin(data?.admin || "");

    // ✅ Return safe workspace array
    return Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];
  };

  const {
    data: workspaces = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,

    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        Error loading workspaces
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-[#f4ede4] to-white px-4">
      {/* Recent Workspaces */}

      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl p-4 md:p-6">
          {/* Logo */}
          <div className="flex gap-2 items-center mb-6 justify-center">
            <Image
              src="/logo.png"
              alt="Spike Logo"
              width={40}
              height={40}
            />

            <h1 className="text-3xl font-bold text-[#4A154B] tracking-tight">
              Spike
            </h1>
          </div>

          {/* Heading */}
          <div className="text-center mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Welcome back!
            </h2>

            <p className="mt-1 text-sm md:text-base text-gray-500">
              Choose a Workspace to get back to work with your team
            </p>
          </div>

          {/* Your Workspaces */}
          <div>
            <div>
              <h5 className="font-semibold">Ready to launch</h5>

              <p className="text-gray-500 text-sm">
                {admin}
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-3 max-h-[300px] overflow-y-auto no-scrollbar">
              {Array.isArray(workspaces) &&
                workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => {
                      const id = ws.id;

                      setWorkspaceId(id);

                      router.push(`/workspace/${id}`);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const id = ws.id;

                        setWorkspaceId(id);

                        router.push(`/workspace/${id}`);
                      }
                    }}
                    className={`flex w-full items-center justify-between p-3 md:p-4 border rounded-lg cursor-pointer transition ${
                      workspaceId === ws.id
                        ? "border-[#4A154B] bg-[#f4ede4]"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-md flex items-center justify-center font-bold text-gray-700 text-sm md:text-base">
                        {ws.name?.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-medium text-gray-800">
                          {ws.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {ws.members?.length || 1} members
                        </p>
                      </div>
                    </div>

                    <span className="text-gray-400">Open →</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Create Workspace */}
        <div className="w-full mt-6 flex justify-center">
          <CreateWorkspace />
        </div>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Onboarding;
