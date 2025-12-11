"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { sendOTP, resetState } from "@/redux/slice/AuthSlice";
import { RootState } from "@/redux/store";

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { loading, error, isOTPSent } = useAppSelector(
    (state: RootState) => state.auth
  );

  const [phone, setPhone] = useState("");
  const [localError, setLocalError] = useState("");

  // -------------------
  // Handle OTP request
  // -------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!phone || phone.length < 10) {
      setLocalError("Please enter a valid phone number");
      return;
    }

    dispatch(sendOTP({ phone }));
  };

  // -------------------
  // Redirect on success
  // -------------------
  useEffect(() => {
    if (isOTPSent) {
      dispatch(resetState());
      router.push(`/auth/verify-otp?phone=${phone}`);
    }
  }, [isOTPSent]);

  return (
    <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">

        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Login
        </h2>

        {localError && (
          <p className="text-sm text-red-600 text-center mb-3">{localError}</p>
        )}

        {error && (
          <p className="text-sm text-red-600 text-center mb-3">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-gray-700 text-sm">Phone Number</label>
            <input
              required
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-2 p-3 border rounded-xl focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Enter mobile number"
              inputMode="tel"
              maxLength={15}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-medium bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <a href="/signup" className="text-indigo-600 font-medium">
            Sign Up
          </a>
        </p>
      </div>
    </section>
  );
}
