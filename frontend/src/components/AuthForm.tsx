"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, signup } from "@/utils/auth";
import { LoginCredentials, SignupCredentials } from "@/types/auth";
import { Scale, Globe, User, Mail, Lock } from "lucide-react";
import TermsAndConditionsModal from "./TermsAndConditionsModal";

interface AuthFormProps {
  mode: "login" | "signup";
  onClose: () => void;
  onSuccess?: () => void;
}

type UserRole = "legal" | "public";

export default function AuthForm({ mode, onClose, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("public");
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState<
    LoginCredentials | SignupCredentials
  >({
    email: "",
    password: "",
    ...(mode === "signup" && { name: "", confirmPassword: "" }),
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (mode === "signup") {
      setShowTerms(true);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const authState = await login(formData as LoginCredentials);
        if (
          authState.user &&
          (authState.user.role !== "legal" || authState.user.approve)
        ) {
          router.push("/dashboard");
          if (onSuccess) onSuccess();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTermsAccept = async () => {
    setShowTerms(false);
    setLoading(true);

    try {
      const signupData = formData as SignupCredentials;
      if (signupData.password !== signupData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (selectedRole === "legal") {
        if (!file) {
          throw new Error("Please upload a document for verification");
        }
        const form = new FormData();
        form.append("name", signupData.name);
        form.append("email", signupData.email);
        form.append("password", signupData.password);
        form.append("role", selectedRole);
        form.append("file", file);
        const res = await fetch("http://localhost:8000/api/signup-legal", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to sign up");
        }
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setError(
          "Registration successful! Please wait for admin approval before signing in."
        );
        return;
      } else {
        await signup({ ...signupData, role: selectedRole });
        router.push("/dashboard");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const roles = [
    {
      id: "public",
      name: "General Public",
      icon: Globe,
      description: "Citizens interested in justice",
    },
    {
      id: "legal",
      name: "Legal Professional",
      icon: Scale,
      description: "Lawyers, paralegals, and legal researchers",
    },
  ];

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-50">
        <div className="w-full max-w-md mx-4">
          <div className="bg-black/80 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="text-center flex-1">
                  <h2 className="text-3xl font-bold text-white">
                    {mode === "login"
                      ? "Sign in to CaseCanopy"
                      : "Join CaseCanopy"}
                  </h2>
                  <p className="mt-2 text-gray-300">
                    {mode === "login"
                      ? "Unlock the power of AI-driven legal research"
                      : "Begin your journey to better legal research"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
                  aria-label="Close"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id as UserRole)}
                          className={`relative rounded-xl border p-4 flex flex-col items-center space-y-3 focus:outline-none transition-all duration-200 cursor-pointer ${
                            selectedRole === role.id
                              ? "border-legal-gold bg-legal-gold/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <role.icon
                            className={`h-6 w-6 ${
                              selectedRole === role.id
                                ? "text-legal-gold"
                                : "text-gray-300"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              selectedRole === role.id
                                ? "text-legal-gold"
                                : "text-white"
                            }`}
                          >
                            {role.name}
                          </span>
                          <p className="text-xs text-gray-400 text-center">
                            {role.description}
                          </p>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label htmlFor="name" className="sr-only">
                        Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          className="appearance-none bg-white/10 relative block w-full px-3 py-3 pl-10 border border-white/10 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                          placeholder="Full name"
                          value={(formData as SignupCredentials).name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none bg-white/10 relative block w-full px-3 py-3 pl-10 border border-white/10 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      required
                      className="appearance-none bg-white/10 relative block w-full px-3 py-3 pl-10 border border-white/10 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {mode === "signup" && (
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="appearance-none bg-white/10 relative block w-full px-3 py-3 pl-10 border border-white/10 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                        placeholder="Confirm Password"
                        value={(formData as SignupCredentials).confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {mode === "signup" && selectedRole === "legal" && (
                  <div>
                    <label
                      htmlFor="file"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Upload Verification Document
                    </label>
                    <input
                      id="file"
                      name="file"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-300 border border-white/10 rounded-xl cursor-pointer bg-white/5 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-legal-gold/80 file:text-black hover:file:bg-legal-gold transition-colors"
                    />
                  </div>
                )}

                {error && (
                  <div className={`text-sm text-center p-3 rounded-lg ${
                    error.includes("Registration successful") 
                      ? "bg-legal-gold/10 text-legal-gold" 
                      : "bg-red-500/10 text-red-400"
                  }`}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 text-base font-medium rounded-xl text-black bg-white hover:bg-legal-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-legal-gold focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {mode === "login" ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : mode === "login" ? (
                    "Sign in"
                  ) : (
                    "Create Account"
                  )}
                </button>

                {mode === "login" ? (
                  <div className="text-center space-y-3">
                    <div className="text-sm text-gray-400">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/signup"
                        className="font-medium text-legal-gold hover:text-legal-gold/80"
                      >
                        Sign up now
                      </Link>
                    </div>
                    <div className="text-xs text-gray-500">
                      By signing in, you agree to our{" "}
                      <a href="#" className="text-legal-gold/80 hover:text-legal-gold">Terms of Service</a>
                      {" "}and{" "}
                      <a href="#" className="text-legal-gold/80 hover:text-legal-gold">Privacy Policy</a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm text-gray-400">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-medium text-legal-gold hover:text-legal-gold/80"
                      >
                        Sign in
                      </Link>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      <TermsAndConditionsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleTermsAccept}
        userRole={selectedRole}
      />
    </>
  );
}
