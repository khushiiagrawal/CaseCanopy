"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bookmark,
  Clock,
  ArrowRight,
  FileText,
  Scale,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAuthState } from "@/utils/auth";
import { ICaseSummary } from "@/models/CaseSummary";
import { Types } from "mongoose";

export default function DashboardPage() {
  const router = useRouter();
  const [summaries, setSummaries] = useState<
    (ICaseSummary & {
      _id: Types.ObjectId;
      author: { name: string; email: string };
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<ReturnType<
    typeof getAuthState
  > | null>(null);

  useEffect(() => {
    const currentAuthState = getAuthState();
    setAuthState(currentAuthState);

    if (!currentAuthState?.token) {
      router.push("/login");
      return;
    }

    // Fetch summaries
    const fetchSummaries = async () => {
      try {
        const response = await fetch("/api/summaries", {
          headers: {
            Authorization: `Bearer ${currentAuthState.token}`,
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
  }, [router]);

  if (!authState?.token) {
    return null;
  }

  const userRole = authState.user?.role;
  const isLegalUser = userRole === "legal";

  return (
    <div className="min-h-screen bg-black text-white pb-16 pt-24">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#CD9A3C]/20 via-black to-black opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#E3B448]/10 via-black to-black opacity-80" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#E3B448]/20 text-[#E3B448] mb-4">
            <Scale className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Legal Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
            Welcome,{" "}
            <span className="text-[#E3B448]">{authState.user?.name}</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {isLegalUser
              ? "Access your professional legal resources and case management tools"
              : "Explore case insights and navigate your legal resources"}
          </p>
          <div className="mt-4 h-1 w-40 mx-auto bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>
        </motion.div>

        {/* Main Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Link
            href="/search"
            className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 relative group"
          >
            <div className="relative p-6">
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 rounded-full bg-[#E3B448]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-6 h-6 text-[#E3B448]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-serif text-white group-hover:text-[#E3B448] transition-colors duration-300">
                    Case Search
                  </h3>
                  <p className="text-sm text-gray-400">
                    Find legal precedents and analyze cases
                  </p>
                </div>
              </div>

              <div className="bg-black/60 p-4 rounded-xl border border-[#CD9A3C]/10 backdrop-blur-sm mb-4">
                <p className="text-gray-300 text-sm">
                  Access our extensive database of legal cases and find relevant
                  precedents for your legal research.
                </p>
              </div>

              <div className="flex items-center text-[#E3B448] group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium text-sm">Launch search</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </Link>

          <Link
            href="/saved"
            className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 relative group"
          >
            <div className="relative p-6">
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 rounded-full bg-[#E3B448]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Bookmark className="w-6 h-6 text-[#E3B448]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-serif text-white group-hover:text-[#E3B448] transition-colors duration-300">
                    Saved Cases
                  </h3>
                  <p className="text-sm text-gray-400">
                    Access your bookmarked legal cases
                  </p>
                </div>
              </div>

              <div className="bg-black/60 p-4 rounded-xl border border-[#CD9A3C]/10 backdrop-blur-sm mb-4">
                <p className="text-gray-300 text-sm">
                  Review and organize your saved cases. Add notes and categorize
                  for better case management.
                </p>
              </div>

              <div className="flex items-center text-[#E3B448] group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium text-sm">View saved cases</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </Link>

          {isLegalUser ? (
            <Link
              href="/dashboard/publish"
              className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 relative group"
            >
              <div className="relative p-6">
                <div className="flex items-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#E3B448]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-[#E3B448]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-serif text-white group-hover:text-[#E3B448] transition-colors duration-300">
                      Publish Analysis
                    </h3>
                    <p className="text-sm text-gray-400">
                      Share your case analysis and insights
                    </p>
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-xl border border-[#CD9A3C]/10 backdrop-blur-sm mb-4">
                  <p className="text-gray-300 text-sm">
                    Create professional case summaries and legal analysis to
                    publish within your organization.
                  </p>
                </div>

                <div className="flex items-center text-[#E3B448] group-hover:translate-x-2 transition-transform duration-300">
                  <span className="font-medium text-sm">Create analysis</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href="/recent"
              className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 relative group"
            >
              <div className="relative p-6">
                <div className="flex items-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#E3B448]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-6 h-6 text-[#E3B448]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-serif text-white group-hover:text-[#E3B448] transition-colors duration-300">
                      Recent Activity
                    </h3>
                    <p className="text-sm text-gray-400">
                      View your recently accessed cases
                    </p>
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-xl border border-[#CD9A3C]/10 backdrop-blur-sm mb-4">
                  <p className="text-gray-300 text-sm">
                    Access your recent case history and continue where you left
                    off in your legal research.
                  </p>
                </div>

                <div className="flex items-center text-[#E3B448] group-hover:translate-x-2 transition-transform duration-300">
                  <span className="font-medium text-sm">
                    View recent activity
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          )}
        </motion.div>

        {/* Case Summaries Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
        >
          <div className="flex items-center mb-6">
            <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
            <h2 className="text-xl font-serif font-medium text-white">
              {isLegalUser
                ? "Your Published Analyses"
                : "Recent Case Summaries"}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse h-64 bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl border border-[#CD9A3C]/20"
                ></div>
              ))}
            </div>
          ) : summaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {summaries.map((summary) => (
                <div
                  key={String(summary._id)}
                  className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-serif text-[#E3B448] mb-2">
                      {summary.title}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {summary.content}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <div>By: {summary.author.name}</div>
                    <Link
                      href={`/summaries/${summary._id}`}
                      className="flex items-center text-[#E3B448] hover:underline"
                    >
                      Read more <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E3B448]/20 mb-4">
                <FileText className="h-8 w-8 text-[#E3B448]" />
              </div>
              <h3 className="text-lg font-serif text-white mb-3">
                No summaries available
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-4">
                {isLegalUser
                  ? "Share your legal expertise by creating case analyses for your organization"
                  : "Legal professionals will share case analyses here soon"}
              </p>
              {isLegalUser && (
                <Link
                  href="/dashboard/publish"
                  className="inline-block px-4 py-2 bg-[#E3B448]/20 text-[#E3B448] rounded-lg border border-[#CD9A3C]/30 hover:bg-[#E3B448]/30 transition-colors"
                >
                  Create your first analysis
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap");

        .font-serif {
          font-family: "Playfair Display", serif;
        }
      `}</style>
    </div>
  );
}
