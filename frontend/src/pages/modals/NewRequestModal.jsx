import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  CheckCircle,
  AlertCircle,
  Send,
  User,
  IndianRupee,
  FileText,
} from "lucide-react";
import { message } from "antd";
import { VerifyAccount } from "../../apicalls/transactions";
import { SendRequest } from "../../apicalls/requests";
import { showLoading, hideLoading } from "../../redux/loaderSlice";
import { toast } from "react-toastify";

function NewRequestModal({
  showNewRequestModal,
  setShowNewRequestModal,
  reloadData,
}) {
  const { user } = useSelector((state) => state.users);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    receiver: "",
    amount: "",
    reference: "",
  });
  const [errors, setErrors] = useState({});
  const [verifiedAccount, setVerifiedAccount] = useState(null);

  const dispatch = useDispatch();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Reset verification when receiver changes
    if (field === "receiver") {
      setIsVerified(false);
      setVerifiedAccount(null);
    }
  };

  const handleVerify = async () => {
    if (!formData.receiver.trim()) {
      setErrors((prev) => ({
        ...prev,
        receiver: "Account number is required",
      }));
      return;
    }

    // Check if user is trying to send request to themselves
    if (formData.receiver === user._id) {
      setErrors((prev) => ({
        ...prev,
        receiver: "Cannot send request to yourself",
      }));
      return;
    }

    try {
      setIsVerifying(true);
      dispatch(showLoading());

      const response = await VerifyAccount({ receiver: formData.receiver });

      dispatch(hideLoading());
      setIsVerifying(false);

      if (response.success) {
        setIsVerified(true);
        setVerifiedAccount(response.data);
        setErrors((prev) => ({ ...prev, receiver: "" }));
        message.success("Account verified successfully");
      } else {
        setIsVerified(false);
        setVerifiedAccount(null);
        setErrors((prev) => ({
          ...prev,
          receiver: response.message || "Account verification failed",
        }));
      }
    } catch (error) {
      dispatch(hideLoading());
      setIsVerifying(false);
      setIsVerified(false);
      setVerifiedAccount(null);
      setErrors((prev) => ({
        ...prev,
        receiver: error.message || "Verification error occurred",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.receiver.trim()) {
      newErrors.receiver = "Account number is required";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "Please enter a valid amount greater than 0";
      } else if (amount > 1000000) {
        newErrors.amount = "Amount cannot exceed ₹10,00,000";
      }
    }

    if (!formData.reference.trim()) {
      newErrors.reference = "Reference is required";
    } else if (formData.reference.trim().length < 3) {
      newErrors.reference = "Reference must be at least 3 characters";
    }

    if (!isVerified) {
      newErrors.receiver = "Please verify the account first";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    // If errors exist, abort early
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      toast.warning(`Please fix the error: ${newErrors[firstErrorField]}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "⚠️",
      });
      return;
    }

    try {
      dispatch(showLoading());

      const payload = {
        receiver: formData.receiver,
        amount: parseFloat(formData.amount),
        reference: formData.reference.trim(),
      };

      const response = await SendRequest(payload);
      dispatch(hideLoading());

      if (response.success) {
        toast.success(response.message || "Request sent successfully!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "📤",
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
        console.log("Request sent successfully");
        handleClose();

        // Add a small delay before reload to show the success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);

        if (reloadData) reloadData();
      } else {
        toast.error(
          response.message || "Failed to send request. Please try again.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            icon: "❌",
          }
        );
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Request error:", error);

      toast.error(
        error.message ||
          "Failed to send request. Please check your connection and try again.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "🚨",
        }
      );
    }
  };

  const handleClose = () => {
    setShowNewRequestModal(false);
    setIsVerified(false);
    setIsVerifying(false);
    setFormData({
      receiver: "",
      amount: "",
      reference: "",
    });
    setErrors({});
    setVerifiedAccount(null);
  };

  if (!showNewRequestModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/60">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center">
              <Send className="w-5 h-5 mr-2 text-amber-500" />
              Send Request
            </h2>
            <p className="text-sm text-gray-300 pt-2">
              Request funds from another account
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Account Number Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <User className="w-4 h-4 mr-2 text-amber-500" />
              Account Number
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.receiver}
                  onChange={(e) =>
                    handleInputChange("receiver", e.target.value)
                  }
                  placeholder="Enter account number to request from"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.receiver
                      ? "border-red-500 focus:ring-red-500"
                      : isVerified
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-600 focus:ring-blue-500"
                  }`}
                  disabled={isVerified}
                />
                {errors.receiver && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.receiver}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleVerify}
                disabled={
                  isVerifying || isVerified || !formData.receiver.trim()
                }
                className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  isVerified
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : isVerifying
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : !formData.receiver.trim()
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                {isVerifying ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying
                  </div>
                ) : isVerified ? (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </div>
                ) : (
                  "Verify"
                )}
              </button>
            </div>

            {/* Verification Success */}
            {isVerified && verifiedAccount && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center text-green-400 mb-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Account Verified</span>
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {verifiedAccount.name}
                  </p>
                  <p>
                    <span className="font-medium">Account:</span>{" "}
                    {verifiedAccount.accountNumber}
                  </p>
                  {verifiedAccount.bankName && (
                    <p>
                      <span className="font-medium">Bank:</span>{" "}
                      {verifiedAccount.bankName}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <IndianRupee className="w-4 h-4 mr-2 text-amber-500" />
              Amount
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="Enter amount to request"
              min="1"
              max="1000000"
              step="0.01"
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.amount
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:ring-blue-500"
              }`}
            />
            {errors.amount && (
              <p className="text-sm text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Reference */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-amber-500" />
              Reference
            </label>
            <textarea
              value={formData.reference}
              onChange={(e) => handleInputChange("reference", e.target.value)}
              placeholder="Enter reason for request (e.g., lunch money, bill payment)"
              rows="3"
              maxLength="500"
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.reference
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:ring-blue-500"
              }`}
            />
            <div className="flex justify-between">
              <div>
                {errors.reference && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.reference}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {formData.reference.length}/500
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isVerified || isVerifying}
              className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewRequestModal;
