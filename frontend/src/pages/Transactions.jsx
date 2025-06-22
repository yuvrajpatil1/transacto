import React, { useState } from "react";
import {
  Home,
  ArrowRightLeft,
  BanknoteArrowDown,
  User,
  LogOut,
  X,
  Menu,
  Users,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TransferFundsModal from "./modals/TransferFundsModal";
import { useDispatch, useSelector } from "react-redux";
import { GetTransactionsOfUser } from "../apicalls/transactions";
import { message } from "antd";
import { showLoading, hideLoading } from "../redux/loaderSlice";
import { useEffect } from "react";
import DepositFundsModal from "./modals/DepositFundsModal";
import SlideInOnScrollTable from "../components/SlideInOnScrollTable";
import ScanToPayModal from "./modals/ScanToPayModal";

// Mock user data
const mockUser = {
  firstName: "Sathya",
  lastName: "Reddy",
  email: "sathya@example.com",
  contactNo: "+91 9876543210",
  identification: "Aadhaar",
  identificationNumber: "1234-5678-9012",
  balance: 1250,
  _id: "63677b4ea960c3c5f6720434",
  isAdmin: false,
};

export default function TransactionsPage() {
  const [showTransferFundsModal, setShowTransferFundsModal] = useState(false);
  const [showDepositFundsModal, setShowDepositFundsModal] = useState(false);
  const [showScanToPayModal, setShowScanToPayModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [qrCode, setQrCode] = useState("");

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const { user } = useSelector((state) => state.users);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await GetTransactionsOfUser({ userId: user._id });
      if (response.success) {
        setData(response.data);
      }
      dispatch(hideLoading());
    } catch (error) {
      dispatch(hideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  console.log(data);
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

  // Filter transactions based on search and filter type
  const filteredTransactions = data.filter((transaction) => {
    const isCredit = transaction.receiver === user._id;
    const type = isCredit ? "credit" : "debit";

    const matchesSearch =
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction._id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" || type === filterType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const indexOfLastTxn = currentPage * transactionsPerPage;
  const indexOfFirstTxn = indexOfLastTxn - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTxn,
    indexOfLastTxn
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  // Mobile Transaction Card Component
  const TransactionCard = ({ transaction }) => (
    <SlideInOnScrollTable>
      <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4 mb-4 space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                transaction.sender === user._id
                  ? "bg-red-900/30 text-red-400 border border-red-400/30"
                  : "bg-green-900/30 text-green-400 border border-green-400/30"
              }`}
            >
              {transaction.sender === user._id ? "Debit" : "Credit"}
            </span>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                transaction.status === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-400/30"
                  : "bg-red-900/30 text-red-400 border border-red-400/30"
              }`}
            >
              {transaction.status}
            </span>
          </div>
          <span
            className={`text-lg font-bold ${
              transaction.sender === user._id
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {transaction.sender === user._id ? "-" : "+"} ₹{transaction.amount}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-400">Date:</span>
            <span>{new Date(transaction.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Reference:</span>
            <span className="text-right">{transaction.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">To/From:</span>
            <span className="text-right font-mono text-xs break-all">
              {transaction.receiver}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Transaction ID:</span>
            <span className="text-right font-mono text-xs break-all">
              {transaction._id}
            </span>
          </div>
        </div>
      </div>
    </SlideInOnScrollTable>
  );

  return (
    <div className="min-h-dvh w-full bg-gradient-to-tr from-black via-[#1e0b06] to-black text-white flex overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-40 lg:hidden"
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-100">Transacto</h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
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
      <div className="flex-1 flex flex-col min-h-dvh">
        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-4 pt-20 lg:pt-4">
          <div className="lg:hidden text-left p-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-100">TRANSACTIONS</h1>
            <p className="text-xs text-gray-300">
              Balance: ₹{user?.balance?.toLocaleString("en-IN") || "0"}
            </p>
          </div>
          <div className="max-w-5xl mx-auto mt-2">
            {/* Desktop Page Header */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">
                  TRANSACTIONS
                </h1>
                <p className="text-sm text-gray-300 pt-2">
                  Current Balance: ₹
                  {user?.balance?.toLocaleString("en-IN") || "0"}
                </p>
              </div>

              {/* Desktop Action Buttons */}
              <div className="flex space-x-3">
                <button
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  onClick={() => setShowDepositFundsModal(true)}
                >
                  DEPOSIT
                </button>
                <button
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  onClick={() => setShowTransferFundsModal(true)}
                >
                  SEND
                </button>
                <button
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  onClick={() => setShowScanToPayModal(true)}
                >
                  SCAN TO PAY
                </button>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="lg:hidden grid grid-cols-3 gap-2 mb-6">
              <button
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
                onClick={() => setShowScanToPayModal(true)}
              >
                SCAN TO PAY
              </button>
              <button
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
                onClick={() => setShowDepositFundsModal(true)}
              >
                DEPOSIT
              </button>
              <button
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
                onClick={() => setShowTransferFundsModal(true)}
              >
                SEND
              </button>
            </div>

            <TransferFundsModal
              showTransferFundsModal={showTransferFundsModal}
              setShowTransferFundsModal={setShowTransferFundsModal}
            />
            <DepositFundsModal
              showDepositFundsModal={showDepositFundsModal}
              setShowDepositFundsModal={setShowDepositFundsModal}
            />
            <ScanToPayModal
              showScanToPayModal={showScanToPayModal}
              setShowScanToPayModal={setShowScanToPayModal}
            />

            {/* Filters and Search */}
            <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-2xl p-4 sm:p-6 mb-6">
              <div className="flex flex-col gap-4">
                {/* Top Row - Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 text-sm"
                    />
                  </div>

                  {/* Filter */}
                  <div className="relative sm:min-w-[150px]">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-8 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 focus:outline-none appearance-none text-sm"
                    >
                      <option value="all" className="bg-gray-800 text-gray-100">
                        All Types
                      </option>
                      <option
                        value="credit"
                        className="bg-gray-800 text-green-400"
                      >
                        Credit
                      </option>
                      <option
                        value="debit"
                        className="bg-gray-800 text-red-400"
                      >
                        Debit
                      </option>
                    </select>
                  </div>
                </div>

                {/* Bottom Row - Export Button */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    {filteredTransactions.length} of {data.length} transactions
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Content */}
            <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-2xl overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/60">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center">
                            Date
                            <ArrowUpDown className="w-4 h-4 ml-2 text-gray-500" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center">
                            Amount
                            <ArrowUpDown className="w-4 h-4 ml-2 text-gray-500" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Sent to
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/60">
                      {currentTransactions.map((transaction, index) => (
                        <tr
                          key={transaction._id}
                          className="hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                            {transaction._id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                            <span
                              className={
                                transaction.sender === transaction.receiver
                                  ? "text-green-400"
                                  : transaction.sender === user._id
                                  ? "text-red-400"
                                  : "text-green-400"
                              }
                            >
                              {transaction.sender === transaction.receiver
                                ? "+"
                                : transaction.sender === user._id
                                ? "-"
                                : "+"}{" "}
                              ₹{transaction.amount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                transaction.sender._id ===
                                transaction.receiver._id
                                  ? "bg-blue-900/30 text-blue-400 border border-blue-400/30"
                                  : transaction.sender._id === user._id
                                  ? "bg-red-900/30 text-red-400 border border-red-400/30"
                                  : "bg-green-900/30 text-green-400 border border-green-400/30"
                              }`}
                            >
                              {transaction.sender === transaction.receiver
                                ? "Deposit"
                                : transaction.sender === user._id
                                ? "Debit"
                                : "Credit"}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                            {transaction.receiver}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {transaction.reference}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                transaction.status === "success"
                                  ? "bg-green-900/30 text-green-400 border border-green-400/30"
                                  : "bg-red-900/30 text-red-400 border border-red-400/30"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden p-4 sm:p-6">
                {filteredTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction._id}
                    transaction={transaction}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 px-4">
                  <ArrowRightLeft className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No transactions found</p>
                  <p className="text-gray-500 text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {currentTransactions.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-400 order-2 sm:order-1">
                  Showing {indexOfFirstTxn + 1}–
                  {Math.min(indexOfLastTxn, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length} transactions
                </p>

                <div className="flex space-x-2 order-1 sm:order-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <span className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm min-w-[40px]">
                    {currentPage}
                  </span>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
