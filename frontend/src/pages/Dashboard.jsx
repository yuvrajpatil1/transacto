// ISSUES IDENTIFIED AND FIXES:

// 1. MISSING DISPATCH IMPORT - You're using dispatch but haven't imported it
import React, { useState } from "react";
import {
  Home,
  ArrowRightLeft,
  ArrowUpDown,
  BanknoteArrowDown,
  User,
  LogOut,
  X,
  Banknote,
  Copy,
  Eye,
  EyeOff,
  Wallet,
  Menu,
  Users,
  Send,
  Plus,
  Download,
  TrendingUp,
  Activity,
  CreditCard,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux"; // ✅ Already imported
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SlideInOnScrollTable from "../components/SlideInOnScrollTable";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import { message } from "antd";
import { useEffect } from "react";
import { GetTransactionsOfUser } from "../apicalls/transactions";
import { GenerateQRCode } from "../apicalls/users"; // ✅ Make sure this path is correct

export default function Dashboard({ children }) {
  const { user } = useSelector((state) => state.users);
  const [showBalance, setShowBalance] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [txnData, setTxnData] = useState([]);

  // 2. DISPATCH DECLARATION - Move dispatch declaration to the top
  const dispatch = useDispatch();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.split("/")[1] || "dashboard"
  );

  const navigate = useNavigate();

  // ... (menu arrays remain the same)
  const userMenu = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      id: "transactions",
      icon: ArrowRightLeft,
      label: "Transactions",
      onClick: () => navigate("/transactions"),
      path: "/transactions",
    },
    {
      id: "requests",
      icon: BanknoteArrowDown,
      label: "Requests",
      onClick: () => navigate("/requests"),
      path: "/requests",
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/");
      },
      path: "/",
    },
  ];

  const adminMenu = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      id: "users",
      icon: Users,
      label: "Users",
      onClick: () => navigate("/users"),
      path: "/users",
    },
    {
      id: "transactions",
      icon: ArrowRightLeft,
      label: "Transactions",
      onClick: () => navigate("/transactions"),
      path: "/transactions",
    },
    {
      id: "requests",
      icon: BanknoteArrowDown,
      label: "Requests",
      onClick: () => navigate("/requests"),
      path: "/requests",
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/");
      },
      path: "/",
    },
  ];

  const menuToRender = user?.isAdmin ? adminMenu : userMenu;

  // Quick Actions Data
  const quickActions = [
    {
      id: "send",
      icon: Send,
      label: "Send Money",
      color: "bg-amber-600",
      hoverColor: "hover:bg-amber-700",
      onClick: () => navigate("/transactions"),
    },
    {
      id: "request",
      icon: Download,
      label: "Request Money",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      onClick: () => navigate("/requests"),
    },
    {
      id: "deposit",
      icon: Plus,
      label: "Add Money",
      color: "bg-green-600",
      hoverColor: "hover:green-700",
      onClick: () => navigate("/transactions"),
    },
    {
      id: "history",
      icon: Activity,
      label: "View History",
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      onClick: () => navigate("/transactions"),
    },
  ];

  // 3. IMPROVED QR CODE FUNCTION WITH BETTER ERROR HANDLING
  const getQrCode = async () => {
    if (!user?._id) {
      console.log("User ID not available yet");
      return;
    }

    try {
      console.log("Generating QR code for user:", user._id); // Debug log
      dispatch(showLoading());

      const response = await GenerateQRCode({ userId: user._id });
      console.log("QR Code response:", response); // Debug log

      if (response.success) {
        setQrCode(response.data);
        console.log("QR code set successfully"); // Debug log
      } else {
        message.error("Failed to generate QR code");
      }
    } catch (error) {
      console.error("QR Code generation error:", error); // Better error logging
      message.error(error.message || "Failed to generate QR code");
    } finally {
      dispatch(hideLoading());
    }
  };

  // 4. IMPROVED TRANSACTION DATA FUNCTION
  const getTxnData = async () => {
    if (!user?._id) {
      console.log("User ID not available yet");
      return;
    }

    try {
      console.log("Fetching transactions for user:", user._id); // Debug log
      dispatch(showLoading());

      const response = await GetTransactionsOfUser({ userId: user._id });
      console.log("Transactions response:", response); // Debug log

      if (response.success) {
        setTxnData(response.data);
      } else {
        message.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Transaction fetch error:", error); // Better error logging
      message.error(error.message || "Failed to fetch transactions");
    } finally {
      dispatch(hideLoading());
    }
  };

  // 5. IMPROVED useEffect WITH DEPENDENCY ARRAYS
  useEffect(() => {
    if (user?._id) {
      console.log("User loaded, fetching QR code..."); // Debug log
      getQrCode();
    }
  }, [user?._id]); // Better dependency array

  useEffect(() => {
    if (user?._id) {
      console.log("User loaded, fetching transactions..."); // Debug log
      getTxnData();
    }
  }, [user?._id]); // Better dependency array

  // Utility functions
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Account number copied to clipboard!");
  };

  const handleMenuClick = (itemId) => {
    if (itemId === "logout") {
      message.info("Logging out...");
      localStorage.removeItem("token");
      return;
    }
    setActiveTab(itemId);
    navigate(`/${itemId}`);
    setIsSidebarOpen(false);
  };

  // Get recent transactions (last 3, sorted by time)
  const recentTransactions = txnData
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-black via-[#1e0b06] to-black text-white flex overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-md border-b border-gray-700/60 z-30">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-300 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-100">Transacto</h1>
          </div>

          <div className="w-10" />
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        menuItems={menuToRender}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 pt-20 lg:pt-6">
          {/* Desktop Welcome Message */}

          <div className="max-w-5xl mx-auto space-y-6">
            <div className="hidden lg:block mb-8">
              <h1 className="text-3xl font-bold text-gray-100">
                Hi {user?.firstName || "User"}, Welcome to Transacto!
              </h1>
            </div>
            {/* Balance Card - Mobile Optimized */}
            <div className="flex flex-col lg:flex-row mt-4 gap-6">
              {" "}
              {/* 6. FIXED LAYOUT */}
              {/* User Details Card */}
              <div className="flex-1">
                <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-2xl overflow-hidden shadow-xl">
                  {/* Balance Header */}
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 sm:p-6 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Account Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg font-semibold mb-2">
                          Account Number
                        </h3>
                        <div className="flex items-center">
                          <span className="font-mono text-sm sm:text-lg tracking-wider mr-2 truncate">
                            {user?._id || "Loading..."}
                          </span>
                          <button
                            onClick={() => copyToClipboard(user?._id)}
                            className="p-1.5 sm:p-2 hover:bg-orange-400 hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
                            title="Copy account number"
                          >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Balance Info */}
                      <div className="flex items-center justify-between w-full sm:w-auto">
                        <div>
                          <h3 className="text-sm sm:text-lg font-semibold mb-1">
                            Balance
                          </h3>
                          <div className="flex items-center">
                            <span className="text-xl sm:text-3xl font-bold mr-2 sm:mr-3">
                              {showBalance
                                ? `₹${Math.round(
                                    user?.balance || 0
                                  ).toLocaleString("en-IN")}`
                                : "****"}
                            </span>
                            <button
                              onClick={() => setShowBalance(!showBalance)}
                              className="p-1.5 sm:p-2 hover:bg-orange-400 hover:bg-opacity-20 rounded-lg transition-colors"
                              title={
                                showBalance ? "Hide balance" : "Show balance"
                              }
                            >
                              {showBalance ? (
                                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <Wallet className="w-12 h-12 sm:w-16 sm:h-16 opacity-20 ml-4 sm:ml-0" />
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            First Name:
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2">
                            {user?.firstName || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Last Name:
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2">
                            {user?.lastName || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Email:
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2 break-all">
                            {user?.email || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Contact No.:
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2">
                            {user?.contactNo || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Identity:
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2">
                            {user?.identification || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Id Number:
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2">
                            {user?.identificationNumber || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 7. FIXED QR CODE SECTION */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-2xl overflow-hidden shadow-xl h-full">
                  <div className="p-6 flex flex-col items-center justify-center h-full">
                    <h3 className="text-xl font-bold mb-6 text-gray-100">
                      Payment QR Code
                    </h3>

                    {/* 8. BETTER QR CODE RENDERING WITH LOADING STATE */}
                    {qrCode ? (
                      <div className="text-center">
                        <img
                          src={qrCode}
                          alt="Payment QR Code"
                          className="h-56 w-56 object-contain rounded-lg shadow-lg mb-4"
                          onError={(e) => {
                            console.error("QR Code image failed to load");
                            e.target.style.display = "none";
                          }}
                        />
                        <p className="text-sm text-gray-400">
                          Scan to make payment
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="h-48 w-48 bg-gray-700/50 rounded-lg flex items-center justify-center mb-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        </div>
                        <p className="text-sm text-gray-400">
                          Generating QR Code...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rest of the component remains the same... */}
            {/* Quick Actions */}
            <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-2xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4 sm:mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.onClick}
                    className={`${action.color} ${action.hoverColor} text-white rounded-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-lg group`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <action.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-xs sm:text-sm font-semibold">
                        {action.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity - keeping original structure */}
            <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
                  Recent Activity
                </h2>
                <button
                  onClick={() => navigate("/transactions")}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  View All
                </button>
              </div>

              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {/* Desktop Table View - keeping original */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-900/60">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            To/From
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/60">
                        {recentTransactions.map((transaction) => {
                          const isDeposit =
                            transaction.sender._id === transaction.receiver._id;
                          const isDebit = transaction.sender._id === user._id;

                          return (
                            <tr
                              key={transaction._id}
                              className="hover:bg-gray-700/30 transition-colors"
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                                <span
                                  className={
                                    isDebit ? "text-red-400" : "text-green-400"
                                  }
                                >
                                  {isDebit ? "-" : "+"} ₹{transaction.amount}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                                    isDeposit
                                      ? "bg-blue-900/30 text-blue-400 border-blue-400/30"
                                      : isDebit
                                      ? "bg-red-900/30 text-red-400 border-red-400/30"
                                      : "bg-green-900/30 text-green-400 border-green-400/30"
                                  }`}
                                >
                                  {isDeposit
                                    ? "Deposit"
                                    : isDebit
                                    ? "Debit"
                                    : "Credit"}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 font-mono">
                                {isDeposit
                                  ? "Self"
                                  : isDebit
                                  ? transaction.receiver._id ||
                                    transaction.receiver
                                  : transaction.sender._id ||
                                    transaction.sender}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                                    transaction.status === "success"
                                      ? "bg-green-900/30 text-green-400 border-green-400/30"
                                      : "bg-red-900/30 text-red-400 border-red-400/30"
                                  }`}
                                >
                                  {transaction.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View - keeping original TransactionCard component */}
                  <div className="lg:hidden">
                    {recentTransactions.map((transaction) => (
                      <SlideInOnScrollTable key={transaction._id}>
                        <TransactionCard
                          transaction={transaction}
                          user={user}
                        />
                      </SlideInOnScrollTable>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    No recent transactions
                  </p>
                  <p className="text-gray-500 text-sm">
                    Your transaction history will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// TransactionCard Component (keeping original)
const TransactionCard = ({ transaction, user }) => {
  const getTransactionType = () => {
    if (transaction.sender._id === transaction.receiver._id) {
      return {
        type: "Deposit",
        color: "bg-blue-900/30 text-blue-400 border-blue-400/30",
      };
    } else if (transaction.sender._id === user._id) {
      return {
        type: "Debit",
        color: "bg-red-900/30 text-red-400 border-red-400/30",
      };
    } else {
      return {
        type: "Credit",
        color: "bg-green-900/30 text-green-400 border-green-400/30",
      };
    }
  };

  const getAmountDisplay = () => {
    if (transaction.sender._id === transaction.receiver._id) {
      return { amount: `+₹${transaction.amount}`, color: "text-green-400" };
    } else if (transaction.sender._id === user._id) {
      return { amount: `-₹${transaction.amount}`, color: "text-red-400" };
    } else {
      return { amount: `+₹${transaction.amount}`, color: "text-green-400" };
    }
  };

  const transactionType = getTransactionType();
  const amountDisplay = getAmountDisplay();

  return (
    <div className="bg-gray-700/30 rounded-xl p-4 mb-4 border border-gray-600/30">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${transactionType.color}`}
            >
              {transactionType.type}
            </span>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                transaction.status === "success"
                  ? "bg-green-900/30 text-green-400 border-green-400/30"
                  : "bg-red-900/30 text-red-400 border-red-400/30"
              }`}
            >
              {transaction.status}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-1">
            {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
            {new Date(transaction.createdAt).toLocaleTimeString()}
          </p>
          <p className="text-xs text-gray-500 font-mono">
            ID: {transaction._id}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${amountDisplay.color}`}>
            {amountDisplay.amount}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">To:</span>
          <span className="text-gray-300 font-mono">
            {transaction.receiver._id || transaction.receiver}
          </span>
        </div>
        {transaction.reference && (
          <div className="flex justify-between">
            <span className="text-gray-400">Reference:</span>
            <span className="text-gray-300">{transaction.reference}</span>
          </div>
        )}
      </div>
    </div>
  );
};
