import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Home,
  ArrowRightLeft,
  BanknoteArrowDown,
  User,
  LogOut,
  Menu,
  Users,
  Shield,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  ChevronDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import { GetAllUsers, UpdateUserVerifiedStatus } from "../apicalls/users";
import { message } from "antd";

// Mobile User Card Component
const MobileUserCard = ({ user, formatDate, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${
              user.isAdmin
                ? "bg-purple-900/30 text-purple-400 border-purple-400/30"
                : "bg-blue-900/30 text-blue-400 border-blue-400/30"
            }`}
          >
            {user.isAdmin ? (
              <Shield className="w-3 h-3 mr-1" />
            ) : (
              <User className="w-3 h-3 mr-1" />
            )}
            <span>{user.isAdmin ? "Admin" : "User"}</span>
          </span>
          <p className="text-xs text-gray-400 mt-1">
            {user.isVerified ? (
              <span className="text-green-400 flex items-center">
                <UserCheck className="w-3 h-3 mr-1" />
                Verified
              </span>
            ) : (
              <span className="text-red-400 flex items-center">
                <UserX className="w-3 h-3 mr-1" />
                Unverified
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-3">
        {user.isVerified ? (
          <button
            onClick={() => onUpdateStatus(user, false)}
            className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 text-red-400 rounded-lg text-xs font-medium transition-colors flex items-center justify-center cursor-pointer"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Suspend User
          </button>
        ) : (
          <button
            onClick={() => onUpdateStatus(user, true)}
            className="w-full px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-green-400 rounded-lg text-xs font-medium transition-colors flex items-center justify-center cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Activate User
          </button>
        )}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-gray-400 hover:text-white transition-colors"
      >
        <span className="text-xs">ID: {user._id?.slice(0, 8)}...</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-700/60 space-y-2">
          {user.contactNo && (
            <p className="text-xs text-gray-400 flex items-center">
              <Phone className="w-3 h-3 mr-2" />
              <strong>Mobile:</strong>{" "}
              <span className="ml-1">{user.contactNo}</span>
            </p>
          )}
          <p className="text-xs text-gray-400 flex items-center">
            <Calendar className="w-3 h-3 mr-2" />
            <strong>Joined:</strong>{" "}
            <span className="ml-1">{formatDate(user.createdAt)}</span>
          </p>
          <p className="text-xs text-gray-400 font-mono break-all">
            <strong>Full ID:</strong> {user._id}
          </p>
        </div>
      )}
    </div>
  );
};

export default function UsersPage() {
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [activeTabContent, setActiveTabContent] = useState("all");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.users);

  const userMenu = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      onClick: () => console.log("Navigate to dashboard"),
      path: "/dashboard",
    },
    {
      id: "transactions",
      icon: ArrowRightLeft,
      label: "Transactions",
      onClick: () => console.log("Navigate to transactions"),
      path: "/transactions",
    },
    {
      id: "requests",
      icon: BanknoteArrowDown,
      label: "Requests",
      onClick: () => console.log("Navigate to requests"),
      path: "/requests",
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/logout");
      },
      path: "/logout",
    },
  ];

  const adminMenu = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      onClick: () => console.log("Navigate to dashboard"),
      path: "/dashboard",
    },
    {
      id: "users",
      icon: Users,
      label: "Users",
      onClick: () => console.log("Navigate to users"),
      path: "/users",
    },
    {
      id: "transactions",
      icon: ArrowRightLeft,
      label: "Transactions",
      onClick: () => console.log("Navigate to transactions"),
      path: "/transactions",
    },
    {
      id: "requests",
      icon: BanknoteArrowDown,
      label: "Requests",
      onClick: () => console.log("Navigate to requests"),
      path: "/requests",
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/logout");
      },
      path: "/logout",
    },
  ];

  const menuToRender = user?.isAdmin ? adminMenu : userMenu;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const updateStatus = async (record, isVerified) => {
    try {
      dispatch(showLoading());
      const response = await UpdateUserVerifiedStatus({
        selectedUser: record._id,
        isVerified,
      });
      dispatch(hideLoading());
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      message.error(error.message);
    }
  };

  const getData = async () => {
    try {
      setIsLoading(true);
      dispatch(showLoading());
      const response = await GetAllUsers();

      if (response.success) {
        setUsers(response.data);
      } else {
        message.error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      message.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
      dispatch(hideLoading());
    }
  };

  // Load data on component mount
  useEffect(() => {
    getData();
  }, []);

  // Filter users based on active tab
  const getFilteredUsers = () => {
    switch (activeTabContent) {
      case "admins":
        return users.filter((u) => u.isAdmin);
      case "verified":
        return users.filter((u) => u.isVerified);
      case "unverified":
        return users.filter((u) => !u.isVerified);
      default:
        return users;
    }
  };

  const currentUsers = getFilteredUsers();

  // Statistics
  const stats = {
    total: users.length,
    admins: users.filter((u) => u.isAdmin).length,
    verified: users.filter((u) => u.isVerified).length,
    unverified: users.filter((u) => !u.isVerified).length,
  };

  return (
    <div className="min-h-dvh bg-gradient-to-tr from-black via-[#1e0b06] to-black text-white flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        menuItems={menuToRender}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-dvh">
        {/* Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-md border-b border-gray-700/60 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mr-3 lg:mr-4 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
            <div className="text-3xl lg:text-sm text-center text-gray-400">
              <span className="font-semibold text-white">Transacto</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mt-12 lg:mt-0 flex-1 p-4 lg:p-4 max-w-dvw">
          <div className="max-w-5xl mx-auto mt-2 no-scrollbar">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">
                USERS
              </h1>

              {/* Refresh Button */}
              <button
                className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm lg:text-base"
                onClick={getData}
                disabled={isLoading}
              >
                {isLoading ? "REFRESHING..." : "REFRESH DATA"}
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl overflow-hidden mb-6">
              <div className="flex border-b border-gray-700/60 overflow-x-auto">
                <button
                  onClick={() => setActiveTabContent("all")}
                  className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                    activeTabContent === "all"
                      ? "bg-amber-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  <span>All ({stats.total})</span>
                </button>
                <button
                  onClick={() => setActiveTabContent("admins")}
                  className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                    activeTabContent === "admins"
                      ? "bg-amber-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Admins ({stats.admins})</span>
                </button>
                <button
                  onClick={() => setActiveTabContent("verified")}
                  className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                    activeTabContent === "verified"
                      ? "bg-amber-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    Verified ({stats.verified})
                  </span>
                  <span className="sm:hidden">✓ ({stats.verified})</span>
                </button>
                <button
                  onClick={() => setActiveTabContent("unverified")}
                  className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                    activeTabContent === "unverified"
                      ? "bg-amber-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    Unverified ({stats.unverified})
                  </span>
                  <span className="sm:hidden">✗ ({stats.unverified})</span>
                </button>
              </div>

              {/* Mobile View - Cards */}
              <div className="block lg:hidden">
                {currentUsers.length > 0 ? (
                  <div className="p-4">
                    {currentUsers.map((userItem) => (
                      <MobileUserCard
                        key={userItem._id}
                        user={userItem}
                        formatDate={formatDate}
                        onUpdateStatus={updateStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                      No {activeTabContent} users found
                    </p>
                    <p className="text-gray-500 text-sm px-4">
                      {activeTabContent === "all"
                        ? "No users are registered yet"
                        : `No ${activeTabContent} users found`}
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Id
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/60">
                    {currentUsers.map((userItem) => (
                      <tr
                        key={userItem._id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                          {userItem._id?.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {userItem.firstName} {userItem.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            {userItem.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {userItem.contactNo ? (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              {userItem.contactNo}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                              userItem.isAdmin
                                ? "bg-purple-900/30 text-purple-400 border-purple-400/30"
                                : "bg-blue-900/30 text-blue-400 border-blue-400/30"
                            }`}
                          >
                            {userItem.isAdmin ? (
                              <Shield className="w-3 h-3 mr-1" />
                            ) : (
                              <User className="w-3 h-3 mr-1" />
                            )}
                            <span>{userItem.isAdmin ? "Admin" : "User"}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                              userItem.isVerified
                                ? "bg-green-900/30 text-green-400 border-green-400/30"
                                : "bg-red-900/30 text-red-400 border-red-400/30"
                            }`}
                          >
                            {userItem.isVerified ? (
                              <UserCheck className="w-3 h-3 mr-1" />
                            ) : (
                              <UserX className="w-3 h-3 mr-1" />
                            )}
                            <span>
                              {userItem.isVerified ? "Verified" : "Unverified"}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {userItem.isVerified ? (
                            <button
                              onClick={() => updateStatus(userItem, false)}
                              className="inline-flex items-center px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 text-red-400 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => updateStatus(userItem, true)}
                              className="inline-flex items-center px-3 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-green-400 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty State for Desktop */}
                {currentUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                      No {activeTabContent} users found
                    </p>
                    <p className="text-gray-500 text-sm">
                      {activeTabContent === "all"
                        ? "No users are registered yet"
                        : `No ${activeTabContent} users found`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-400">
                      Total Users
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-amber-400">
                      {stats.total}
                    </p>
                  </div>
                  <Users className="w-6 h-6 lg:w-8 lg:h-8 text-amber-400 opacity-60" />
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-400">Admins</p>
                    <p className="text-xl lg:text-2xl font-bold text-purple-400">
                      {stats.admins}
                    </p>
                  </div>
                  <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-purple-400 opacity-60" />
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-400">Verified</p>
                    <p className="text-xl lg:text-2xl font-bold text-green-400">
                      {stats.verified}
                    </p>
                  </div>
                  <UserCheck className="w-6 h-6 lg:w-8 lg:h-8 text-green-400 opacity-60" />
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-400">
                      Unverified
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-red-400">
                      {stats.unverified}
                    </p>
                  </div>
                  <UserX className="w-6 h-6 lg:w-8 lg:h-8 text-red-400 opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
