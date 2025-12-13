'use client';

import React from "react";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";

export default function ProfilePage() {
  const { user } = useAppSelector((state: RootState) => state.auth);

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="space-y-2 text-gray-700">
        <p><span className="font-semibold">Name:</span> {user?.name}</p>
        <p><span className="font-semibold">Email:</span> {user?.email}</p>
        <p><span className="font-semibold">Phone:</span> {user?.phone}</p>
      </div>
    </div>
  );
}
