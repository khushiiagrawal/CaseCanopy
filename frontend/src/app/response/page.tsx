'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResponseData {
  status: string;
  langchain_response: string;
  saved_query: string;
  retrieved_chunks?: string[];
}

export default function ResponsePage() {
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/process-backend');
        const data = await response.json();
        setResponse(data);
      } catch (error) {
        console.error('Error fetching response:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();

    // Cleanup function to revoke object URLs on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  const handleGeneratePetition = async () => {
    setPdfLoading(true);
    setPdfError(null);
    
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    
    try {
      // Configure fetch to handle binary data (PDF)
      const response = await fetch('http://localhost:8001/generate_from_backend', {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
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
      if (blob.type !== 'application/pdf') {
        console.warn('Unexpected response type:', blob.type);
      }
      
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating petition:', error);
      setPdfError(error instanceof Error ? error.message : 'Failed to generate petition');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'legal_petition.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-lg text-white">Analyzing your query...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-lg text-red-400">No response available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Your Query</h2>
          <p className="text-white bg-gray-800 p-4 rounded-lg text-center">{response.saved_query}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900 rounded-2xl shadow-xl p-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white text-center">Legal Analysis</h2>
            <button
              onClick={handleGeneratePetition}
              disabled={pdfLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {pdfLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Fill Petition</span>
                </>
              )}
            </button>
          </div>
          
          <div className="text-white bg-gray-800 p-4 rounded-lg">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-6 text-center">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-6 text-center">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-4 text-center">{children}</h2>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-6 text-center">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="mb-2">{children}</li>
                )
              }}
            >
              {response.langchain_response}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* PDF Loading State */}
        {pdfLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900 rounded-2xl shadow-xl p-8 mt-8 flex flex-col items-center"
          >
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <p className="text-lg text-white mt-4">Generating petition document...</p>
          </motion.div>
        )}
        
        {/* PDF Error State */}
        {pdfError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900 rounded-2xl shadow-xl p-8 mt-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Error Generating Petition</h2>
              <p className="text-white">{pdfError}</p>
              <button 
                onClick={handleGeneratePetition} 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
        
        {/* PDF Viewer */}
        {pdfUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900 rounded-2xl shadow-xl p-8 mt-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Generated Petition</h2>
              <button
                onClick={handleDownloadPdf}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            <div className="bg-white p-2 rounded-lg overflow-hidden shadow-lg">
              <iframe 
                src={pdfUrl} 
                className="w-full h-[600px] rounded"
                title="Generated Petition Document"
              />
            </div>
          </motion.div>
        )}

        {/* Retrieved Chunks Section */}
        {response.retrieved_chunks && response.retrieved_chunks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-900 rounded-2xl shadow-xl p-8 mt-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Retrieved Chunks</h2>
            <div className="grid gap-4">
              {response.retrieved_chunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400 mr-2">Chunk {idx + 1}</span>
                  </div>
                  <div className="text-gray-200 whitespace-pre-line text-sm">
                    {chunk}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 