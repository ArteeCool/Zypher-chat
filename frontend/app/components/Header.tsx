"use client";

import { useRouter } from "next/navigation";
import logo from "../../public/logo.png";
import Button from "../utilities/Button";
import { authService } from "../controllers/auth";
import { useAuthStatus } from "../hooks/useAuthStatus";

const Header = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthStatus();

  return (
    <div className="w-full h-24">
      <div className="max-w-7xl mx-auto w-full h-full flex justify-between items-center px-3">
        <img className="h-full" src={logo.src} alt="Zypher logo" />
        {!isLoggedIn ? (
          <div className="flex gap-4">
            <Button variant="filled" onClick={() => router.push("/sign-up")}>
              Sign Up
            </Button>
            <Button variant="filled" onClick={() => router.push("/log-in")}>
              Log In
            </Button>
          </div>
        ) : (
          <div>
            <Button
              variant="filled"
              onClick={() => {
                authService.logout();
                router.push("/");
              }}
            >
              Log out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
