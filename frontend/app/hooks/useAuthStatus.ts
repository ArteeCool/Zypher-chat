"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authService } from "../controllers/auth";

export const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const result = await authService.validateToken();
      setIsLoggedIn(result.status);
    };

    checkAuth();
  }, [pathname]);

  return { isLoggedIn };
};
