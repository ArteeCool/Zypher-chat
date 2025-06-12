"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "../controllers/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://109.95.33.158:5678/api/auth/forgot-password",
        {
          email,
        }
      );

      authService.sendResetPassword(email, res.data.resetLink);

      console.log(res);

      setMessage("Reset link sent");
    } catch (err: any) {
      setMessage(err.response?.data?.msg);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 shadow-lg rounded-lg bg-neutral-700">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full border p-2 rounded"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          type="submit"
        >
          Send Reset Link
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm text-white whitespace-pre-wrap">{message}</p>
      )}
    </div>
  );
}
