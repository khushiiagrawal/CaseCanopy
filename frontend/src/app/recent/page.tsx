"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Search, ArrowLeft } from "lucide-react";
import { getAuthState } from "@/utils/auth";

interface RecentSearch {
  id: string;
  query: string;
  date: string;
  response: string;
}

export default function RecentActivityPage() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const authState = getAuthState();
    if (!authState?.token) {
      router.push("/login");
      return;
    }

    // Load recent searches from localStorage
    try {
      const searches = JSON.parse(
        localStorage.getItem("recentSearches") || "[]"
      );
      setRecentSearches(searches);
    } catch (error) {
      console.error("Error loading recent searches:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16 pt-24">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#CD9A3C]/20 via-black to-black opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#E3B448]/10 via-black to-black opacity-80" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
              <h1 className="text-2xl font-serif font-bold text-white">
                Recent Activity
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center text-sm text-[#E3B448] hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
          <p className="text-gray-300 max-w-2xl">
            View your recent legal case searches and analyses
          </p>
          <div className="mt-4 h-1 w-40 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse h-40 bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl border border-[#CD9A3C]/20"
              ></div>
            ))}
          </div>
        ) : recentSearches.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {recentSearches.map((search) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <Search className="h-5 w-5 text-[#E3B448] mr-2" />
                      <h3 className="text-lg font-serif text-white line-clamp-1">
                        {search.query}
                      </h3>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {search.response.substring(0, 200)}...
                    </p>

                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatDate(search.date)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E3B448]/20 mb-4">
              <Search className="h-8 w-8 text-[#E3B448]" />
            </div>
            <h3 className="text-lg font-serif text-white mb-3">
              No recent searches
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Your recent searches will appear here
            </p>
            <Link
              href="/search"
              className="inline-flex items-center px-4 py-2 bg-[#E3B448]/20 text-[#E3B448] rounded-lg border border-[#CD9A3C]/30 hover:bg-[#E3B448]/30 transition-colors"
            >
              <Search className="h-4 w-4 mr-2" />
              Start a new search
            </Link>
          </motion.div>
        )}
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
