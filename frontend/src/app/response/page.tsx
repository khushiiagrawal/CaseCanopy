'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
  }, []);

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
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Legal Analysis</h2>
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