const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Expense = require("../models/expenseModel");
const Income = require("../models/incomeModel");
const Budget = require("../models/budgetModel");

// Add new expense
router.post("/add-expense", authMiddleware, async (req, res) => {
  try {
    const { description, amount, category } = req.body;

    if (!description || !amount || !category) {
      return res.send({
        success: false,
        message: "All fields are required",
      });
    }

    const expense = new Expense({
      userId: req.userId,
      description,
      amount: parseFloat(amount),
      category,
      type: "expense",
    });

    await expense.save();

    res.send({
      success: true,
      message: "Expense added successfully",
      data: expense,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Add new income
router.post("/add-income", authMiddleware, async (req, res) => {
  try {
    const { source, amount, category } = req.body;

    if (!source || !amount || !category) {
      return res.send({
        success: false,
        message: "All fields are required",
      });
    }

    const income = new Income({
      userId: req.userId,
      source,
      amount: parseFloat(amount),
      category,
    });

    await income.save();

    res.send({
      success: true,
      message: "Income added successfully",
      data: income,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Get all expenses for user
router.get("/get-expenses", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.send({
      success: true,
      message: "Expenses fetched successfully",
      data: expenses,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Get all income for user
router.get("/get-income", authMiddleware, async (req, res) => {
  try {
    const income = await Income.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.send({
      success: true,
      message: "Income fetched successfully",
      data: income,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Delete expense
router.delete("/delete-expense/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      return res.send({
        success: false,
        message: "Expense not found",
      });
    }

    res.send({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Delete income
router.delete("/delete-income/:id", authMiddleware, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!income) {
      return res.send({
        success: false,
        message: "Income not found",
      });
    }

    res.send({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Set/Update budget
router.post("/set-budget", authMiddleware, async (req, res) => {
  try {
    const { monthlyBudget, categoryBudgets } = req.body;

    let budget = await Budget.findOne({ userId: req.userId });

    if (budget) {
      budget.monthlyBudget = monthlyBudget || budget.monthlyBudget;
      budget.categoryBudgets = categoryBudgets || budget.categoryBudgets;
      await budget.save();
    } else {
      budget = new Budget({
        userId: req.userId,
        monthlyBudget: monthlyBudget || 0,
        categoryBudgets: categoryBudgets || {},
      });
      await budget.save();
    }

    res.send({
      success: true,
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Get budget
router.get("/get-budget", authMiddleware, async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.userId });

    if (!budget) {
      budget = new Budget({
        userId: req.userId,
        monthlyBudget: 5000,
      });
      await budget.save();
    }

    res.send({
      success: true,
      message: "Budget fetched successfully",
      data: budget,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Get dashboard data
router.get("/get-dashboard-data", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    const income = await Income.find({ userId: req.userId });
    const budget = await Budget.findOne({ userId: req.userId });

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpenses;

    res.send({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        expenses,
        income,
        budget: budget || { monthlyBudget: 5000 },
        totalIncome,
        totalExpenses,
        balance,
      },
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
