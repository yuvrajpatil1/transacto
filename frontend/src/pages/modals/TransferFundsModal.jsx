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
import { TransferFunds, VerifyAccount } from "../../apicalls/transactions";
import { showLoading, hideLoading } from "../../redux/loaderSlice";
import { ReloadUser } from "../../redux/usersSlice";
import { toast } from "react-toastify";

function TransferFundsModal({
  showTransferFundsModal,
  setShowTransferFundsModal,
  reloadData,
}) {
  const { user } = useSelector((state) => state.users);
  const [isVerified, setIsVerified] = useState();
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    receiver: "",
    amount: "",
    reference: "",
  });
  const [errors, setErrors] = useState({});
  const [verifiedAccount, setVerifiedAccount] = useState(null);

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
  };

  const dispatch = useDispatch();

  const handleVerify = async () => {
    if (!formData.receiver.trim()) {
      setErrors((prev) => ({
        ...prev,
        receiver: "Account number is required",
      }));
      return;
    }

    try {
      dispatch(showLoading());
      const response = await VerifyAccount({ receiver: formData.receiver });
      dispatch(hideLoading());

      if (response.success) {
        setIsVerified(true);
        setVerifiedAccount(response.data);
        setErrors((prev) => ({ ...prev, receiver: "" }));
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
      setIsVerified(false);
      setVerifiedAccount(null);
      setErrors((prev) => ({
        ...prev,
        receiver: error.message || "Verification error",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.receiver.trim()) {
      newErrors.receiver = "Account number is required";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (parseFloat(formData.amount) > user.balance) {
      newErrors.amount = "Insufficient balance";
    }

    if (!formData.reference.trim()) {
      newErrors.reference = "Reference is required";
    }

    if (!isVerified) {
      newErrors.receiver = "Please verify the account first";
    }

    setErrors(newErrors);

    // If errors exist, abort early
    if (Object.keys(newErrors).length > 0) {
      toast.warning("Please fix the errors before proceeding", {
        position: "top-right",
        autoClose: 3000,
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
        ...formData,
        sender: user._id,
        type: "debit",
        status: "success",
        // reference: values.receiver,
      };

      const response = await TransferFunds(payload);
      dispatch(hideLoading());

      if (response.success) {
        toast.success(response.message || "Transfer completed successfully!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "💸",
        });

        console.log("Transfer successful");
        handleClose();
        reloadData();
        setShowTransferFundsModal(false);
        dispatch(ReloadUser(true));

        // Add a small delay before reload to show the success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(response.message || "Transfer failed. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "❌",
        });
        console.log("Transfer failed:", response.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error(
        error.message ||
          "Transfer failed. Please check your connection and try again.",
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
      console.error("Transfer error:", error);
    }
  };

  const handleClose = () => {
    setShowTransferFundsModal(false);
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

  if (!showTransferFundsModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/60">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center">
              <Send className="w-5 h-5 mr-2 text-amber-400" />
              Transfer Funds
            </h2>
            <p className="text-sm text-gray-300 pt-2">
              Current Balance: ₹{user.balance?.toLocaleString("en-IN")}
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
        <div className="p-6 space-y-6">
          {/* Account Number Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <User className="w-4 h-4 mr-2 text-amber-400" />
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
                  placeholder="Enter recipient's account number"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.receiver
                      ? "border-red-500 focus:ring-red-500"
                      : isVerified
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-600 focus:ring-amber-500"
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
                disabled={isVerifying || isVerified}
                className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  isVerified
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : isVerifying
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
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
                  <p>
                    <span className="font-medium">Bank:</span>{" "}
                    {verifiedAccount.bankName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <IndianRupee className="w-4 h-4 mr-2 text-amber-400" />
              Amount
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="Enter amount to transfer"
              min="1"
              step="0.01"
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.amount
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:ring-amber-500"
              }`}
            />
            {errors.amount && (
              <p className="text-sm text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* reference */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-amber-400" />
              reference
            </label>
            <textarea
              value={formData.reference}
              onChange={(e) => handleInputChange("reference", e.target.value)}
              placeholder="Enter transfer reference"
              rows="3"
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.reference
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:ring-amber-500"
              }`}
            />
            {errors.reference && (
              <p className="text-sm text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.reference}
              </p>
            )}
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
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Transfer Funds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransferFundsModal;
