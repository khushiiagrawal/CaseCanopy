'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, FileText, Download, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Loader from "@/components/Loader";

interface ResponseData {
  status: string;
  langchain_response: string;
  saved_query: string;
  retrieved_chunks?: string[];
}

export default function UploadResponsePage() {
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [retrievedChunksOpen, setRetrievedChunksOpen] = useState(false);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const response = await fetch('http://localhost:9001/api/analyze');
        const data = await response.json();
        setResponse(data);
      } catch (error) {
        console.error('Error fetching response:', error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    fetchResponse();
  }, []);

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
            <h1 className="text-2xl font-serif text-white">
              Case<span className="text-[#E3B448]">Canopy</span>{" "}
              <span className="text-gray-400 font-normal">Document Analysis</span>
            </h1>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Improved Bento Grid Layout with better height management */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <div className="py-1">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E3B448]/30 to-transparent"></div>
                  </div>

                  <a href="/dashboard" className="block w-full relative group">
                    <div className="absolute inset-0 bg-[#1F1F1F] rounded-lg opacity-90 group-hover:opacity-100 transition-opacity border border-[#E3B448]/30"></div>
                    <div className="relative flex items-center justify-center py-3 px-4">
                      <span className="font-medium group-hover:text-[#E3B448] text-gray-200 transition-colors">
                        Back to Dashboard
                      </span>
                    </div>
                  </a>

                  <a href="/upload" className="block w-full relative group mt-4">
                    <div className="absolute inset-0 bg-[#1F1F1F] rounded-lg opacity-90 group-hover:opacity-100 transition-opacity border border-[#E3B448]/30"></div>
                    <div className="relative flex items-center justify-center py-3 px-4">
                      <span className="font-medium group-hover:text-[#E3B448] text-gray-200 transition-colors">
                        Upload New Document
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Retrieved Chunks Section if available */}
          {response.retrieved_chunks && response.retrieved_chunks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="md:col-span-4 bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl overflow-hidden shadow-xl border border-[#CD9A3C]/20"
            >
              <div className="relative p-6">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>

                <button
                  onClick={() => setRetrievedChunksOpen(!retrievedChunksOpen)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <div className="flex items-center">
                    <span className="h-6 w-1 bg-[#E3B448] rounded-full mr-3"></span>
                    <h2 className="text-xl font-serif font-medium text-white">
                      Document Chunks ({response.retrieved_chunks.length})
                    </h2>
                  </div>
                  {retrievedChunksOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#E3B448]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#E3B448]" />
                  )}
                </button>

                <AnimatePresence>
                  {retrievedChunksOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 mt-4">
                        {response.retrieved_chunks.map((chunk, idx) => (
                          <div
                            key={idx}
                            className="bg-black/60 p-4 rounded-xl border border-[#CD9A3C]/10 shadow-inner backdrop-blur-sm"
                          >
                            <div className="flex items-center mb-2">
                              <span className="text-xs font-semibold text-[#E3B448] px-2 py-1 bg-[#E3B448]/10 rounded-md">
                                Chunk {idx + 1}
                              </span>
                            </div>
                            <div className="text-gray-300 whitespace-pre-line text-sm">
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
      </div>
    </div>
  );
} 