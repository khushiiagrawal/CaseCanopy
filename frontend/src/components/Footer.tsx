"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">CaseCanopy</h3>
            <p className="text-gray-300 leading-relaxed">
              Empowering legal professionals and the public with AI-powered legal research and case analysis across all domains of law.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-legal-gold transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-legal-gold transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-legal-gold transition-colors"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/search"
                  className="text-gray-300 hover:text-legal-gold transition-colors flex items-center group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 text-legal-gold/70 group-hover:translate-x-1 transition-transform" />
                  Search Cases
                </Link>
              </li>
              <li>
                <Link
                  href="/saved"
                  className="text-gray-300 hover:text-legal-gold transition-colors flex items-center group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 text-legal-gold/70 group-hover:translate-x-1 transition-transform" />
                  Saved Cases
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-legal-gold transition-colors flex items-center group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 text-legal-gold/70 group-hover:translate-x-1 transition-transform" />
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-legal-gold transition-colors flex items-center group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 text-legal-gold/70 group-hover:translate-x-1 transition-transform" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-legal-gold transition-colors flex items-center group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 text-legal-gold/70 group-hover:translate-x-1 transition-transform" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-legal-gold transition-colors flex items-center group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 text-legal-gold/70 group-hover:translate-x-1 transition-transform" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} CaseCanopy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
