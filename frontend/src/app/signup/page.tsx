"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  const router = useRouter();

  return <AuthForm mode="signup" onClose={() => router.push("/")} />;
}
