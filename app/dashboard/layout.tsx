'use client';

import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { LogOut, User, Package, Heart, Settings, HelpCircle } from "lucide-react";
import { logoutuser } from "@/redux/slice/AuthSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutuser());
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 mt-1">{user?.name}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard/profile" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition">
            <User className="w-5 h-5 text-indigo-600" /> Profile
          </Link>
          <Link href="/dashboard/orders" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition">
            <Package className="w-5 h-5 text-green-600" /> Orders
          </Link>
          <Link href="/dashboard/wishlist" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition">
            <Heart className="w-5 h-5 text-red-600" /> Wishlist
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition">
            <Settings className="w-5 h-5 text-yellow-600" /> Settings
          </Link>
          <Link href="/dashboard/help" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition">
            <HelpCircle className="w-5 h-5 text-blue-600" /> Help Center
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto w-full flex items-center gap-2 py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
