"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { getuser } from "@/redux/slice/AuthSlice";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getuser());
  }, [dispatch]);

  return <>{children}</>;
}
