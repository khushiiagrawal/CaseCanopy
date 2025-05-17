"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, signup } from "@/utils/auth";
import { LoginCredentials, SignupCredentials } from "@/types/auth";
import { Scale, Globe, User, Mail, Lock, Phone, MapPin } from "lucide-react";
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
  const [formData, setFormData] = useState<LoginCredentials | SignupCredentials>({
    email: "",
    password: "",
    ...(mode === "signup" && {
      name: "",
      confirmPassword: "",
      phone: "",
      address: ""
    }),
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
        form.append("phone", signupData.phone);
        form.append("address", signupData.address);
        form.append("file", file);

        const res = await fetch("http://localhost:8000/api/signup-legal", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to sign up");
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setError("Registration successful! Please wait for admin approval before signing in.");
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
        <div className="w-full max-w-md mx-2 sm:mx-4">
          <div className="bg-black/80 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-8 overflow-y-auto flex-1">
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
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {mode === "signup" && (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id as UserRole)}
                          className={`relative rounded-xl border p-4 flex flex-col items-center space-y-3 focus:outline-none transition-all duration-200 cursor-pointer w-full text-center ${
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

                    <div className="relative flex flex-col">
                      <label htmlFor="name" className="sr-only">Name</label>
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Full name"
                        className="appearance-none bg-white/10 block w-full px-3 py-3 pl-12 border border-white/10 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                        value={(formData as SignupCredentials).name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="relative flex flex-col">
                      <label htmlFor="phone" className="sr-only">Phone Number</label>
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="Phone Number"
                        className="appearance-none block w-full px-3 py-3 pl-12 border border-white/10 placeholder-gray-400 text-white rounded-xl bg-white/10 focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                        value={(formData as SignupCredentials).phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="relative flex flex-col">
                      <label htmlFor="address" className="sr-only">Address</label>
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        id="address"
                        name="address"
                        type="text"
                        required
                        placeholder="Address"
                        className="appearance-none block w-full px-3 py-3 pl-12 border border-white/10 placeholder-gray-400 text-white rounded-xl bg-white/10 focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                        value={(formData as SignupCredentials).address}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-4">
                  <div className="relative flex flex-col">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email address"
                      className="appearance-none block w-full px-3 py-3 pl-12 border border-white/10 placeholder-gray-400 text-white rounded-xl bg-white/10 focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="relative flex flex-col">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Password"
                      className="appearance-none block w-full px-3 py-3 pl-12 border border-white/10 placeholder-gray-400 text-white rounded-xl bg-white/10 focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  {mode === "signup" && (
                    <div className="relative flex flex-col">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        placeholder="Confirm Password"
                        className="appearance-none block w-full px-3 py-3 pl-12 border border-white/10 placeholder-gray-400 text-white rounded-xl bg-white/10 focus:outline-none focus:ring-legal-gold/50 focus:border-legal-gold transition-colors duration-200"
                        value={(formData as SignupCredentials).confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>

                {mode === "signup" && selectedRole === "legal" && (
                  <div>
                    <label htmlFor="file" className="block text-md font-medium text-white mb-2">Upload Verification Document</label>
                    <input
                      id="file"
                      name="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                      className="block w-full text-sm text-gray-300 bg-black/20 p-2 rounded-lg border border-white/10 cursor-pointer focus:outline-none"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                )}

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  className="w-full py-3 mt-4 font-semibold rounded-xl bg-legal-gold text-white border hover:text-black hover:bg-yellow-500 transition-colors duration-200 text-base sm:text-lg"
                  disabled={loading}
                >
                  {loading
                    ? mode === "login"
                      ? "Signing in..."
                      : "Signing up..."
                    : mode === "login"
                    ? "Sign In"
                    : "Sign Up"}
                </button>
              </form>

              {mode === "login" && (
                <p className="mt-4 text-center text-sm text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link href="#" className="text-legal-gold hover:underline">
                    Sign up
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTerms && (
        <TermsAndConditionsModal
          isOpen={showTerms}
          userRole={selectedRole}
          onAccept={handleTermsAccept}
          onClose={() => setShowTerms(false)}
        />
      )}
    </>
  );
}
