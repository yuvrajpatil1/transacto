import { axiosInstance } from ".";

//verify receiver account (no PIN needed)
export const VerifyAccount = async (payload) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/transactions/verify-account",
      payload
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
};

// transfer funds with PIN verification
export const TransferFunds = async (payload) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/transactions/transfer-funds",
      payload
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
};

// get all txns for a user (no PIN needed)
export const GetTransactionsOfUser = async (payload) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/transactions/get-all-transactions-by-user",
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// deposit funds with PIN verification for all payment methods
export const DepositFunds = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/api/transactions/deposit-funds",
      payload
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// NEW: Verify PIN function (to be called before processing payments)
export const VerifyTransactionPin = async (transactionPin) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/transactions/verify-transaction-pin",
      { transactionPin },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("VerifyTransactionPin error:", error);
    return error.response?.data || { success: false, message: error.message };
  }
};
