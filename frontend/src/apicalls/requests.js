import { axiosInstance } from ".";

//get all requests for a user
export const GetAllRequestsByUser = async () => {
  try {
    const { data } = await axiosInstance.get(
      "/api/requests/get-all-requests-by-user"
    );
    return data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to fetch requests",
      }
    );
  }
};

//send requests to another user
export const SendRequest = async (request) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/requests/send-request",
      request
    );
    return data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to send request",
      }
    );
  }
};

//update request status (accept/reject)
export const UpdateRequestStatus = async (requestId, status) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/requests/update-request-status",
      { requestId, status }
    );
    return data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to update request status",
      }
    );
  }
};
