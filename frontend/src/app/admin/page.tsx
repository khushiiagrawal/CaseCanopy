"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSignInModal from "@/components/AdminSignInModal";

interface LegalUser {
  _id: string;
  name: string;
  email: string;
  approve: boolean;
  documentPath: string;
  role: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<LegalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSignInModal, setShowSignInModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      setShowSignInModal(true);
      setLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== "admin") {
        router.push("/");
        return;
      }

      fetchLegalUsers();
    } catch (err) {
      console.error("Error parsing user data:", err);
      setShowSignInModal(true);
      setLoading(false);
    }
  }, []);

  const fetchLegalUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowSignInModal(true);
        return;
      }

      console.log("Fetching all users from backend...");
      const response = await fetch("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowSignInModal(true);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const data = await response.json();
      console.log("Fetched all users:", data);

      if (Array.isArray(data)) {
        // Filter for legal users and sort by name
        const legalUsers = data
          .filter((user) => user.role === "legal")
          .sort((a, b) => a.name.localeCompare(b.name));

        console.log("Filtered legal users:", legalUsers);
        setUsers(legalUsers);
      } else {
        console.error("Expected array of users but got:", data);
        setError("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userEmail: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowSignInModal(true);
        return;
      }

      const response = await fetch(
        "http://localhost:8000/api/admin/users/legal/approve",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setShowSignInModal(true);
          return;
        }
        throw new Error("Failed to approve user");
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.email === userEmail ? { ...user, approve: true } : user
        )
      );
    } catch (err) {
      setError("Failed to approve user");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3EC6FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#19223A] flex flex-col">
      {/* Header Bar */}
      <header className="bg-[#19223A] shadow-md py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-[#3EC6FF] rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">🛡️</span>
          </div>
          <span className="text-white text-2xl font-semibold tracking-wide">
            CaseCanopy Admin
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start py-10 px-2 sm:px-0">
        <div className="w-full max-w-4xl bg-[#232C47] shadow-lg rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-white">
            Legal User Approvals
          </h1>
          {error && (
            <div className="mb-4 text-center bg-red-600 text-white py-2 px-4 rounded-lg font-semibold">
              {error}
            </div>
          )}
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-[#2D395B]">
              <thead className="bg-[#1B243B]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3EC6FF] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3EC6FF] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3EC6FF] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3EC6FF] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#232C47] divide-y divide-[#2D395B]">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      No legal users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#B0C4DE]">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.approve
                              ? "bg-green-500/20 text-green-300 border border-green-400"
                              : "bg-yellow-500/20 text-yellow-300 border border-yellow-400"
                          }`}
                        >
                          {user.approve ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!user.approve && (
                          <button
                            onClick={() => handleApprove(user.email)}
                            className="bg-[#3EC6FF] hover:bg-[#1FB6FF] text-[#19223A] font-bold py-2 px-5 rounded-lg shadow-md transition-colors duration-200"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showSignInModal && (
        <AdminSignInModal onClose={() => setShowSignInModal(false)} />
      )}
    </div>
  );
}
