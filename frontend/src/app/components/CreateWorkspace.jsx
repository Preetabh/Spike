"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CreateWorkspace = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return alert("Enter workspace name");

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error creating workspace");
        setLoading(false);
        return;
      }

      setOpen(false);
      setName("");
      setLoading(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="w-[55vw]  mx-auto px-2 mb-10">
      <div className="w-full  rounded-2xl p-5 md:p-6 flex flex-col gap-5 border border-gray-200 shadow-sm hover:shadow-md transition">

        {/* Top Section */}
        <div className="flex items-start justify-between gap-4 w-full bg-[#f6eddf] p-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <Image
              src="https://a.slack-edge.com/bv1-13/get-started-workspaces-icon-6cacbb8.svg"
              width={48}
              height={48}
              alt="workspace"
            />

            <div className="flex flex-col gap-1">
              <p className="text-sm md:text-sm  text-gray-800">
                Want to use Slack with a different team?
              </p>

              <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-xs">
                Create a new workspace for your team or project.
              </p>
            </div>
          </div>

          {/* Button Top Right */}
          <button
            onClick={() => setOpen(true)}
            className="bg-[#4A154B] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
          >
            Create New Workspace
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs md:text-sm text-gray-500">
          <p className="mb-1">Not seeing your workspace?</p>
          <Link
            href="/login"
            className="text-[#4A154B] font-medium hover:underline"
          >
            Try a different email
          </Link>
        </div>
      </div>

      {/* POPUP MODAL */}
      {open && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50 px-4 md:px-10">
          <div className="w-full max-w-4xl flex flex-col gap-5 md:gap-6 relative pb-20 md:pb-0">

            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight max-w-2xl">
              What do you want to call your workspace?
            </h1>

            <p className="text-gray-500 text-base max-w-xl">
              This will be the name of your workspace — choose something your team will easily recognize.
            </p>

            <input
              type="text"
              placeholder="Ex: Acme Marketing, Design Team, Dev Squad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-xl border border-gray-300 px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[#4A154B] text-gray-900 shadow-sm"
            />

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={loading}
                className={`px-6 py-2.5 rounded-lg transition ${
                  name
                    ? "bg-[#4A154B] text-white hover:scale-[1.02]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>

            <Image
              src="https://a.slack-edge.com/bv1-13/get-started-workspaces-icon-6cacbb8.svg"
              alt="workspace decoration"
              width={256}
              height={256}
              className="hidden md:block absolute bottom-0 right-0 w-40 lg:w-56 opacity-90 pointer-events-none"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWorkspace;
