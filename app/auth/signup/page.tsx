'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from '@/redux/store';
import { useAppDispatch,useAppSelector } from '@/redux/hooks';
import { createuser, resetState } from "@/redux/slice/AuthSlice";


export default function Page() {
  const router = useRouter();
  const dispatch=useAppDispatch()

  const { loading, error, isRegistered } = useAppSelector(
    (state: RootState) => state.auth
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createuser(form));
  };

  useEffect(() => {
    if (isRegistered) {
      dispatch(resetState()); // reset flags for next step
      router.push(`/auth/verify-otp?phone=${form.phone}`);
    }
  }, [isRegistered]);

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        {error && <p className="text-red-600 text-center">{error}</p>}
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="w-full p-3 border rounded" />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full p-3 border rounded" />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required className="w-full p-3 border rounded" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full p-3 border rounded" />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded">{loading ? "Creating..." : "Sign Up"}</button>
      </form>
    </section>
  );
}
