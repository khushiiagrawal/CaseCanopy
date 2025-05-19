"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  FileText,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Bookmark,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Loader from "@/components/Loader";

interface ResponseData {
  saved_query: string;
  langchain_response: string;
  source_documents: string[];
  sourcesCount: number;
}

interface SavedCase {
  id: string;
  query: string;
  analysis: string;
  date: string;
  sourcesCount: number;
}

interface RecentSearch {
  id: string;
  query: string;
  date: string;
  response: string;
}

export default function ResponsePage() {
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [retrievedChunksOpen, setRetrievedChunksOpen] = useState(false);
  const [isCaseSaved, setIsCaseSaved] = useState(false);
  const [savingCase, setSavingCase] = useState(false);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const response = await fetch(
          "http://localhost:9000/api/process-backend"
        );
        const data = await response.json();
        setResponse(data);

        // Check if this case is already saved
        checkIfCaseSaved(data);

        // Update recent searches with the actual response
        const recentSearches = JSON.parse(
          localStorage.getItem("recentSearches") || "[]"
        );
        const updatedSearches = recentSearches.map((search: RecentSearch) => {
          if (search.query === data.saved_query) {
            return {
              ...search,
              response: data.langchain_response,
            };
          }
          return search;
        });
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      } catch (error) {
        console.error("Error fetching response:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    fetchResponse();

    // Cleanup function to revoke object URLs on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const checkIfCaseSaved = (responseData: ResponseData) => {
    if (!responseData) return;

    const savedCases = JSON.parse(localStorage.getItem("savedCases") || "[]");
    const isAlreadySaved = savedCases.some(
      (savedCase: SavedCase) => savedCase.query === responseData.saved_query
    );

    setIsCaseSaved(isAlreadySaved);
  };

  const handleSaveCase = () => {
    if (!response) return;

    setSavingCase(true);

    try {
      const savedCases = JSON.parse(localStorage.getItem("savedCases") || "[]");

      const caseToSave = {
        id: Date.now().toString(),
        query: response.saved_query,
        analysis: response.langchain_response,
        date: new Date().toISOString(),
        sourcesCount: response.source_documents?.length || 0,
      };

      savedCases.push(caseToSave);
      localStorage.setItem("savedCases", JSON.stringify(savedCases));
      setIsCaseSaved(true);
    } catch (error) {
      console.error("Error saving case:", error);
    } finally {
      setSavingCase(false);
    }
  };

  const handleGeneratePetition = async () => {
    setPdfLoading(true);
    setPdfError(null);

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    try {
      // Configure fetch to handle binary data (PDF)
      const response = await fetch(
        "http://localhost:8001/generate_from_backend",
        {
          method: "GET",
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          // Try to parse error message from JSON response
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If not JSON, try to get text
          try {
            const textError = await response.text();
            if (textError) errorMessage = textError;
          } catch {
            // Fallback to default error message
          }
        }
        throw new Error(errorMessage);
      }

      // Create a blob URL from the PDF response for display
      const blob = await response.blob();
      if (blob.type !== "application/pdf") {
        console.warn("Unexpected response type:", blob.type);
      }

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating petition:", error);
      setPdfError(
        error instanceof Error ? error.message : "Failed to generate petition"
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "legal_petition.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (!response) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-[#D7B740]/20 to-[#CD9A3C]/5 backdrop-blur-sm rounded-xl p-8 border border-[#E3B448]/20 shadow-2xl"
        >
          <p className="text-xl text-[#E3B448] font-serif">
            No response available
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-16 pt-24">
      {/* Header with solid black background */}
      <div className="relative h-16 overflow-hidden mb-10">
        <div className="absolute inset-0 bg-black"></div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
        >
          <div className="flex items-center space-x-3">
            {/* <div className="w-8 h-8 text-[#E3B448]">⚖️</div> */}
            <h1 className="text-2xl font-serif text-white">
              Case<span className="text-[#E3B448]">Canopy</span>{" "}
              <span className="text-gray-400 font-normal">Analysis</span>
            </h1>
            {/* <div className="w-8 h-8 text-[#E3B448]">⚖️</div> */}
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Improved Bento Grid Layout with better height management */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Query Card - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-4 bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20"
          >
            <div className="relative p-6">
              {/* Decorative elements */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>

              <div className="flex items-center mb-4">
                <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
                <h2 className="text-xl font-serif font-medium text-white">
                  Your Query
                </h2>
                <button
                  onClick={() => copyToClipboard(response.saved_query, "query")}
                  className="ml-auto text-[#E3B448]/70 hover:text-[#E3B448] transition-colors"
                  title="Copy query"
                >
                  {copiedText === "query" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="bg-black/60 p-5 rounded-xl border border-[#CD9A3C]/10 text-gray-200 text-lg font-light leading-relaxed backdrop-blur-sm">
                &ldquo;{response.saved_query}&rdquo;
              </div>
            </div>
          </motion.div>

          {/* Main row with Analysis and Action cards */}
          <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Main Analysis Card - Spans 3 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-3 bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20"
            >
              <div className="relative p-6">
                {/* Decorative top border */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>

                <div className="flex items-center mb-6">
                  <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
                  <h2 className="text-xl font-serif font-medium text-white">
                    Legal Analysis
                  </h2>
                  <button
                    onClick={() =>
                      copyToClipboard(response.langchain_response, "analysis")
                    }
                    className="ml-auto text-[#E3B448]/70 hover:text-[#E3B448] transition-colors"
                    title="Copy analysis"
                  >
                    {copiedText === "analysis" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-[#CD9A3C]/10 shadow-inner backdrop-blur-sm max-h-[500px] overflow-y-auto custom-scrollbar">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-6 text-gray-200 leading-relaxed">
                          {children}
                        </p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-serif font-bold mb-6 text-[#E3B448]">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-serif font-bold mb-4 text-[#E3B448]">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-serif font-bold mb-3 text-[#E3B448]/90">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-6 space-y-2 text-gray-200">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-6 space-y-2 text-gray-200">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[#E3B448]/40 pl-4 italic my-4 text-gray-300">
                          {children}
                        </blockquote>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-[#E3B448]/80">
                          {children}
                        </strong>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          className="text-[#E3B448] underline hover:text-[#E3B448]/80 transition-colors"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {response.langchain_response}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>

            {/* Actions Card - Compact design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20"
            >
              <div className="relative p-6">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>

                <div className="flex items-center mb-4">
                  <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
                  <h2 className="text-xl font-serif font-medium text-white">
                    Actions
                  </h2>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGeneratePetition}
                    disabled={pdfLoading}
                    className="w-full relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D7B740] to-[#CD9A3C] rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-80 transition-opacity duration-300 rounded-lg"></div>
                    <div className="relative flex items-center justify-center py-3 px-4 space-x-2">
                      {pdfLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin group-hover:text-[#E3B448] text-black" />
                          <span className="font-medium group-hover:text-[#E3B448] text-black">
                            Generating...
                          </span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5 group-hover:text-[#E3B448] text-black" />
                          <span className="font-medium group-hover:text-[#E3B448] text-black">
                            Generate Petition
                          </span>
                        </>
                      )}
                    </div>
                  </button>

                  <div className="text-xs text-gray-400 text-center px-2">
                    Generate a formal legal petition based on this analysis
                  </div>

                  <div className="py-1">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E3B448]/30 to-transparent"></div>
                  </div>

                  <button
                    onClick={handleSaveCase}
                    disabled={isCaseSaved || savingCase}
                    className="w-full relative group mb-4"
                  >
                    <div className="absolute inset-0 bg-[#1F1F1F] rounded-lg opacity-90 group-hover:opacity-100 transition-opacity border border-[#E3B448]/30"></div>
                    <div className="relative flex items-center justify-center py-3 px-4 space-x-2">
                      {savingCase ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-[#E3B448]" />
                          <span className="font-medium text-[#E3B448]">
                            Saving...
                          </span>
                        </>
                      ) : isCaseSaved ? (
                        <>
                          <Check className="w-5 h-5 text-[#E3B448]" />
                          <span className="font-medium text-[#E3B448]">
                            Case Saved
                          </span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-5 h-5 group-hover:text-[#E3B448] text-gray-200" />
                          <span className="font-medium group-hover:text-[#E3B448] text-gray-200 transition-colors">
                            Save Case
                          </span>
                        </>
                      )}
                    </div>
                  </button>

                  <div className="text-xs text-gray-400 text-center px-2 mb-4">
                    {isCaseSaved
                      ? "This case has been saved to your dashboard"
                      : "Save this analysis to access it later from your dashboard"}
                  </div>

                  <div className="py-1">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E3B448]/30 to-transparent"></div>
                  </div>

                  <a href="/search" className="block w-full relative group">
                    <div className="absolute inset-0 bg-[#1F1F1F] rounded-lg opacity-90 group-hover:opacity-100 transition-opacity border border-[#E3B448]/30"></div>
                    <div className="relative flex items-center justify-center py-3 px-4">
                      <span className="font-medium group-hover:text-[#E3B448] text-gray-200 transition-colors">
                        New Search
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Resources and Citation Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20"
          >
            <div className="relative p-6">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>

              <div className="flex items-center mb-4">
                <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
                <h2 className="text-xl font-serif font-medium text-white">
                  Legal Resources
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-black/40 rounded-lg border border-[#CD9A3C]/10 hover:border-[#CD9A3C]/30 transition-colors">
                  <div className="flex items-center">
                    <div className="text-[#E3B448] mr-3">📚</div>
                    <div className="text-gray-200">Legal Research Guide</div>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-lg border border-[#CD9A3C]/10 hover:border-[#CD9A3C]/30 transition-colors">
                  <div className="flex items-center">
                    <div className="text-[#E3B448] mr-3">📝</div>
                    <div className="text-gray-200">Document Templates</div>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-lg border border-[#CD9A3C]/10 hover:border-[#CD9A3C]/30 transition-colors">
                  <div className="flex items-center">
                    <div className="text-[#E3B448] mr-3">🔍</div>
                    <div className="text-gray-200">Case Law Database</div>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-lg border border-[#CD9A3C]/10 hover:border-[#CD9A3C]/30 transition-colors">
                  <div className="flex items-center">
                    <div className="text-[#E3B448] mr-3">👨‍⚖️</div>
                    <div className="text-gray-200">Find Legal Counsel</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Citation Standards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20"
          >
            <div className="relative p-6">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>

              <div className="flex items-center mb-4">
                <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
                <h2 className="text-xl font-serif font-medium text-white">
                  Citation Standards
                </h2>
              </div>

              <div className="bg-black/40 p-4 rounded-lg border border-[#CD9A3C]/10">
                <div className="text-gray-300 text-sm leading-relaxed">
                  <p className="mb-3">
                    When citing this analysis in legal documents, please use the
                    following format:
                  </p>
                  <div className="font-mono bg-black/60 p-3 rounded border border-[#CD9A3C]/20 text-[#E3B448]/90 mb-3">
                    CaseCanopy Legal AI Analysis,{" "}
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    , [Query: {response.saved_query.substring(0, 40)}...]
                  </div>
                  <p className="text-xs text-gray-400">
                    This analysis is provided as informational content and
                    should not be considered as formal legal advice.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* PDF Error State */}
        <AnimatePresence>
          {pdfError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 mt-6"
            >
              <div className="relative p-6">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-red-500/80 to-transparent"></div>

                <div className="text-center">
                  <h2 className="text-xl font-serif font-medium text-red-400 mb-4">
                    Error Generating Petition
                  </h2>
                  <p className="text-gray-300 mb-6">{pdfError}</p>
                  <button
                    onClick={handleGeneratePetition}
                    className="px-6 py-2 bg-[#D7B740] hover:bg-[#E3B448] text-black font-medium rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF Viewer - Full width when visible */}
        <AnimatePresence>
          {pdfUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 mt-6"
            >
              <div className="relative p-6">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
                    <h2 className="text-xl font-serif font-medium text-white">
                      Generated Petition
                    </h2>
                  </div>
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#E3B448]/10 hover:bg-[#E3B448]/20 text-[#E3B448] rounded-lg transition-colors border border-[#E3B448]/30"
                  >
                    <Download className="w-4 h-4" />
                    <span className="font-medium">Download</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[700px] rounded"
                    title="Generated Petition Document"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Retrieved Chunks Section with Toggle - Full width */}
        {response.source_documents && response.source_documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20 mt-6"
          >
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>

              <button
                onClick={() => setRetrievedChunksOpen(!retrievedChunksOpen)}
                className="w-full p-6 flex items-center justify-between focus:outline-none"
              >
                <div className="flex items-center">
                  <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
                  <h2 className="text-xl font-serif font-medium text-white">
                    Source References
                  </h2>
                  <span className="ml-3 px-2 py-0.5 text-xs bg-[#E3B448]/20 text-[#E3B448] rounded">
                    {response.source_documents.length}
                  </span>
                </div>
                <div className="text-[#E3B448]">
                  {retrievedChunksOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {retrievedChunksOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {response.source_documents.map((chunk, idx) => (
                        <div
                          key={idx}
                          className="bg-black/60 rounded-lg p-4 border border-[#CD9A3C]/10 shadow-md hover:border-[#CD9A3C]/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <span className="text-xs font-semibold px-2 py-1 rounded bg-[#E3B448]/10 text-[#E3B448] mr-2">
                                Source {idx + 1}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(chunk, `chunk-${idx}`)
                              }
                              className="text-[#E3B448]/70 hover:text-[#E3B448] transition-colors"
                              title="Copy source text"
                            >
                              {copiedText === `chunk-${idx}` ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <div className="text-gray-300 whitespace-pre-line text-sm font-light leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                            {chunk}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer with solid black background */}
      <div className="relative h-4 mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-black"></div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap");

        .font-serif {
          font-family: "Playfair Display", serif;
        }

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
        }
      `}</style>
    </div>
  );
}
