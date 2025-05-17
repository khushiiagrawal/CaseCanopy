"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  Sparkles,
  Lightbulb,
  Filter,
  Mic,
  Upload,
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
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [filters, setFilters] = useState<SearchFiltersType>({
    jurisdiction: "",
    year: "",
    caseType: "",
    outcome: "",
    tags: [],
  });
  const [resetFilters, setResetFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    phone: "",
    address: ""
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
    const userStr = localStorage.getItem('authState');
    if (userStr) {
      try {
        const authState = JSON.parse(userStr);
        const user = authState.user || {};
        setUserDetails({
          name: user.name || "",
          phone: user.phone || "",
          address: user.address || ""
        });
      } catch {}
    }
  }, []); // Empty dependency array since we only want to check once on mount

  useEffect(() => {
    const stored = localStorage.getItem('parsedDocument');
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
      filters.jurisdiction && `jurisdiction ${filters.jurisdiction}`,
      filters.year && `year ${filters.year}`,
      filters.caseType && `casetype ${filters.caseType}`,
      filters.outcome && `outcome ${filters.outcome}`,
      filters.tags.length > 0 && `tags ${filters.tags.join(", ")}`
    ].filter(Boolean).join(", ");

    // Combine with the search query
    const combinedInput = [searchQuery, filterString].filter(Boolean).join(", ");

    setIsLoading(true);
    try {
      // 1. Save the query with user details
      const saveRes = await fetch('http://localhost:9000/api/feed-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: combinedInput,
          userDetails: userDetails
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save query');

      // 2. Get the processed result
      const processRes = await fetch('http://localhost:9000/api/process-backend');
      if (!processRes.ok) throw new Error('Failed to process query');

      setToast({ message: 'LangChain response received!', type: 'success' });
      router.push('/response');
    } catch {
      setToast({ message: 'Error contacting LangChain backend', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          setIsLoading(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const formData = new FormData();
          formData.append('audio', audioBlob);

          try {
            const response = await fetch('http://localhost:8000/api/transcribe', {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();
            if (data.text) {
              setSearchQuery(data.text);
              setToast({
                message: 'Voice transcribed successfully',
                type: 'success'
              });
            }
          } catch {
            setToast({
              message: 'Error transcribing audio',
              type: 'error'
            });
          } finally {
            setIsLoading(false);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch {
        setToast({
          message: 'Error accessing microphone',
          type: 'error'
        });
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userDetails', JSON.stringify(userDetails));

    try {
      // Use the simplified endpoint that returns clean text
      const response = await fetch('http://localhost:8000/api/parse-document-simple', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        // Format the data to match our frontend structure
        const formattedData = {
          text: data.document?.text || "",
          pages: data.document?.pages || 0,
          metadata: data.document?.metadata || {} // No metadata in the simple version
        };
        // Store the parsed document data
        localStorage.setItem('parsedDocument', JSON.stringify(formattedData));
        setToast({
          message: 'Document parsed successfully',
          type: 'success'
        });
      } else {
        setToast({
          message: data.error || 'Failed to parse document',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error parsing document:', error);
      setToast({
        message: 'Error parsing document',
        type: 'error'
      });
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white dark:from-gray-900 dark:via-primary-900/20 dark:to-gray-900">
      {isLoading && <Loader />}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-100 via-white to-white dark:from-primary-900/30 dark:via-gray-900 dark:to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary-50 via-white to-white dark:from-secondary-900/30 dark:via-gray-900 dark:to-gray-900" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 mb-3">
              <Sparkles className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">CaseCanopy Search</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Discover Legal Precedents
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find relevant cases using our advanced AI-powered search technology
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-modern p-6 mb-8 glass">
            <form onSubmit={handleLangchainSearch}>
              <div className="flex space-x-3 mb-4">
                <div className="w-full text-center py-3 px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-600 via-primary-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-primary-400/20 to-indigo-400/20 animate-gradient-x"></div>

                  <span className="font-serif tracking-wide relative z-10">Search through the canopy of legal wisdom</span>
                  <span className="text-2xl ml-2">⚖️</span>
                </div>
              </div>

              <div className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for legal cases, precedents, or legal concepts..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  />
                </div>
                <div className="flex space-x-2 ml-3">
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-modern text-white cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-3 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-primary-500 hover:bg-primary-600'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                    title={isRecording ? "Stop Recording" : "Start Voice Input"}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <label 
                    className={`inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-modern text-white cursor-pointer transition-all duration-300 hover:scale-110 hover:-rotate-3 ${
                      isUploading 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-primary-500 hover:bg-primary-600'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
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
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-modern text-white bg-gradient-primary hover:shadow-modern-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 cursor-pointer hover:scale-105"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Tips and Filters Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
            <div className="lg:col-span-2 flex flex-col h-full">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-modern p-6 glass flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-5 w-5 text-primary-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Search Tips
                  </h2>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 flex-1">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    Use natural language to describe your legal issue or
                    question—our AI understands context!
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    Specify environmental justice concerns, affected
                    communities, or relevant parties for more targeted results.
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    Try both semantic and keyword search to discover the most
                    relevant legal precedents.
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    Use filters (jurisdiction, year, case type, outcome, tags)
                    to narrow your search and find cases similar to yours.
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    Review AI-powered outcome predictions to assess the
                    likelihood of success based on similar cases.
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    Explore legal arguments and tags to uncover new strategies
                    for your search.
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    If you don&apos;t find what you need, try rephrasing your
                    query or using different keywords.
                  </li>
                </ul>
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col h-full">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-modern glass flex flex-col h-full">
                <div className="flex items-center justify-between p-2.5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center shadow-modern">
                      <Filter className="h-3 w-3 text-white" />
                    </div>
                    <div className="ml-2">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Filters
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Refine your search
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer transition-colors duration-200"
                    onClick={() => setResetFilters((r) => !r)}
                  >
                    Reset All
                  </button>
                </div>
                <div className="p-2.5">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="w-full">
                      <SearchFilters
                        key={resetFilters ? "reset-1" : "reset-0"}
                        onFilterChange={setFilters}
                        horizontal
                        reset={resetFilters}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-auto p-2.5 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Active Filters</span>
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      4
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                      Federal Court
                    </span>
                    <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                      2023
                    </span>
                    <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                      Environmental
                    </span>
                    <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                      Favorable
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(75, 85, 99, 0.7);
        }

        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&display=swap');

        .font-serif {
          font-family: 'Playfair Display', serif;
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
