"use client"; // must be first line

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/redux/store";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { verifyotp, resetState } from "@/redux/slice/AuthSlice";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // make sure phone is read client-side
  const phone = searchParams?.get("phone") || "";

  const dispatch: AppDispatch = useAppDispatch();
  const { loading, error, isOTPVerified } = useAppSelector(
    (state: RootState) => state.auth
  );

  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(verifyotp({ phone, otp }));
  };

  useEffect(() => {
    if (isOTPVerified) {
      dispatch(resetState());
      router.push("/admin"); // redirect to dashboard
    }
  }, [isOTPVerified, router, dispatch]);

  // Render nothing if phone is not available (important in RSC)
  if (!phone) return null;

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Verify OTP</h2>
        <p className="text-center text-gray-600">Enter the OTP sent to {phone}</p>
        {error && <p className="text-red-600 text-center">{error}</p>}
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          required
          className="w-full p-3 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </section>
  );
}
