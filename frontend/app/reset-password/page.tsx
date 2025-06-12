"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log(token);
      const res = await axios.post(
        `https://109.95.33.158:5678/api/auth/reset-password/${token}`,
        { newPassword }
      );
      setMessage(res.data.msg || "Password reset successful.");
      router.push("/");
    } catch (err: any) {
      setMessage(err.response?.data?.msg || "Error resetting password.");
    }
  };

  if (!token) {
    return <p className="text-red-500">Invalid or missing token.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 shadow-lg rounded-lg bg-neutral-700">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          type="submit"
        >
          Set New Password
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-white">{message}</p>}
    </div>
  );
}
