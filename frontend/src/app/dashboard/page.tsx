"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bookmark,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
} from "lucide-react";
import { getAuthState } from "@/utils/auth";
import CaseSummaryCard from "@/components/CaseSummaryCard";
import { ICaseSummary } from "@/models/CaseSummary";
import { Types } from "mongoose";

export default function DashboardPage() {
  const router = useRouter();
  const authState = getAuthState();
  const [summaries, setSummaries] = useState<
    (ICaseSummary & {
      _id: Types.ObjectId;
      author: { name: string; email: string };
    })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authState?.token) {
      router.push("/login");
      return;
    }

    // Fetch summaries
    const fetchSummaries = async () => {
      try {
        const response = await fetch("/api/summaries", {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSummaries(data);
        } else {
          console.error("Failed to fetch summaries");
        }
      } catch (error) {
        console.error("Failed to fetch summaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [authState, router]);

  if (!authState?.token) {
    return null;
  }

  const userRole = authState.user?.role;
  const isLegalUser = userRole === "legal";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white dark:from-gray-900 dark:via-primary-900/20 dark:to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-100 via-white to-white dark:from-primary-900/30 dark:via-gray-900 dark:to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary-50 via-white to-white dark:from-secondary-900/30 dark:via-gray-900 dark:to-gray-900" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Section */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 mb-3">
            <Sparkles className="h-4 w-4 mr-1.5" />
            <span className="text-sm font-medium">Welcome Back</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {authState.user?.name}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            {isLegalUser
              ? "Access your legal research tools and case summaries"
              : "Explore legal cases and summaries from our community"}
          </p>
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          <Link
            href="/search"
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-modern overflow-hidden transform transition-all duration-300 hover:-translate-y-1 glass h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-500/10 rounded-full blur-3xl group-hover:bg-secondary-500/20 transition-all duration-500" />
            <div className="p-6 relative h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-modern group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    Start Search
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                    Find relevant legal precedents
                  </p>
                </div>
              </div>
              <div className="mt-auto flex items-center text-primary-600 dark:text-primary-400 group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium text-sm">Begin search</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </div>
            </div>
          </Link>

          <Link
            href="/saved"
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-modern overflow-hidden transform transition-all duration-300 hover:-translate-y-1 glass h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-500/10 rounded-full blur-3xl group-hover:bg-secondary-500/20 transition-all duration-500" />
            <div className="p-6 relative h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-modern group-hover:scale-110 transition-transform duration-300">
                  <Bookmark className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    Saved Cases
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                    Access your bookmarked cases
                  </p>
                </div>
              </div>
              <div className="mt-auto flex items-center text-primary-600 dark:text-primary-400 group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium text-sm">View saved cases</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </div>
            </div>
          </Link>

          {isLegalUser ? (
            <Link
              href="/dashboard/publish"
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-modern overflow-hidden transform transition-all duration-300 hover:-translate-y-1 glass h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-500/10 rounded-full blur-3xl group-hover:bg-secondary-500/20 transition-all duration-500" />
              <div className="p-6 relative h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-modern group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      Publish Summary
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                      Share your case analysis
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex items-center text-primary-600 dark:text-primary-400 group-hover:translate-x-2 transition-transform duration-300">
                  <span className="font-medium text-sm">Write a summary</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href="/recent"
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-modern overflow-hidden transform transition-all duration-300 hover:-translate-y-1 glass h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-500/10 rounded-full blur-3xl group-hover:bg-secondary-500/20 transition-all duration-500" />
              <div className="p-6 relative h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-modern group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      Recent Cases
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                      View your recently accessed cases
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex items-center text-primary-600 dark:text-primary-400 group-hover:translate-x-2 transition-transform duration-300">
                  <span className="font-medium text-sm">View recent cases</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Case Summaries Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isLegalUser ? "Your Published Summaries" : "Recent Case Summaries"}
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : summaries.length > 0 ? (
            <div className="space-y-6">
              {summaries.map((summary) => (
                <CaseSummaryCard key={String(summary._id)} summary={summary} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-modern glass">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No summaries yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {isLegalUser
                  ? "Start sharing your case analysis with the community"
                  : "Legal professionals will share their case analysis here"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
