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
      icon: Search,
      title: "Semantic Search",
      description: "Discover relevant cases using natural language, going beyond traditional keyword matching with advanced AI algorithms.",
    },
    {
      icon: Scale,
      title: "Outcome Prediction",
      description: "Get AI-powered predictions based on historical case outcomes and legal reasoning patterns.",
    },
    {
      icon: Users,
      title: "Collaborative Analysis",
      description: "Work together with annotations and shared insights on key legal arguments and case strategies.",
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
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-legal-gold/20 text-legal-gold mb-6 glass"
            >
              <Sparkles className="h-5 w-5 mr-2 text-legal-gold" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                AI Meets Law
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-legal-parchment"
            >
              <span className="block">Empowering Justice,</span>
              <span className="block text-legal-gold mt-1">Elevating Legal Insight</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-base md:text-lg text-legal-silver max-w-2xl mx-auto leading-relaxed mb-6"
            >
              CaseCanopy blends advanced AI with deep legal expertise to help you research, analyze, and strategize across every domain of law. Discover precedents, predict outcomes, and collaborate with confidence—all in one place.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-sm md:text-base text-legal-gold max-w-xl mx-auto mb-10 italic font-medium"
            >
              &quot;Where legal tradition meets tomorrow&apos;s technology.&quot;
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {authenticated ? (
                <Link
                  href="/search"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-legal-navy bg-legal-gold rounded-xl shadow-legal hover:shadow-legal-hover transition-all duration-200"
                >
                  Start Searching
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-legal-navy bg-legal-gold rounded-xl shadow-legal hover:shadow-legal-hover transition-all duration-200"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/signup"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-legal-gold bg-legal-navy/50 rounded-xl shadow-legal hover:shadow-legal-hover transition-all duration-200 border border-legal-gold/30"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-legal-gold/20 text-legal-gold mb-4 glass">
              <Sparkles className="h-5 w-5 mr-2 animate-pulse text-legal-gold" />
              <span className="text-sm font-medium">Features</span>
            </div>
            <h2 className="text-4xl font-bold text-legal-parchment mb-4">
              Powerful Features for Legal Research
            </h2>
            <p className="text-xl text-legal-silver max-w-3xl mx-auto">
              Discover how CaseCanopy revolutionizes legal research with cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="py-24 bg-gradient-to-b from-legal-navy/90 to-legal-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
