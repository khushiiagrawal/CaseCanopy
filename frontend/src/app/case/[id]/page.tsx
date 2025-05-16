"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthState } from "@/utils/auth";
import { Bookmark, MessageSquare, Share2, AlertCircle } from "lucide-react";

interface CaseViewerProps {
  params: {
    id: string;
  };
}

interface CaseDetails {
  id: string;
  title: string;
  summary: string;
  jurisdiction: string;
  year: string;
  outcome: string;
  legalArguments: string[];
  predictionScore: number;
  similarCases: number;
  tags: string[];
}

export default function CaseViewerPage({ params }: CaseViewerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);

  useEffect(() => {
    const authState = getAuthState();
    if (!authState?.token) {
      router.push("/login");
      return;
    }

    const fetchCaseDetails = async () => {
      try {
        const response = await fetch(`/api/cases/${params.id}`, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Case not found");
        }

        const data = await response.json();
        setCaseDetails(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load case details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
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

  if (error || !caseDetails) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Case Not Found"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {error ||
              "The case you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {caseDetails.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{caseDetails.jurisdiction}</span>
                <span>•</span>
                <span>{caseDetails.year}</span>
                <span>•</span>
                <span
                  className={`font-medium ${
                    caseDetails.outcome === "favorable"
                      ? "text-green-600"
                      : caseDetails.outcome === "unfavorable"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {caseDetails.outcome.charAt(0).toUpperCase() +
                    caseDetails.outcome.slice(1)}
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Summary
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {caseDetails.summary}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Legal Arguments
            </h2>
            <ul className="space-y-4 mb-8">
              {caseDetails.legalArguments.map((argument, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {argument}
                  </span>
                </li>
              ))}
            </ul>

            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-emerald-900 dark:text-emerald-300 mb-2">
                Outcome Prediction
              </h3>
              <p className="text-emerald-700 dark:text-emerald-400">
                {caseDetails.predictionScore}% success rate based on{" "}
                {caseDetails.similarCases} similar cases
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {caseDetails.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
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
