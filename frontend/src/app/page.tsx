"use client";

import Link from "next/link";
import { isAuthenticated } from "@/utils/auth";
import { Scale, Search, Users, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white dark:from-gray-900 dark:via-primary-900/20 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-100 via-white to-white dark:from-primary-900/30 dark:via-gray-900 dark:to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary-50 via-white to-white dark:from-secondary-900/30 dark:via-gray-900 dark:to-gray-900" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 mb-8 glass">
              <Sparkles className="h-5 w-5 mr-2 text-primary-500" />
              <span className="text-sm font-medium">
                AI-Powered Legal Research
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
              <span className="block text-gray-900 dark:text-white">
                CaseCanopy
              </span>
              <span className="block text-primary-600 dark:text-primary-400 mt-2">
                Justice, Discovered.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 animate-slide-up animation-delay-200">
              Empowering marginalized communities with AI-powered legal
              precedent discovery for environmental justice litigation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-400">
              {authenticated ? (
                <Link
                  href="/search"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-primary rounded-xl shadow-modern hover:shadow-modern-hover transition-all duration-200"
                >
                  Start Searching
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-primary rounded-xl shadow-modern hover:shadow-modern-hover transition-all duration-200"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/signup"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 rounded-xl shadow-modern hover:shadow-modern-hover transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 via-blue-100 to-primary-100 dark:from-primary-900/50 dark:via-blue-900/50 dark:to-primary-900/50 text-primary-700 dark:text-primary-300 mb-4 animate-fade-in glass">
              <Sparkles className="h-5 w-5 mr-2 animate-pulse text-primary-500" />
              <span className="text-sm font-medium">Features</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Legal Research
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how CaseCanopy revolutionizes legal research with
              cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-modern overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl glass">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl group-hover:bg-primary-500/30 transition-all duration-500" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-500/20 rounded-full blur-3xl group-hover:bg-secondary-500/30 transition-all duration-500" />
              <div className="p-8 relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-6 shadow-modern group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  Semantic Search
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Discover relevant cases using natural language, going beyond
                  traditional keyword matching with advanced AI algorithms.
                </p>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
                  <div className="h-1 w-8 bg-gradient-to-r from-primary-500/50 to-secondary-500/50 rounded-full"></div>
                  <div className="h-1 w-4 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-modern overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl glass">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl group-hover:bg-primary-500/30 transition-all duration-500" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-500/20 rounded-full blur-3xl group-hover:bg-secondary-500/30 transition-all duration-500" />
              <div className="p-8 relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-6 shadow-modern group-hover:scale-110 transition-transform duration-300">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  Outcome Prediction
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Get AI-powered predictions based on historical case outcomes
                  and legal reasoning patterns.
                </p>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
                  <div className="h-1 w-8 bg-gradient-to-r from-primary-500/50 to-secondary-500/50 rounded-full"></div>
                  <div className="h-1 w-4 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-modern overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl glass">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl group-hover:bg-primary-500/30 transition-all duration-500" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-500/20 rounded-full blur-3xl group-hover:bg-secondary-500/30 transition-all duration-500" />
              <div className="p-8 relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-6 shadow-modern group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  Collaborative Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Work together with annotations and shared insights on key
                  legal arguments and case strategies.
                </p>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
                  <div className="h-1 w-8 bg-gradient-to-r from-primary-500/50 to-secondary-500/50 rounded-full"></div>
                  <div className="h-1 w-4 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-b from-white to-primary-50 dark:from-gray-900 dark:to-primary-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Legal Research?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Join our community of legal professionals and advocates working
            towards environmental justice.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-primary rounded-xl shadow-modern hover:shadow-modern-hover transition-all duration-200"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          50% {
            background-position: 0% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        .animate-shimmer {
          animation: shimmer 6s ease-in-out infinite;
        }
        .animate-gradient-text {
          background-size: 200% auto;
          animation: shimmer 6s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
