"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  Lightbulb,
  Filter,
  Upload,
  ArrowRight,
} from "lucide-react";
import SearchFilters, {
  SearchFilters as SearchFiltersType,
} from "@/components/SearchFilters";
import { getAuthState } from "@/utils/auth";
import Toast from "@/components/Toast";
import Loader from "@/components/Loader";
import React from "react";

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({
    year: "",
    caseType: "",
    summarization: "",
  });
  const [resetFilters, setResetFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const authState = getAuthState();
      if (!authState?.token) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();

    // Fetch user details from localStorage
    const userStr = localStorage.getItem("authState");
    if (userStr) {
      try {
        const authState = JSON.parse(userStr);
        const user = authState.user || {};
        setUserDetails({
          name: user.name || "",
          phone: user.phone || "",
          address: user.address || "",
        });
      } catch {}
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("parsedDocument");
    if (stored) {
      try {
        // setParsedDoc(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Don't render the page content until authentication is checked
  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  const handleLangchainSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Combine all filter values into a string
    const filterString = [
      filters.year && `year ${filters.year}`,
      filters.caseType && `casetype ${filters.caseType}`,
      filters.summarization && `summarization ${filters.summarization}`,
    ]
      .filter(Boolean)
      .join(", ");

    // Combine with the search query
    const combinedInput = [searchQuery, filterString]
      .filter(Boolean)
      .join(", ");

    setIsLoading(true);
    try {
      // 1. Save the query with user details
      const saveRes = await fetch("http://localhost:9000/api/feed-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: combinedInput,
          userDetails: userDetails,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save query");

      // 2. Get the processed result
      const processRes = await fetch(
        "http://localhost:9000/api/process-backend"
      );
      if (!processRes.ok) throw new Error("Failed to process query");

      // Save to recent searches
      const recentSearches = JSON.parse(
        localStorage.getItem("recentSearches") || "[]"
      );
      const newSearch = {
        id: Date.now().toString(),
        query: combinedInput,
        date: new Date().toISOString(),
        response: "Analysis in progress...", // This will be updated when viewing the response
      };

      // Add to beginning of array and keep only last 10 searches
      recentSearches.unshift(newSearch);
      if (recentSearches.length > 10) {
        recentSearches.pop();
      }
      localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

      setToast({ message: "LangChain response received!", type: "success" });
      router.push("/response");
    } catch {
      setToast({
        message: "Error contacting LangChain backend",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use the simplified endpoint that returns clean text
      const response = await fetch(
        "http://localhost:8000/api/parse-document-simple",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (response.ok) {
        // Format the data to match our frontend structure
        const formattedData = {
          text: data.document?.text || "",
          pages: data.document?.pages || 0,
          metadata: data.document?.metadata || {}, // No metadata in the simple version
        };
        // Store the parsed document data
        localStorage.setItem("parsedDocument", JSON.stringify(formattedData));
        setToast({
          message: "Document parsed successfully",
          type: "success",
        });
        // Redirect to upload/response page
        router.push("/upload/response");
      } else {
        setToast({
          message: data.error || "Failed to parse document",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error parsing document:", error);
      setToast({
        message: "Error parsing document",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {isLoading && <Loader />}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#CD9A3C]/20 via-black to-black opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#E3B448]/10 via-black to-black opacity-80" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Discover Legal Precedents
            </h1>
          </div>

          {/* Search Section */}
          <div className="bg-gradient-to-br from-[#D7B740]/10 to-[#CD9A3C]/5 backdrop-blur-sm rounded-xl shadow-legal p-6 mb-8 border border-[#E3B448]/20">
            <form onSubmit={handleLangchainSearch}>
              <div className="flex space-x-3 mb-6">
                <div className="w-full py-4 px-4 rounded-xl text-sm font-medium relative overflow-hidden group cursor-default">
                  {/* Decorative top border */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E3B448] to-transparent"></div>

                  {/* Decorative bottom border */}
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E3B448] to-transparent"></div>

                  {/* Left decorative element */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-12">
                    <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#E3B448] to-transparent"></div>
                    <div className="absolute top-0 left-1 w-[1px] h-full bg-gradient-to-b from-transparent via-[#E3B448]/50 to-transparent"></div>
                  </div>

                  {/* Right decorative element */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-12">
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#E3B448] to-transparent"></div>
                    <div className="absolute top-0 right-1 w-[1px] h-full bg-gradient-to-b from-transparent via-[#E3B448]/50 to-transparent"></div>
                  </div>

                  {/* Background effect */}
                  <div className="absolute inset-0 bg-black opacity-80 backdrop-blur-sm"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#CD9A3C]/20 via-black/10 to-[#CD9A3C]/20"></div>

                  <div className="relative z-10 flex items-center justify-center">
                    <div className="relative flex flex-col items-center">
                      <span className="uppercase tracking-[0.25em] text-[#E3B448]/90 text-xs mb-1.5">
                        CaseCanopy
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className="w-5 h-5 relative">
                          <span className="absolute inset-0 flex items-center justify-center text-xl text-[#E3B448]">
                            ⚖️
                          </span>
                        </div>
                        <h2 className="font-serif text-lg sm:text-xl text-white tracking-wide relative">
                          <span className="text-white">
                            Search through the canopy of legal wisdom
                          </span>
                        </h2>
                        <div className="w-5 h-5 relative">
                          <span className="absolute inset-0 flex items-center justify-center text-xl text-[#E3B448]">
                            ⚖️
                          </span>
                        </div>
                      </div>
                      <div className="h-0.5 w-32 mx-auto mt-1.5 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="relative flex items-center gap-3">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-[#E3B448]/70" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for legal cases, precedents, or legal concepts..."
                      className="block w-full pl-10 pr-3 py-4 border border-[#CD9A3C]/30 rounded-lg leading-5 bg-black/70 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E3B448] focus:border-transparent text-sm transition-all duration-200"
                    />
                  </div>
                  <label
                    className="inline-flex items-center justify-center h-[52px] w-[52px] border-2 border-[#CD9A3C]/30 rounded-lg bg-black/70 text-white cursor-pointer transition-all duration-200 hover:border-[#E3B448] hover:text-[#E3B448] flex-shrink-0"
                    title="Upload File"
                  >
                    <Upload className="h-5 w-5" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="bg-black/40 p-4 rounded-lg border border-[#CD9A3C]/20">
                  <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 text-[#E3B448] mr-2" />
                    <h2 className="text-base font-medium text-white">
                      Filters
                    </h2>
                  </div>
                  <SearchFilters
                    key={resetFilters ? "reset-1" : "reset-0"}
                    onFilterChange={setFilters}
                    horizontal
                    reset={resetFilters}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setResetFilters((prev) => !prev)}
                    className="px-4 py-2 text-sm text-[#E3B448] hover:text-[#E3B448]/80 transition-colors"
                  >
                    Reset Filters
                  </button>

                  <button
                    type="submit"
                    className="relative inline-flex items-center justify-center px-8 py-3 h-[52px] overflow-hidden font-semibold tracking-wider text-sm border-2 border-[#E3B448] rounded-lg bg-gradient-to-r from-[#D7B740] to-[#CD9A3C] text-black shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  >
                    <span className="absolute inset-0 w-full h-full bg-black opacity-0 group-hover:opacity-80 transition-opacity duration-300"></span>
                    <span className="absolute -inset-x-1 -inset-y-1 border border-[#E3B448]/40 rounded-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"></span>
                    <span className="relative flex items-center justify-center w-full h-full gap-2 transition-colors duration-300 ease-in-out group-hover:text-[#E3B448]">
                      <span className="font-medium">SUBMIT</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Tips Section - Streamlined */}
          <div className="bg-gradient-to-br from-[#D7B740]/10 to-[#CD9A3C]/5 backdrop-blur-sm rounded-xl shadow-legal p-6 border border-[#E3B448]/20">
            <div className="flex items-center mb-4">
              <Lightbulb className="h-5 w-5 text-[#E3B448] mr-2" />
              <h2 className="text-lg font-medium text-white">Search Tips</h2>
            </div>
            <ul className="space-y-3 text-sm text-gray-300 grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <li className="flex items-start">
                <span className="text-[#E3B448] mr-2">•</span>
                Use natural language to describe your legal issue or
                question—our AI understands context
              </li>
              <li className="flex items-start">
                <span className="text-[#E3B448] mr-2">•</span>
                Include key details like jurisdiction, parties involved, or
                specific laws for better results
              </li>
              <li className="flex items-start">
                <span className="text-[#E3B448] mr-2">•</span>
                Filter by case type and year to narrow your search results
              </li>
              <li className="flex items-start">
                <span className="text-[#E3B448] mr-2">•</span>
                Upload documents to search based on their content
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(227, 180, 72, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(227, 180, 72, 0.5);
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(227, 180, 72, 0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(227, 180, 72, 0.4);
        }

        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&display=swap");

        .font-serif {
          font-family: "Playfair Display", serif;
        }

        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
}
