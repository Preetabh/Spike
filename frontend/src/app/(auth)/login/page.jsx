"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const sendOtp = async () => {
    if (!email.trim()) {
      toast.error("Please enter a valid email address 📧");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/sendOtp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send OTP ❌");
        setLoading(false);
        return;
      }

      if (data.status === "success" || res.status === 200) {
        toast.success("OTP sent successfully 🚀");
        router.push(`/verification?email=${email}`);
      } else {
        toast.error(data.message || "Failed to send OTP ❌");
      }

      setLoading(false);
    } catch (error) {
      toast.error("Server error ❌");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-[#f4f4f5] px-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-3xl border border-neutral-900 bg-neutral-950/70 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Logo */}
        <div className="flex gap-2.5 items-center mb-8 justify-center cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-xl shadow-md">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Spike
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2.5 text-sm text-neutral-400">
            Enter your work email address to continue to Spike.
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            className="border border-neutral-800 bg-neutral-900/40 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/80 placeholder:text-neutral-600 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          onClick={sendOtp}
          className="w-full bg-white hover:bg-neutral-200 text-black py-3.5 rounded-xl font-bold mt-6 shadow-md transition transform active:scale-98"
          disabled={loading}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="w-5 h-5 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            "Send verification code"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-neutral-900"></div>
          <span className="px-3 text-xs text-neutral-600 uppercase tracking-widest font-semibold">OR</span>
          <div className="flex-1 h-[1px] bg-neutral-900"></div>
        </div>

        {/* Google Button */}
        <button className="w-full border border-neutral-850 hover:bg-neutral-900/50 bg-neutral-950/30 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 transition">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png"
            alt="Google"
            width={20}
            height={20}
          />
          Continue with Google
        </button>

        {/* Footer Text */}
        <p className="text-neutral-500 text-[11px] mt-8 text-center leading-relaxed">
          By continuing, you agree to our <span className="text-neutral-400 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-neutral-400 cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Login;
