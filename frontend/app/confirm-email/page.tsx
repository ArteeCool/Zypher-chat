"use client";

import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function ConfirmEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      console.log("Token:", token);
      axios
        .post(`https://109.95.33.158:5678/api/auth/confirm-email/${token}`)
        .then(() => {
          router.push("/");
        });
    }
  }, [token]);

  return <p>Confirming your email...</p>;
}
