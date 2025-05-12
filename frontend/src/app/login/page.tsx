"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  const router = useRouter();

  return <AuthForm mode="login" onClose={() => router.push("/")} />;
}
