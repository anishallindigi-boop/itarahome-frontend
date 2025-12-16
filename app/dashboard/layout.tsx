'use client';

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import {
  LogOut,
  User,
  Package,
  Heart,
  Settings,
  HelpCircle,
} from "lucide-react";
import { logoutuser } from "@/redux/slice/AuthSlice";
import { toast } from "sonner";
import clsx from "clsx";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menu = [
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Orders", href: "/dashboard/orders", icon: Package },
  { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help Center", href: "/dashboard/help", icon: HelpCircle },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { user, isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = () => {
    dispatch(logoutuser());
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, <span className="font-medium">{user?.name}</span>
          </p>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menu.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  active
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon
                  className={clsx(
                    "w-5 h-5 transition",
                    active ? "text-white" : "text-gray-500 group-hover:text-indigo-600"
                  )}
                />
                <span className="font-medium">{name}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
