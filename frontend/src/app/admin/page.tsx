"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSignInModal from "@/components/AdminSignInModal";
import Navbar from "@/components/Navbar";

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
  const [approvingUsers, setApprovingUsers] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const adminUser = localStorage.getItem("adminUser");

    if (!adminToken || !adminUser) {
      router.push("/admin/login");
      return;
    }

    try {
      const userData = JSON.parse(adminUser);
      if (userData.role !== "admin") {
        router.push("/admin/login");
        return;
      }

      fetchLegalUsers();
    } catch (err) {
      console.error("Error parsing user data:", err);
      router.push("/admin/login");
    }
  }, [router]);

  const fetchLegalUsers = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        router.push("/admin/login");
        return;
      }

      console.log("Fetching legal users from backend...");
      const response = await fetch(
        "http://localhost:8000/api/admin/users/legal",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const data = await response.json();
      console.log("Fetched legal users:", data);

      if (Array.isArray(data)) {
        // Sort by name
        const sortedUsers = data.sort((a, b) => a.name.localeCompare(b.name));
        setUsers(sortedUsers);
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
      setApprovingUsers((prev) => ({ ...prev, [userEmail]: true }));
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        setShowSignInModal(true);
        return;
      }

      const response = await fetch(
        "http://localhost:8000/api/admin/users/legal/approve",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve user");
      }

      // Refresh the users list to get updated data
      await fetchLegalUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve user");
      console.error(err);
    } finally {
      setApprovingUsers((prev) => ({ ...prev, [userEmail]: false }));
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
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-24 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl bg-[#232C47] shadow-lg rounded-xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center space-x-3">
              <span className="text-white text-2xl">🛡️</span>
              <span className="text-white text-2xl font-semibold tracking-wide">
                CaseCanopy
              </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Legal User Approvals
            </h1>
          </div>
          {error && (
            <div className="mb-4 text-center bg-red-600 text-white py-2 px-4 rounded-lg font-semibold">
              {error}
            </div>
          )}
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-[#2D395B]">
              <thead className="bg-[#1B243B]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#3EC6FF] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#3EC6FF] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#3EC6FF] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#3EC6FF] uppercase tracking-wider">
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
                    <tr
                      key={user._id}
                      className="hover:bg-[#2D395B] transition-colors duration-200"
                    >
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
                            disabled={approvingUsers[user.email]}
                            className={`relative bg-[#3EC6FF] hover:bg-[#1FB6FF] text-[#19223A] font-bold py-2 px-5 rounded-lg shadow-md transition-colors duration-200 min-w-[100px] ${
                              approvingUsers[user.email]
                                ? "opacity-75 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {approvingUsers[user.email] ? (
                              <>
                                <span className="opacity-0">Approve</span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-5 h-5 border-2 border-[#19223A] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              </>
                            ) : (
                              "Approve"
                            )}
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
