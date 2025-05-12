"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { mockCases } from "@/utils/mockData";
import CaseCard from "@/components/CaseCard";
import { getAuthState } from "@/utils/auth";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const results = mockCases;

  useEffect(() => {
    const authState = getAuthState();
    if (!authState?.token) {
      router.push("/login");
      return;
    }

    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  const query = searchParams.get("q");
  const searchType = searchParams.get("type");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        <p className="mt-2 text-gray-600">
          {results.length} results for &quot;{query}&quot; using {searchType}{" "}
          search
        </p>
      </div>

      <div className="space-y-6">
        {results.map((legalCase) => (
          <CaseCard key={legalCase.id} case={legalCase} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search query or filters to find what you&apos;re
            looking for.
          </p>
        </div>
      )}
    </div>
  );
}
