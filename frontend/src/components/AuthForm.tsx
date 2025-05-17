"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, signup } from "@/utils/auth";
import { LoginCredentials, SignupCredentials } from "@/types/auth";
import { Scale, Globe, User, Mail, Lock, Phone, MapPin } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
  onClose: () => void;
}

type UserRole = "legal" | "public";

export default function AuthForm({ mode, onClose }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("legal");
  const [formData, setFormData] = useState<
    LoginCredentials | SignupCredentials
  >({
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
    setLoading(true);

    try {
      if (mode === "login") {
        const authState = await login(formData as LoginCredentials);
        // Only navigate if login was successful and user is approved (for legal users)
        if (
          authState.user &&
          (authState.user.role !== "legal" || authState.user.approve)
        ) {
          router.push("/dashboard");
        }
      } else {
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

          console.log("Sending form data:", {
            name: signupData.name,
            email: signupData.email,
            role: selectedRole,
            phone: signupData.phone,
            address: signupData.address,
            hasFile: !!file
          });

          const res = await fetch("http://localhost:8000/api/signup-legal", {
            method: "POST",
            body: form,
          });
          if (!res.ok) {
            const errorData = await res.json();
            console.error("Signup error response:", errorData);
            throw new Error(errorData.error || "Failed to sign up");
          }
          const data = await res.json();
          console.log("Signup successful:", data);
          // Store the response data
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          // Show success message for legal signup
          setError(
            "Registration successful! Please wait for admin approval before signing in."
          );
          return;
        } else {
          await signup({ ...signupData, role: selectedRole });
          router.push("/dashboard");
        }
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
      id: "legal",
      name: "Legal Professional",
      icon: Scale,
      description: "Lawyers, paralegals, and legal researchers",
    },
    {
      id: "public",
      name: "General Public",
      icon: Globe,
      description: "Citizens interested in  justice",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-modern overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === "login"
                    ? "Sign in to your account"
                    : "Create your account"}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {mode === "login"
                    ? "Access your legal research tools"
                    : "Join our community of justice seekers"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5 text-gray-500 dark:text-gray-400"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id as UserRole)}
                        className={`relative rounded-lg border p-4 flex flex-col items-center space-y-2 hover:border-primary-500 focus:outline-none transition-colors duration-200 cursor-pointer ${
                          selectedRole === role.id
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <role.icon
                          className={`h-6 w-6 ${
                            selectedRole === role.id
                              ? "text-primary-600"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            selectedRole === role.id
                              ? "text-primary-600"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {role.name}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
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
                        className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 dark:bg-gray-700 sm:text-sm"
                        placeholder="Full name"
                        value={(formData as SignupCredentials).name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="sr-only">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 dark:bg-gray-700 sm:text-sm"
                        placeholder="Phone Number"
                        value={(formData as SignupCredentials).phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="sr-only">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        required
                        className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 dark:bg-gray-700 sm:text-sm"
                        placeholder="Address"
                        value={(formData as SignupCredentials).address}
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
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 dark:bg-gray-700 sm:text-sm"
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
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 dark:bg-gray-700 sm:text-sm"
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
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 dark:bg-gray-700 sm:text-sm"
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
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Upload PDF or Image
                  </label>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-primary hover:shadow-modern-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer "
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  "Sign up"
                )}
              </button>

              {mode === "login" && (
                <div className="text-sm text-center">
                  <Link
                    href="/signup"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Don&apos;t have an account? Sign up
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
