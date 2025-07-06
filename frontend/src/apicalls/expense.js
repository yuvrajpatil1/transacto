import { axiosInstance } from ".";

//add new expense
export const AddExpense = async (payload) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/expenses/add-expense",
      payload
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//add new income
export const AddIncome = async (payload) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/expenses/add-income",
      payload
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//get all expenses
export const GetExpenses = async () => {
  try {
    const { data } = await axiosInstance.get("/api/expenses/get-expenses");
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//get all income
export const GetIncome = async () => {
  try {
    const { data } = await axiosInstance.get("/api/expenses/get-income");
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//delete expense
export const DeleteExpense = async (expenseId) => {
  try {
    const { data } = await axiosInstance.delete(
      `/api/expenses/delete-expense/${expenseId}`
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//delete income
export const DeleteIncome = async (incomeId) => {
  try {
    const { data } = await axiosInstance.delete(
      `/api/expenses/delete-income/${incomeId}`
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//set/update budget
export const SetBudget = async (payload) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/expenses/set-budget",
      payload
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//get budget
export const GetBudget = async () => {
  try {
    const { data } = await axiosInstance.get("/api/expenses/get-budget");
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//get dashboard data
export const GetDashboardData = async () => {
  try {
    const { data } = await axiosInstance.get(
      "/api/expenses/get-dashboard-data"
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
};
