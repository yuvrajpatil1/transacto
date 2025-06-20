import { axiosInstance } from ".";

//verify receiver account
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

// transfer funds
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

// get all txns for a user
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
