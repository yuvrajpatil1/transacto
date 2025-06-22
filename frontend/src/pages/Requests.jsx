import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Home,
  ArrowRightLeft,
  BanknoteArrowDown,
  User,
  LogOut,
  X,
  Menu,
  Users,
  Check,
  Clock,
  Send,
  Inbox,
  ChevronDown,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import NewRequestModal from "./modals/NewRequestModal";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import {
  GetAllRequestsByUser,
  UpdateRequestStatus,
} from "../apicalls/requests";
import { message } from "antd";
import { toast } from "react-toastify";
import Transition from "../Transition";

// Mobile Request Card Component
const MobileRequestCard = ({
  request,
  activeTabContent,
  handleApprove,
  handleReject,
  formatDate,
  getStatusColor,
  getStatusIcon,
}) => {
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
              {activeTabContent === "sent"
                ? request.receiver?.firstName + " " + request.receiver?.lastName
                : request.sender?.firstName + " " + request.sender?.lastName}
            </p>
            <p className="text-xs text-gray-400">
              {formatDate(request.createdAt)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-amber-400 text-lg">₹{request.amount}</p>
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
              request.status
            )}`}
          >
            {getStatusIcon(request.status)}
            <span className="ml-1 capitalize">{request.status}</span>
          </span>
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-gray-400 hover:text-white transition-colors"
      >
        <span className="text-xs">ID: {request._id?.slice(0, 8)}...</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-700/60">
          <p className="text-xs text-gray-400 mb-2">
            <strong>Reference:</strong> {request.reference}
          </p>
          <p className="text-xs text-gray-400 mb-3 font-mono break-all">
            <strong>Full ID:</strong> {request._id}
          </p>
          {activeTabContent === "received" && request.status === "pending" && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleApprove(request._id)}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleReject(request._id)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function RequestsPage() {
  const dispatch = useDispatch();
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");
  const [activeTabContent, setActiveTabContent] = useState("sent");
  const [data, setData] = useState({
    sent: [],
    received: [],
  });
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

  const handleApprove = async (requestId) => {
    try {
      setIsLoading(true);
      dispatch(showLoading());

      const response = await UpdateRequestStatus(requestId, "accepted");

      if (response.success) {
        toast.success("Request approved successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "✅",
        });

        // Refresh the data
        await getData();
        dispatch(ReloadUser(true));
      } else {
        toast.error(response.message || "Failed to approve request", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "❌",
        });
      }
    } catch (error) {
      toast.error("Failed to approve request. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "⚠️",
      });
      console.error("Error approving request:", error);
    } finally {
      setIsLoading(false);
      dispatch(hideLoading());
    }
  };

  const handleReject = async (requestId) => {
    try {
      setIsLoading(true);
      dispatch(showLoading());

      const response = await UpdateRequestStatus(requestId, "rejected");

      if (response.success) {
        toast.success("Request rejected successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "🚫",
        });

        // Refresh the data
        await getData();
        dispatch(ReloadUser(true));
      } else {
        toast.error(response.message || "Failed to reject request", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "❌",
        });
      }
    } catch (error) {
      toast.error("Failed to reject request. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "⚠️",
      });
      console.error("Error rejecting request:", error);
    } finally {
      setIsLoading(false);
      dispatch(hideLoading());
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-400/30";
      case "accepted":
        return "bg-green-900/30 text-green-400 border-green-400/30";
      case "rejected":
        return "bg-red-900/30 text-red-400 border-red-400/30";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-400/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3 lg:w-4 lg:h-4" />;
      case "accepted":
        return <Check className="w-3 h-3 lg:w-4 lg:h-4" />;
      case "rejected":
        return <X className="w-3 h-3 lg:w-4 lg:h-4" />;
      default:
        return <Clock className="w-3 h-3 lg:w-4 lg:h-4" />;
    }
  };

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

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await GetAllRequestsByUser();

      if (response.success) {
        const sentData = response.data.filter(
          (item) => item.sender._id === user._id
        );
        const receivedData = response.data.filter(
          (item) => item.receiver._id === user._id
        );
        setData({
          sent: sentData,
          received: receivedData,
        });
      } else {
        message.error(response.message || "Failed to fetch requests");
      }
    } catch (error) {
      message.error("Failed to fetch requests");
      console.error("Error fetching requests:", error);
    } finally {
      dispatch(hideLoading());
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      getData();
    }
  }, [user]);

  // Get current requests based on active tab
  const currentRequests =
    activeTabContent === "sent" ? data.sent : data.received;

  // Helper function to get the display name for a request
  const getDisplayName = (request, tab) => {
    if (tab === "sent") {
      return request.receiver?.firstName + " " + request.receiver?.lastName;
    } else {
      return request.sender?.firstName + " " + request.sender?.lastName;
    }
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
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-md border-b border-gray-700/60 z-30">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-100">Transacto</h1>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-5xl mx-auto mt-18 lg:mt-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">
                REQUESTS
              </h1>

              {/* Request Money Button */}
              <button
                className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm lg:text-base"
                onClick={() => setShowNewRequestModal(true)}
              >
                REQUEST MONEY
              </button>
            </div>

            <NewRequestModal
              showNewRequestModal={showNewRequestModal}
              setShowNewRequestModal={setShowNewRequestModal}
              onRequestSent={getData} // Refresh data when a new request is sent
            />

            {/* Tab Navigation */}
            <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl overflow-hidden mb-6">
              <div className="flex border-b border-gray-700/60">
                <button
                  onClick={() => setActiveTabContent("sent")}
                  className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center ${
                    activeTabContent === "sent"
                      ? "bg-amber-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span className="xs:inline">Sent ({data.sent.length})</span>
                </button>
                <button
                  onClick={() => setActiveTabContent("received")}
                  className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center ${
                    activeTabContent === "received"
                      ? "bg-amber-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <Inbox className="w-4 h-4 mr-2" />
                  <span className="xs:inline">
                    Received ({data.received.length})
                  </span>
                </button>
              </div>

              {/* Mobile View - Cards */}
              <div className="block lg:hidden">
                {currentRequests.length > 0 ? (
                  <div className="p-4">
                    {currentRequests.map((request) => (
                      <MobileRequestCard
                        key={request._id}
                        request={request}
                        activeTabContent={activeTabContent}
                        handleApprove={handleApprove}
                        handleReject={handleReject}
                        formatDate={formatDate}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {activeTabContent === "sent" ? (
                      <Send className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    ) : (
                      <Inbox className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    )}
                    <p className="text-gray-400 text-lg">
                      No {activeTabContent} requests found
                    </p>
                    <p className="text-gray-500 text-sm px-4">
                      {activeTabContent === "sent"
                        ? "You haven't sent any money requests yet"
                        : "You haven't received any money requests yet"}
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
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        {activeTabContent === "sent" ? "To" : "From"}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Date/Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/60">
                    {currentRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                          {request._id?.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-amber-400">
                          ₹{request.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {getDisplayName(request, activeTabContent)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                          {request.reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">
                              {request.status}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {activeTabContent === "received" &&
                          request.status === "pending" ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApprove(request._id)}
                                disabled={isLoading}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors flex items-center"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request._id)}
                                disabled={isLoading}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors flex items-center"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">
                              {formatDate(request.createdAt)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty State for Desktop */}
                {currentRequests.length === 0 && (
                  <div className="text-center py-12">
                    {activeTabContent === "sent" ? (
                      <Send className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    ) : (
                      <Inbox className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    )}
                    <p className="text-gray-400 text-lg">
                      No {activeTabContent} requests found
                    </p>
                    <p className="text-gray-500 text-sm">
                      {activeTabContent === "sent"
                        ? "You haven't sent any money requests yet"
                        : "You haven't received any money requests yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-400">
                      Total Sent
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-amber-400">
                      {data.sent.length}
                    </p>
                  </div>
                  <Send className="w-6 h-6 lg:w-8 lg:h-8 text-amber-400 opacity-60" />
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-400">
                      Total Received
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-green-400">
                      {data.received.length}
                    </p>
                  </div>
                  <Inbox className="w-6 h-6 lg:w-8 lg:h-8 text-green-400 opacity-60" />
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-400">Pending</p>
                    <p className="text-xl lg:text-2xl font-bold text-yellow-400">
                      {
                        [...data.sent, ...data.received].filter(
                          (r) => r.status === "pending"
                        ).length
                      }
                    </p>
                  </div>
                  <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400 opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <div className="border-t border-gray-800 py-6 mt-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400 mb-4 md:mb-0">
              <span className="hidden md:block">
                © 2025 Transacto Technologies Pvt. Ltd. All rights reserved.
              </span>
              <span className="md:hidden text-center">
                © 2025 Transacto Technologies Pvt. Ltd. <br /> All rights
                reserved.
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span>Developed with ❤️ by</span>
                <a
                  className="underline text-white"
                  href="https://linkedin.com/in/yuvrajkpatil"
                >
                  Yuvraj Patil.
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transition(RequestsPage);
