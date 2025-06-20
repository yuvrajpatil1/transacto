import axios from "axios";
import { axiosInstance } from ".";

//login User
export const LoginUser = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/api/users/login", payload);
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//Register User
export const RegisterUser = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/api/users/register", payload);
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//get user info
export const GetUserInfo = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/users/get-user-info",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

//get all users
export const GetAllUsers = async () => {
  try {
    const { data } = await axiosInstance.get("/api/users/get-all-users");
    return data;
  } catch (error) {
    return error.response.data;
  }
};

//update user verified status
export const UpdateUserVerifiedStatus = async (payload) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/users/update-user-verified-status",
      payload
    );
    return data; // Make sure to return the response data
  } catch (error) {
    console.error("UpdateUserVerifiedStatus error:", error);
    throw error; // Re-throw the error so it can be handled in the component
  }
};

//genarate qr code
export const GenerateQRCode = async (customURL = null) => {
  try {
    const params = customURL ? { url: customURL } : {};
    const { data } = await axiosInstance.get("/api/users/generate-qr", {
      params,
    });
    return data;
  } catch (error) {
    console.error(
      "GenerateQRCode error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
