"use client";
// "use client";

// import { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// import { getuser } from "@/redux/slice/AuthSlice";

// export default function AuthProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const dispatch = useAppDispatch();
//   const { isAuthenticated } = useAppSelector((state) => state.auth);

//   useEffect(() => {
//     // Only fetch user if already authenticated (has token)
//     const token = document.cookie.includes('token') || 
//                   localStorage.getItem('token') || 
//                   sessionStorage.getItem('token');
    
//     if (token || isAuthenticated) {
//       dispatch(getuser());
//     }
//   }, [dispatch, isAuthenticated]);

//   return <>{children}</>;
// }



import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getuser } from "@/redux/slice/AuthSlice";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Always try to get user on mount - the cookie will be sent automatically
    // withCredentials: true in your axios config handles this
    dispatch(getuser()).finally(() => {
      setHasChecked(true);
    });
  }, [dispatch]);

  // Optional: Prevent flash of unauthenticated content
  if (!hasChecked && loading) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}