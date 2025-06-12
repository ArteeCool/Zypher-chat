"use client";

import YourMessage from "./components/YourMessage";
import OpponentMessage from "./components/OpponentMessage";
import { useEffect } from "react";
import { authService } from "./controllers/auth";
import { useRouter } from "next/navigation";
import { randomInt } from "crypto";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const result = await authService.validateToken();
      if (result.status) {
        router.push("/chats");
      }
    };

    checkAuth();
  }, []);
  return (
    <div className="min-h-[92.25vh] flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Best Chat App Zypher!
      </h1>

      <div className="w-full max-w-2xl bg-neutral-800 border border-neutral-700 rounded-2xl shadow-md p-6 space-y-4 flex flex-col">
        <YourMessage timestamp={new Date(10000000000)}>What's up?</YourMessage>
        <OpponentMessage timestamp={new Date(10002000000)}>
          Everything's great! You?
        </OpponentMessage>
      </div>
    </div>
  );
}
