"use client";

import Link from "next/link";
import { Scale, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import { isAuthenticated, logout } from "@/utils/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Check authentication status on component mount and when auth state changes
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());

    // Listen for storage events (for when logout happens in another tab)
    const handleStorageChange = () => {
      setIsLoggedIn(isAuthenticated());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
  };

  // Navbar links
  const navLinks = (
    <>
      <Link
        href="/"
        className="navbar-home text-gray-300 text-lg font-medium hover:text-legal-gold transition-colors relative group block py-2 px-2 md:px-0"
      >
        Home
      </Link>
      <Link
        href="/#features"
        className="navbar-features text-gray-300 text-lg font-medium hover:text-legal-gold transition-colors relative group block py-2 px-2 md:px-0"
      >
        Features
      </Link>
      <Link
        href="/search"
        className="navbar-search text-gray-300 text-lg font-medium hover:text-legal-gold transition-colors relative group block py-2 px-2 md:px-0"
      >
        Search
      </Link>
      {isLoggedIn ? (
        <>
          <Link
            href="/dashboard"
            className="navbar-dashboard text-gray-300 text-lg font-medium hover:text-legal-gold transition-colors relative group block py-2 px-2 md:px-0"
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="navbar-logout flex items-center gap-1.5 px-5 py-2 cursor-pointer text-white bg-legal-gold hover:bg-legal-gold/90 rounded-xl font-medium transition-colors relative group overflow-hidden w-full md:w-auto mt-2 md:mt-0"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setShowLoginForm(true);
              setMobileMenuOpen(false);
            }}
            className="navbar-login text-gray-300 text-lg cursor-pointer font-medium transition-colors relative group block py-2 px-2 md:px-0 w-full md:w-auto"
          >
            Login
          </button>
          <button
            onClick={() => {
              setShowSignupForm(true);
              setMobileMenuOpen(false);
            }}
            className="navbar-signup text-gray-300 text-lg font-medium cursor-pointer transition-colors relative group block py-2 px-2 md:px-0 w-full md:w-auto"
          >
            Sign Up
          </button>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="w-full bg-black/30 backdrop-blur-lg shadow-md py-2 px-4 md:px-8 flex items-center justify-between fixed top-0 gap-4 z-40">
        <div className="flex items-center gap-3">
          <div>
            <Scale className="h-7 w-7 text-legal-gold" />
          </div>
          <span className="text-white text-xl font-bold tracking-wide select-none">
            CaseCanopy
          </span>
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">{navLinks}</div>
        {/* Hamburger menu button */}
        <button
          className="md:hidden text-gray-300 hover:text-legal-gold focus:outline-none p-2"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-7 w-7" />
          ) : (
            <Menu className="h-7 w-7" />
          )}
        </button>
      </nav>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/80 flex flex-col items-center justify-start pt-20 px-4 md:hidden animate-fade-in">
          <div className="w-full flex flex-col gap-2 items-center">
            {navLinks}
          </div>
        </div>
      )}
      {showLoginForm && (
        <AuthForm
          mode="login"
          onClose={() => {
            setShowLoginForm(false);
            setIsLoggedIn(isAuthenticated());
          }}
          onSuccess={() => {
            setShowLoginForm(false);
            setIsLoggedIn(isAuthenticated());
            router.push("/dashboard");
          }}
        />
      )}
      {showSignupForm && (
        <AuthForm
          mode="signup"
          onClose={() => {
            setShowSignupForm(false);
            setIsLoggedIn(isAuthenticated());
          }}
          onSuccess={() => {
            setShowSignupForm(false);
            setIsLoggedIn(isAuthenticated());
            router.push("/dashboard");
          }}
        />
      )}
    </>
  );
}
