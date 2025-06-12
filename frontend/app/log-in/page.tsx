"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "../controllers/auth";

const LogIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusText, setStatusText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await authService.login(email, password);
    if (result.status) {
      router.push("/chats");
    } else {
      if (typeof result.data === "string") setStatusText(result.data);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const result = await authService.validateToken();
      if (result.status) {
        router.push("/chats");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4">
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-xl shadow-md border border-neutral-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <div>
            <p className="text-center text-red-300">{statusText}</p>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-white py-2 rounded-md hover:opacity-90 transition"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
