"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mockCases } from "@/utils/mockData";
import { LegalCase } from "@/utils/mockData";
import { getAuthState } from "@/utils/auth";
import { Bookmark, MessageSquare, Share2 } from "lucide-react";

interface CaseViewerProps {
  params: {
    id: string;
  };
}

export default function CaseViewerPage({ params }: CaseViewerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [legalCase, setLegalCase] = useState<LegalCase | null>(null);

  useEffect(() => {
    const authState = getAuthState();
    if (!authState?.token) {
      router.push("/login");
      return;
    }

    // Simulate API call
    const timer = setTimeout(() => {
      const foundCase = mockCases.find((c) => c.id === params.id);
      setLegalCase(foundCase || null);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!legalCase) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Case Not Found
          </h1>
          <p className="text-gray-600">
            The case you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {legalCase.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{legalCase.jurisdiction}</span>
                <span>•</span>
                <span>{legalCase.year}</span>
                <span>•</span>
                <span
                  className={`font-medium ${
                    legalCase.outcome === "favorable"
                      ? "text-green-600"
                      : legalCase.outcome === "unfavorable"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {legalCase.outcome.charAt(0).toUpperCase() +
                    legalCase.outcome.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-emerald-600">
                <Bookmark className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-emerald-600">
                <MessageSquare className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-emerald-600">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Summary
            </h2>
            <p className="text-gray-600 mb-8">{legalCase.summary}</p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Legal Arguments
            </h2>
            <ul className="space-y-4 mb-8">
              {legalCase.legalArguments.map((argument, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-600">{argument}</span>
                </li>
              ))}
            </ul>

            <div className="bg-emerald-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-emerald-900 mb-2">
                Outcome Prediction
              </h3>
              <p className="text-emerald-700">
                {legalCase.predictionScore}% success rate based on{" "}
                {legalCase.similarCases} similar cases
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {legalCase.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
