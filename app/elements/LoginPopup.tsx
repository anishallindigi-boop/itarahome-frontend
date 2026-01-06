"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { RootState } from "@/redux/store";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  sendOTP,
  createuser,
  verifyotp,
  resetState,
} from "@/redux/slice/AuthSlice";

type Step = "login" | "signup" | "otp";

export default function LoginPopup({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    loading,
    error,
    message,
    isOTPSent,
    isOTPVerified,
    isRegistered,
  } = useAppSelector((state: RootState) => state.auth);

  const [step, setStep] = useState<Step>("login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
    addresses: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  /* ---------- RESET ON OPEN ---------- */
  useEffect(() => {
    dispatch(resetState());
  }, [dispatch]);

  /* ---------- TOASTS ---------- */
  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
  }, [message, error]);

  /* ---------- SIGNUP → SEND OTP ---------- */
  useEffect(() => {
    if (isRegistered && signupForm.phone) {
      dispatch(sendOTP({ phone: signupForm.phone }));
    }
  }, [isRegistered]);

  /* ---------- OTP SENT → OTP SCREEN ---------- */
  useEffect(() => {
    if (isOTPSent) setStep("otp");
  }, [isOTPSent]);

  /* ---------- OTP VERIFIED → LOGIN ---------- */
  useEffect(() => {
    if (isOTPVerified) {
      toast.success("Login successful");
      router.refresh();
      dispatch(resetState());
      onClose();
    }
  }, [isOTPVerified]);

  /* ---------- HANDLERS ---------- */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(sendOTP({ phone }));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createuser(signupForm));
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(verifyotp({ phone, otp }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("addresses.")) {
      const field = name.split(".")[1];
      setSignupForm({
        ...signupForm,
        addresses: {
          ...signupForm.addresses,
          [field]: value,
        },
      });
    } else {
      setSignupForm({ ...signupForm, [name]: value });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
        {/* CLOSE */}
        <button
          onClick={() => {
            dispatch(resetState());
            onClose();
          }}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === "otp"
              ? "Verify OTP"
              : step === "signup"
              ? "Create Account"
              : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === "otp"
              ? "Enter the OTP sent to your phone"
              : "Login or create a new account"}
          </p>
        </div>

        {/* TABS */}
        {step !== "otp" && (
          <div className="flex mb-6 border rounded-xl overflow-hidden">
            {["login", "signup"].map((t) => (
              <button
                key={t}
                onClick={() => setStep(t as Step)}
                className={`flex-1 py-2 font-semibold transition ${
                  step === t
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {t === "login" ? "Login" : "Signup"}
              </button>
            ))}
          </div>
        )}

        {/* LOGIN */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-10 p-3 border rounded-xl"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* SIGNUP */}
        {step === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="name"
                placeholder="Name"
                value={signupForm.name}
                onChange={handleSignupChange}
                required
                className="w-full pl-10 p-3 border rounded-xl"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={signupForm.email}
                onChange={handleSignupChange}
                required
                className="w-full pl-10 p-3 border rounded-xl"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="phone"
                placeholder="Phone"
                value={signupForm.phone}
                onChange={(e) => {
                  handleSignupChange(e);
                  setPhone(e.target.value);
                }}
                required
                className="w-full pl-10 p-3 border rounded-xl"
              />
            </div>

            <input
              name="addresses.street"
              placeholder="Street Address"
              value={signupForm.addresses.street}
              onChange={handleSignupChange}
              required
              className="w-full p-3 border rounded-xl"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                name="addresses.city"
                placeholder="City"
                value={signupForm.addresses.city}
                onChange={handleSignupChange}
                required
                className="w-full p-3 border rounded-xl"
              />
              <input
                name="addresses.state"
                placeholder="State"
                value={signupForm.addresses.state}
                onChange={handleSignupChange}
                required
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <input
              name="addresses.zipCode"
              placeholder="Zip Code"
              value={signupForm.addresses.zipCode}
              onChange={handleSignupChange}
              required
              className="w-full p-3 border rounded-xl"
            />

            <button
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        )}

        {/* OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full text-center tracking-widest text-lg p-3 border rounded-xl"
            />

            <button
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => setStep("login")}
              className="block mx-auto text-sm text-gray-500 hover:underline"
            >
              Change number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
