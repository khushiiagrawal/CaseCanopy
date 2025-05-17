"use client";

import Link from "next/link";
import { isAuthenticated } from "@/utils/auth";
import { Scale, ArrowRight, BookOpen, Gavel, FileText } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedFeatureCard from "@/components/AnimatedFeatureCard";
import Image from "next/image";
import { useState, useRef } from "react";
import AuthForm from "@/components/AuthForm";

export default function Home() {
  const authenticated = isAuthenticated();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);

  // Reference for scroll animations
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  // Text animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.1,
        ease: [0.215, 0.61, 0.355, 1]
      }
    })
  };

  // Staggered text animation for paragraphs
  const paragraphVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  // Additional animations for different elements
  const scaleUp = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i = 0) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: i * 0.1,
        ease: "easeOut"
      }
    })
  };

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
    <div className="min-h-screen bg-black overflow-hidden">

      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden flex flex-col justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/lady.jpg"
            alt="Lady Justice"
            fill
            priority
            className="object-cover object-center brightness-75"
            quality={100}
          />
          <div className="absolute inset-0 bg-black/10 backdrop-filter backdrop-blur-xs" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 flex flex-col min-h-[80vh] justify-center">
          <div className="text-center flex flex-col items-center">

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-slide-up"
            >
              <span className="block text-white">
                CaseCanopy
              </span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="block text-legal-gold mt-2 text-lg sm:text-2xl md:text-4xl"
              >
                Equal Access to Legal Insight
              </motion.span>
            </motion.h1>

            {/* Animated gold accent underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mx-auto mb-6 origin-left h-1 w-24 sm:w-32 bg-gradient-to-r from-legal-gold to-yellow-400 rounded-full"
            />

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed mb-10 sm:mb-14"
            >
              Bridging the justice gap — an AI-powered platform that enables cross-jurisdiction legal precedent discovery and outcome prediction to support equitable litigation for all.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              {authenticated ? (
                <Link
                  href="/search"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white/90 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 min-w-[160px] w-full max-w-xs sm:w-auto"
                >
                  Start Searching
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginForm(true)}
                    className="group inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white/90 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 min-w-[160px] w-full max-w-xs sm:w-auto"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <span className="hidden sm:inline-block text-gray-400 font-medium px-2">or</span>

                  <button
                    onClick={() => setShowSignupForm(true)}
                    className="group inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white/90 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 min-w-[160px] w-full max-w-xs sm:w-auto"
                  >
                    Sign Up
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Scroll down chevron */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: 1.2 }}
              className="flex justify-center mt-4"
            >
              <span className="animate-bounce text-legal-gold text-3xl cursor-pointer" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                &#8595;
              </span>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Auth Modals */}
      {showLoginForm && (
        <AuthForm
          mode="login"
          onClose={() => setShowLoginForm(false)}
        />
      )}

      {showSignupForm && (
        <AuthForm
          mode="signup"
          onClose={() => setShowSignupForm(false)}
        />
      )}

      {/* Features Section */}
      <div id="features" className="min-h-screen flex flex-col justify-center py-10 sm:py-16 bg-black" ref={featuresRef}>
        <div className="w-full px-4 sm:px-6 md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={paragraphVariants}
            className="text-center mb-16 sm:mb-24"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6"
            >
              Powerful Features for Legal Research
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Discover how CaseCanopy revolutionizes legal research with cutting-edge AI technology
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:gap-10 max-w-6xl mx-auto sm:grid-cols-2 lg:grid-cols-2 place-items-center">
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
      <div className="min-h-screen flex flex-col justify-center bg-black py-10 sm:py-16" ref={ctaRef}>
        <div className="w-full px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={paragraphVariants}
            className="max-w-4xl mx-auto"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-8 sm:mb-16"
            >
              Ready to Transform Your Legal Research?
            </motion.h2>

            <motion.div className="space-y-6 sm:space-y-12 mb-8 sm:mb-10">
              <motion.p
                variants={fadeInUp}
                custom={1}
                className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed"
              >
                In today&apos;s complex legal landscape, traditional research methods simply don&apos;t cut it anymore. <span className="text-legal-gold">CaseCanopy is the only platform</span> combining advanced AI with comprehensive legal databases to deliver insights no other service can match.
              </motion.p>

              <motion.p
                variants={fadeInUp}
                custom={2}
                className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed"
              >
                Whether you&apos;re a seasoned attorney, legal researcher, or advocate for justice, our exclusive technology gives you the competitive edge you need in an increasingly challenging field.
              </motion.p>

              <motion.p
                variants={fadeInUp}
                custom={3}
                className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed"
              >
                Don&apos;t settle for outdated tools when the future of legal research is here. <span className="text-white font-semibold">CaseCanopy is the solution you&apos;ve been searching for.</span>
              </motion.p>
            </motion.div>

            <motion.button
              variants={scaleUp}
              custom={4}
              onClick={() => setShowSignupForm(true)}
              className="inline-flex items-center justify-center px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-medium text-black bg-legal-gold hover:bg-legal-gold/90 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Join the Legal Revolution
              <ArrowRight className="ml-3 h-6 w-6" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

