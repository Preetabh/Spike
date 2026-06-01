"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-white text-gray-800">
      {/* NAVBAR */}
      <nav className="w-full flex items-center justify-between px-6 md:px-12 py-4 border-b">
        <h1 className="text-2xl font-bold text-[#4A154B]">Slack</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/login")}
            className="text-[#4A154B] font-semibold"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="bg-[#4A154B] text-white px-4 py-2 rounded-md font-semibold hover:opacity-90"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center px-6 md:px-12 py-20 bg-[#f4ede4]">
        <h2 className="text-4xl md:text-6xl font-bold text-[#4A154B] mb-6 leading-tight">
          Made for people. <br /> Built for productivity.
        </h2>
        <p className="max-w-2xl text-lg md:text-xl text-gray-700 mb-8">
          Connect your team, automate workflows, and stay productive with Slack —
          your all-in-one collaboration platform.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => router.push("/signup")}
            className="bg-[#4A154B] text-white px-8 py-4 rounded-md text-lg font-semibold hover:scale-105 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => router.push("/login")}
            className="border border-[#4A154B] text-[#4A154B] px-8 py-4 rounded-md text-lg font-semibold hover:bg-[#4A154B] hover:text-white transition"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 md:px-16 py-20 grid md:grid-cols-3 gap-10">
        <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-3 text-[#4A154B]">
            Real-time Messaging
          </h3>
          <p className="text-gray-600">
            Stay connected with your team using instant messaging, channels,
            and group discussions.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-3 text-[#4A154B]">
            File Sharing
          </h3>
          <p className="text-gray-600">
            Share documents, images, and files seamlessly with your team members.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-3 text-[#4A154B]">
            Integrations
          </h3>
          <p className="text-gray-600">
            Connect with tools like Google Drive, GitHub, and more to boost productivity.
          </p>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-[#4A154B] text-white text-center py-20 px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to transform your workflow?
        </h2>
        <p className="mb-8 text-lg text-gray-200">
          Join thousands of teams already using Slack to get work done faster.
        </p>
        <button
          onClick={() => router.push("/signup")}
          className="bg-white text-[#4A154B] px-8 py-4 rounded-md font-semibold text-lg hover:scale-105 transition"
        >
          Get Started Now
        </button>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} Slack Clone. Built by Vishu 🚀
      </footer>
    </div>
  );
};

export default Page;
