"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const Verification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const email = searchParams.get("email");

  const matchOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code 🔢");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/verifyOtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp: code
        })
      });

      const data = await res.json();

      if (data.status === "success" || res.status === 200) {
        if (data.data?.token) {
          localStorage.setItem("token", data.data.token);
        }
        toast.success("OTP Verified successfully 🚀");
        router.push("/");
      } else {
        toast.error(data.message || "Invalid OTP ❌");
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

      <div className="w-full max-w-md p-8 rounded-3xl border border-neutral-900 bg-neutral-950/70 backdrop-blur-xl shadow-2xl relative z-10 text-center flex flex-col items-center">
        {/* Logo */}
        <div className="flex justify-center mb-6 cursor-pointer animate-pulse" onClick={() => router.push("/")}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-xl shadow-md">
            S
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          We emailed you a code
        </h1>
        <p className="text-neutral-400 text-sm mb-4">
          Enter the 6-digit verification code sent to
        </p>

        <div className="flex items-center justify-center gap-2 mb-8 bg-neutral-900/60 border border-neutral-850 px-3.5 py-1.5 rounded-full">
          <p className="text-purple-400 text-xs font-semibold">{email}</p>
          <button
            onClick={() => router.back()}
            className="text-neutral-500 hover:text-white transition cursor-pointer text-xs"
            title="Edit email"
          >
            ✏️
          </button>
        </div>

        {/* OTP Boxes */}
        <div className="flex justify-center gap-2.5 mb-8 w-full">
          {Array(6)
            .fill("")
            .map((_, i) => (
              <input
                key={i}
                maxLength={1}
                value={otp[i]}
                onChange={(e) => {
                  const val = e.target.value;
                  const newOtp = [...otp];
                  newOtp[i] = val;
                  setOtp(newOtp);

                  if (val && e.target.nextSibling) {
                    e.target.nextSibling.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[i] && e.target.previousSibling) {
                    e.target.previousSibling.focus();
                  }
                }}
                className="w-12 h-12 text-center text-lg font-bold border border-neutral-850 bg-neutral-900/40 text-white rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
            ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={matchOtp}
          className="w-full bg-white hover:bg-neutral-200 text-black py-3.5 rounded-xl font-bold mb-6 shadow-md transition transform active:scale-98"
          disabled={loading}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="w-5 h-5 border-2 border-neutral-850 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            "Verify & Continue"
          )}
        </button>

        {/* Resend Helper */}
        <p className="text-neutral-500 text-xs mb-6">
          Didn’t receive the email? Check your spam folder.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 items-center w-full border-t border-neutral-900 pt-6">
          <button
            onClick={() => window.open("https://mail.google.com", "_blank")}
            className="border border-neutral-850 hover:bg-neutral-900/50 bg-neutral-950/30 text-white py-3 rounded-xl font-semibold transition w-full text-center text-sm"
          >
            Open Gmail
          </button>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Verification;
