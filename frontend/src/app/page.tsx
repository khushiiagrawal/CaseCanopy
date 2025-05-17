"use client";

import Link from "next/link";
import { isAuthenticated } from "@/utils/auth";
import { Scale, Search, Users, ArrowRight, Sparkles, BookOpen, Gavel, FileText } from "lucide-react";
import { motion } from "framer-motion";
import LegalBackground from "@/components/LegalBackground";
import AnimatedFeatureCard from "@/components/AnimatedFeatureCard";

export default function Home() {
  const authenticated = isAuthenticated();

  const features = [
    
    {
      icon: Scale,
      title: "Outcome Prediction",
      description: "Get AI-powered predictions based on historical case outcomes and legal reasoning patterns.",
    },
    
    {
      icon: BookOpen,
      title: "Legal Library",
      description: "Access a comprehensive collection of case law, statutes, and legal resources across all domains.",
    },
    {
      icon: Gavel,
      title: "Case Analysis",
      description: "Deep dive into case details with AI-powered insights and historical context.",
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Organize and manage legal documents with smart categorization and search capabilities.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-legal-navy via-legal-navy/95 to-legal-navy/90">
      <LegalBackground />
      
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Elements */}
        

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 flex flex-col min-h-screen justify-between">
          <div className="text-center">

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-slide-up">
              <span className="block text-gray-900 dark:text-white">
                CaseCanopy
              </span>
              <span className="block text-primary-600 dark:text-primary-400 mt-2">
                Justice, Discovered.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 animate-slide-up animation-delay-200">
              Empowering everyone with AI-powered legal precedent discovery, research, and analysis across all domains of law.
            </p>

            <div className="flex flex-col sm:flex-row gap-16 justify-center animate-slide-up animation-delay-400 mt-60">
              {authenticated ? (
                <Link
                  href="/search"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gradient-primary rounded-xl shadow-modern hover:shadow-modern-hover transition-all duration-200 min-w-[160px]"
                >
                  Start Searching
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="group inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gradient-primary rounded-xl shadow-modern hover:shadow-modern-hover transition-all duration-200 min-w-[160px]"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/signup"
                    className="group inline-flex items-center justify-center px-8 py-4 text-base font-medium text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 rounded-xl shadow-modern hover:shadow-modern-hover transition-all duration-200 min-w-[160px]"
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
      <div className="min-h-screen flex flex-col justify-center py-16">
        <div className="w-full px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            
            <h2 className="text-4xl font-bold text-legal-parchment mb-4">
              Powerful Features for Legal Research
            </h2>
            <p className="text-xl text-legal-silver max-w-3xl mx-auto">
              Discover how CaseCanopy revolutionizes legal research with cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-2 place-items-center">
            {features.map((feature, index) => (
              <AnimatedFeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-legal-navy/90 to-legal-navy py-16">
        <div className="w-full px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-legal-parchment mb-6">
              Ready to Transform Your Legal Research?
            </h2>
            <p className="text-xl text-legal-silver max-w-3xl mx-auto mb-8">
              Join our community of legal professionals and advocates working towards accessible justice across all legal domains.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-legal-navy bg-legal-gold rounded-xl shadow-legal hover:shadow-legal-hover transition-all duration-200"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
