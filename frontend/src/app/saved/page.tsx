"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mockCases } from "@/utils/mockData";
import CaseCard from "@/components/CaseCard";
import { getAuthState } from "@/utils/auth";
import { Bookmark } from "lucide-react";

export default function SavedCasesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const savedCases = mockCases.slice(0, 2); // Mock saved cases

  useEffect(() => {
    const authState = getAuthState();
    if (!authState?.token) {
      router.push("/login");
      return;
    }

    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-white dark:from-blue-900/30 dark:via-gray-900 dark:to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-blue-900/30 dark:via-gray-900 dark:to-gray-900" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-white dark:from-blue-900/30 dark:via-gray-900 dark:to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-blue-900/30 dark:via-gray-900 dark:to-gray-900" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="mb-8">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 mb-3">
            <Bookmark className="h-4 w-4 mr-1.5" />
            <span className="text-sm font-medium">Your Collection</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Saved Cases
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Access your bookmarked legal precedents
          </p>
        </div>

        <div className="space-y-6">
          {savedCases.map((legalCase) => (
            <div
              key={legalCase.id}
              className="transform transition-all duration-300 hover:-translate-y-1"
            >
              <CaseCard case={legalCase} />
            </div>
          ))}
        </div>

        {savedCases.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-modern glass">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
              <Bookmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No saved cases yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Start searching for cases and bookmark the ones you want to save
              for later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
