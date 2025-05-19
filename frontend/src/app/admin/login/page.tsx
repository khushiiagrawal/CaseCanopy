"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSignInModal from "@/components/AdminSignInModal";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const adminToken = localStorage.getItem("adminToken");
    const adminUser = localStorage.getItem("adminUser");

    if (adminToken && adminUser) {
      try {
        const userData = JSON.parse(adminUser);
        if (userData.role === "admin") {
          router.push("/admin");
        }
      } catch (err) {
        console.error("Error parsing admin user data:", err);
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#19223A] flex items-center justify-center">
      <AdminSignInModal onClose={() => router.push("/admin/login")} />
    </div>
  );
} 