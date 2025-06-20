import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Menu,
  X,
  Upload,
  Camera,
  LogOut,
  Home,
  CreditCard,
  Target,
} from "lucide-react";
import {
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

const ManageExpenses = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [budget, setBudget] = useState(5000);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Sample data - replace with your API calls
  const [income, setIncome] = useState([
    {
      id: 1,
      source: "Salary",
      amount: 5000,
      date: "2024-06-01",
      category: "Job",
    },
    {
      id: 2,
      source: "Freelance",
      amount: 1200,
      date: "2024-06-05",
      category: "Contract",
    },
    {
      id: 3,
      source: "Investment",
      amount: 800,
      date: "2024-06-10",
      category: "Returns",
    },
  ]);

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      reference: "Groceries",
      amount: 250,
      date: "2024-06-02",
      category: "Food",
    },
    {
      id: 2,
      reference: "Gas",
      amount: 80,
      date: "2024-06-05",
      category: "Transport",
    },
    {
      id: 3,
      reference: "Netflix",
      amount: 15,
      date: "2024-06-08",
      category: "Entertainment",
    },
    {
      id: 4,
      reference: "Electricity Bill",
      amount: 120,
      date: "2024-06-12",
      category: "Utilities",
    },
  ]);

  const [newIncome, setNewIncome] = useState({
    source: "",
    amount: "",
    category: "Job",
  });
  const [newExpense, setNewExpense] = useState({
    reference: "",
    amount: "",
    category: "Food",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const categories = {
    income: ["Job", "Contract", "Business", "Investment", "Returns", "Other"],
    expense: [
      "Food",
      "Transport",
      "Entertainment",
      "Utilities",
      "Healthcare",
      "Shopping",
      "Other",
    ],
  };

  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
  ];

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleAddIncome = () => {
    if (newIncome.source && newIncome.amount) {
      const incomeItem = {
        id: Date.now(),
        source: newIncome.source,
        amount: parseFloat(newIncome.amount),
        date: new Date().toISOString().split("T")[0],
        category: newIncome.category,
      };
      setIncome([...income, incomeItem]);
      setNewIncome({ source: "", amount: "", category: "Job" });
    }
  };

  const handleAddExpense = () => {
    if (newExpense.reference && newExpense.amount) {
      const expenseItem = {
        id: Date.now(),
        reference: newExpense.reference,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString().split("T")[0],
        category: newExpense.category,
      };
      setExpenses([...expenses, expenseItem]);
      setNewExpense({ reference: "", amount: "", category: "Food" });
    }
  };

  const handleDeleteIncome = (id) => {
    setIncome(income.filter((item) => item.id !== id));
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((item) => item.id !== id));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Here you would integrate with Gemini API to scan the invoice
      // For demo purposes, we'll simulate adding an expense
      const simulatedExpense = {
        id: Date.now(),
        reference: "Scanned Invoice - Restaurant",
        amount: Math.floor(Math.random() * 100) + 20,
        date: new Date().toISOString().split("T")[0],
        category: "Food",
      };
      setExpenses([...expenses, simulatedExpense]);
      alert("Invoice scanned and expense added successfully!");
      setSelectedFile(null);
    }
  };

  const exportToExcel = (data, filename) => {
    // Simulate Excel export - in real implementation, use libraries like xlsx
    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(data[0]).join(",") +
      "\n" +
      data.map((row) => Object.values(row).join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getChartData = () => {
    const monthlyData = {};

    [...income, ...expenses.map((e) => ({ ...e, amount: -e.amount }))].forEach(
      (item) => {
        const month = new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
        });
        if (!monthlyData[month]) {
          monthlyData[month] = { month, income: 0, expenses: 0 };
        }
        if (item.amount > 0) {
          monthlyData[month].income += item.amount;
        } else {
          monthlyData[month].expenses += Math.abs(item.amount);
        }
      }
    );

    return Object.values(monthlyData);
  };

  const getCategoryData = (type) => {
    const data = type === "income" ? income : expenses;
    const categoryTotals = {};

    data.forEach((item) => {
      const category = item.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + item.amount;
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const recentTransactions = [
    ...income.map((i) => ({ ...i, type: "income" })),
    ...expenses.map((e) => ({ ...e, type: "expense" })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const Sidebar = () => (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/40 backdrop-blur-xl border-r border-gray-700/60 text-white transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700/60">
        <h2 className="text-xl font-bold text-gray-100">Expense Tracker</h2>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="mt-8">
        {[
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "income", label: "Income", icon: TrendingUp },
          { id: "expenses", label: "Expenses", icon: TrendingDown },
          { id: "budget", label: "Budget", icon: Target },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveView(id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-700/50 transition-colors ${
              activeView === id ? "bg-amber-600 text-white" : "text-gray-300"
            }`}
          >
            <Icon size={20} className="mr-3" />
            {label}
          </button>
        ))}
        <button className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-700/50 transition-colors mt-8 border-t border-gray-700/60 text-gray-300">
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );

  const SummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm text-gray-400">Total Balance</p>
            <p
              className={`text-xl lg:text-2xl font-bold ${
                balance >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ${balance.toLocaleString()}
            </p>
          </div>
          <div
            className={`p-3 rounded-full ${
              balance >= 0 ? "bg-green-500/20" : "bg-red-500/20"
            }`}
          >
            <DollarSign
              className={`h-6 w-6 lg:h-8 lg:w-8 ${
                balance >= 0 ? "text-green-400" : "text-red-400"
              } opacity-60`}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm text-gray-400">Total Income</p>
            <p className="text-xl lg:text-2xl font-bold text-green-400">
              ${totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-full bg-green-500/20">
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-400 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm text-gray-400">Total Expenses</p>
            <p className="text-xl lg:text-2xl font-bold text-red-400">
              ${totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-full bg-red-500/20">
            <TrendingDown className="h-6 w-6 lg:h-8 lg:w-8 text-red-400 opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div>
      <SummaryCards />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-100">
            <BarChart3 className="mr-2" size={20} />
            Monthly Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
              <Bar dataKey="income" fill="#10B981" />
              <Bar dataKey="expenses" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-100">
            <PieChart className="mr-2" size={20} />
            Expense Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={getCategoryData("expense")}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {getCategoryData("expense").map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-full mr-3 ${
                    transaction.type === "income"
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <TrendingUp className={`h-4 w-4 text-green-400`} />
                  ) : (
                    <TrendingDown className={`h-4 w-4 text-red-400`} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-100">
                    {transaction.source || transaction.reference}
                  </p>
                  <p className="text-sm text-gray-400">{transaction.date}</p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  transaction.type === "income"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}${transaction.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const IncomeView = () => (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-100">
          INCOME MANAGEMENT
        </h2>
        <button
          onClick={() => exportToExcel(income, "income-report")}
          className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm lg:text-base flex items-center justify-center"
        >
          <Download size={16} className="mr-2" />
          Export Income
        </button>
      </div>

      {/* Add Income Form */}
      <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">
          Add New Income
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Income source"
            value={newIncome.source}
            onChange={(e) =>
              setNewIncome({ ...newIncome, source: e.target.value })
            }
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newIncome.amount}
            onChange={(e) =>
              setNewIncome({ ...newIncome, amount: e.target.value })
            }
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400"
          />
          <select
            value={newIncome.category}
            onChange={(e) =>
              setNewIncome({ ...newIncome, category: e.target.value })
            }
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
          >
            {categories.income.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-700">
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddIncome}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Plus size={16} className="mr-2" />
            Add Income
          </button>
        </div>
      </div>

      {/* Income List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {income.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 hover:bg-gray-700/30 transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-100">
                  {item.source}
                </h4>
                <p className="text-green-400 font-bold text-xl">
                  ${item.amount}
                </p>
                <p className="text-sm text-gray-400">
                  {item.category} • {item.date}
                </p>
              </div>
              <button
                onClick={() => handleDeleteIncome(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ExpensesView = () => (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-100">
          EXPENSE MANAGEMENT
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex-1 sm:flex-none px-4 lg:px-6 py-2 lg:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm lg:text-base flex items-center justify-center"
          >
            <Target size={16} className="mr-2" />
            Set Budget
          </button>
          <button
            onClick={() => exportToExcel(expenses, "expenses-report")}
            className="flex-1 sm:flex-none px-4 lg:px-6 py-2 lg:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm lg:text-base flex items-center justify-center"
          >
            <Download size={16} className="mr-2" />
            Export Expenses
          </button>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-100">
            Budget Progress
          </h3>
          <span className="text-sm text-gray-400">
            ${totalExpenses} / ${budget}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              totalExpenses > budget ? "bg-red-500" : "bg-amber-500"
            }`}
            style={{
              width: `${Math.min((totalExpenses / budget) * 100, 100)}%`,
            }}
          ></div>
        </div>
        <p
          className={`text-sm mt-2 ${
            totalExpenses > budget ? "text-red-400" : "text-green-400"
          }`}
        >
          {totalExpenses > budget
            ? `Over budget by $${(totalExpenses - budget).toLocaleString()}`
            : `$${(budget - totalExpenses).toLocaleString()} remaining`}
        </p>
      </div>

      {/* Add Expense Form */}
      <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">
          Add New Expense
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Expense reference"
            value={newExpense.reference}
            onChange={(e) =>
              setNewExpense({ ...newExpense, reference: e.target.value })
            }
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400"
          />
          <select
            value={newExpense.category}
            onChange={(e) =>
              setNewExpense({ ...newExpense, category: e.target.value })
            }
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
          >
            {categories.expense.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-700">
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddExpense}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Plus size={16} className="mr-2" />
            Add Expense
          </button>
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center cursor-pointer">
            <Camera size={16} className="mr-2" />
            Scan Invoice
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Expense List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl p-4 hover:bg-gray-700/30 transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-100">
                  {item.reference}
                </h4>
                <p className="text-red-400 font-bold text-xl">${item.amount}</p>
                <p className="text-sm text-gray-400">
                  {item.category} • {item.date}
                </p>
              </div>
              <button
                onClick={() => handleDeleteExpense(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-100">
              Set Monthly Budget
            </h3>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 mb-4"
              placeholder="Enter budget amount"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-black via-[#1e0b06] to-black text-white flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="lg:hidden bg-gray-900/40 backdrop-blur-xl border-b border-gray-700/60">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-3 lg:mr-4 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <h1 className="text-lg lg:text-2xl font-bold text-gray-100">
                {activeView === "dashboard" && "Dashboard"}
                {activeView === "income" && "Income Management"}
                {activeView === "expenses" && "Expense Management"}
                {activeView === "budget" && "Budget Overview"}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Current Balance</p>
              <p
                className={`font-bold text-sm ${
                  balance >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                ${balance.toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-100">
                {activeView === "dashboard" && "Dashboard"}
                {activeView === "income" && "Income Management"}
                {activeView === "expenses" && "Expense Management"}
                {activeView === "budget" && "Budget Overview"}
              </h1>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Current Balance</p>
                  <p
                    className={`text-xl font-bold ${
                      balance >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    ${balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* View Content */}
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl border border-gray-700/60 p-4 lg:p-6">
              {activeView === "dashboard" && <Dashboard />}
              {activeView === "income" && <IncomeView />}
              {activeView === "expenses" && <ExpensesView />}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ManageExpenses;
