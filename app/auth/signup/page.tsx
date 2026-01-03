'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createuser, resetState } from "@/redux/slice/AuthSlice";

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { loading, error, isRegistered } = useAppSelector(
    (state: RootState) => state.auth
  );

  // step control
  const [step, setStep] = useState(1);

  // full form data
  const [form, setForm] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("addresses.")) {
      const field = name.split(".")[1];
      setForm({
        ...form,
        addresses: {
          ...form.addresses,
          [field]: value,
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // final submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createuser(form));
  };

  useEffect(() => {
    if (isRegistered) {
      dispatch(resetState());
      router.push(`/auth/verify-otp?phone=${form.phone}`);
    }
  }, [isRegistered]);

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">
          {step === 1 ? "Create Account" : "Address Details"}
        </h2>

        {error && <p className="text-red-600 text-center">{error}</p>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white p-3 rounded"
            >
              Next
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              name="addresses.street"
              placeholder="Street"
              value={form.addresses.street}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <input
              name="addresses.city"
              placeholder="City"
              value={form.addresses.city}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <input
              name="addresses.state"
              placeholder="State"
              value={form.addresses.state}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <input
              name="addresses.zipCode"
              placeholder="Zip Code"
              value={form.addresses.zipCode}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full border p-3 rounded"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white p-3 rounded"
              >
                {loading ? "Creating..." : "Submit"}
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Have an account?{" "}
            <a href="/auth/login" className="text-indigo-600 font-medium">
              Login
            </a>
          </p>
        )}
      </form>
    </section>
  );
}
  