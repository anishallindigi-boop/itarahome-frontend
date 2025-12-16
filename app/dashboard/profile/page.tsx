"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { User, Mail, Phone, MapPin, Pencil, Save, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getuser, updateprofile } from "@/redux/slice/AuthSlice";
import type { RootState } from "@/redux/store";
import { toast } from "sonner";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state: RootState) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    dispatch(getuser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        street: user.addresses?.street || "",
        city: user.addresses?.city || "",
        state: user.addresses?.state || "",
        zipCode: user.addresses?.zipCode || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await dispatch(updateprofile(form)).unwrap();
      toast.success("Profile updated!");
      setEditMode(false);
    } catch (err: any) {
      toast.error(err);
    }
  };

  if (!user || loading) {
    return <p className="text-center py-20 text-gray-500">Loading profile...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 items-center">
        {/* Avatar */}
        <div className="relative w-28 h-28 rounded-full overflow-hidden border">
          <img
            src="/avatar-placeholder.png"
            alt="User Avatar"
        
            className="object-cover"
          />
        </div>

        {/* Basic Info */}
        <div className="flex-1">
          {editMode ? (
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Name"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Email"
              />
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Phone"
              />
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  onClick={() => setEditMode(false)}
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              {user.phone && <p className="text-gray-500">{user.phone}</p>}
              <button
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold text-lg mb-3">Address</h3>
        {editMode ? (
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              name="street"
              value={form.street}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              placeholder="Street"
            />
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              placeholder="City"
            />
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              placeholder="State"
            />
            <input
              type="text"
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              placeholder="ZIP Code"
            />
          </div>
        ) : user.addresses ? (
          <div className="text-gray-700">
            <p>{user.addresses.street}</p>
            <p>
              {user.addresses.city}, {user.addresses.state}
            </p>
            <p>{user.addresses.zipCode}</p>
          </div>
        ) : (
          <p className="text-gray-500">No address added yet.</p>
        )}
      </div>
    </div>
  );
}
