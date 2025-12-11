"use client";                // ← must be a client component
import { usePathname } from "next/navigation";
import Header from "./Header";

export function HeaderGuard() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  return isAdmin ? null : <Header />;
}