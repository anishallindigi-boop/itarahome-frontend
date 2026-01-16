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
  LayoutDashboard,
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
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Orders", href: "/dashboard/orders", icon: Package },
    // { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
    // { name: "Settings", href: "/dashboard/settings", icon: Settings },
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
    <div className="min-h-screen bg-gray-50 flex py-20">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-white border-r shadow-xl flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-indigo-600">My Account</h2>
          <p className="text-sm text-gray-500">
            Welcome, <span className="font-medium">{user?.name}</span>
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
         {menu.map(({ name, href, icon: Icon }) => { const active = pathname === href; return ( <Link key={href} href={href} className={clsx( "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all", active ? "bg-primary text-white shadow-lg" : "!text-white hover:bg-primary" )} > <Icon className={clsx( "w-5 h-5 transition", active ? "text-white" : "text-gray-500 group-hover:text-white" )} /> <span className={clsx( "font-medium", active ? "!text-white" : "text-gray-500 group-hover:!text-white" )}>{name}</span> </Link> ); })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 lg:px-8 pt-6 pb-24 lg:pb-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 min-h-screen">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <MobileBottomNav />
    </div>
  );
}


const MobileBottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-inner">
      <div className="flex justify-between px-6 py-2">
        {menu.map(({ name, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200",
                active
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-indigo-600"
              )}
            >
              <div
                className={clsx(
                  "p-2 rounded-full transition-all duration-200",
                  active
                    ? "bg-indigo-100 scale-110"
                    : "hover:bg-gray-100"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className={clsx(active ? "font-semibold" : "font-normal")}>
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
