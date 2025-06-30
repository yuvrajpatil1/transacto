import React, { useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "antd"; // Added missing import
import {
  X,
  CheckCircle,
  AlertCircle,
  Plus,
  CreditCard,
  IndianRupee,
  FileText,
  Building,
  Smartphone,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { message } from "antd";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { DepositFunds } from "../../apicalls/transactions";
import { showLoading, hideLoading } from "../../redux/loaderSlice";
import { toast } from "react-toastify";

// Initialize Stripe
const stripePromise = loadStripe(
  "pk_test_51RardOGbXFaGwlspj1ykMlqt1zYKGrXSN33WZwiHJzAUQRbVP7Qe2cz9S6mx8rLx1QrjaYO2MKlaWsmjPLJqq6p000MJvSo6MK"
);

// Card Element Options
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "transparent",
      "::placeholder": {
        color: "#9ca3af",
      },
      iconColor: "#f59e0b",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  hidePostalCode: true,
};

// Stripe Payment Form Component
function StripePaymentForm({
  amount,
  reference,
  transactionPin,
  onSuccess,
  onError,
  disabled,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || disabled) {
      toast.warning(
        "Payment system is not ready. Please wait a moment and try again.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "⏳",
        }
      );
      return;
    }

    setIsProcessing(true);
    dispatch(showLoading());

    try {
      const cardElement = elements.getElement(CardElement);

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          email: user.email,
          name: user.name,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Show processing toast for better UX
      toast.info("Processing your payment...", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "💳",
      });

      // Process payment with your backend
      const payload = {
        userId: user._id,
        amount: parseFloat(amount),
        status: "success",
        type: "deposit",
        paymentMethodId: paymentMethod.id,
        reference: reference,
        paymentMethod: "card",
        transactionPin: transactionPin,
        timestamp: new Date().toISOString(),
      };

      const response = await DepositFunds(payload);
      console.log("Deposit funds response:", response);

      if (response.success) {
        toast.success(
          "Card deposit successful! Your account has been credited.",
          {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            icon: "💰",
          }
        );

        setTimeout(() => {
          window.location.reload();
        }, 1500);

        console.log("Card deposit completed successfully");
        onSuccess();
      } else {
        // Handle specific PIN-related errors
        if (response.code === "PIN_NOT_SET") {
          toast.error("Please set your transaction PIN first in settings.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            icon: "🔐",
          });
        } else {
          throw new Error(response.message || "Card deposit failed");
        }
      }
    } catch (error) {
      console.error("Stripe payment error:", error);

      // Different error messages based on error type
      let errorMessage = "Card payment failed. Please try again.";
      let errorIcon = "❌";

      if (error.message.includes("card")) {
        errorMessage = "Card error: " + error.message;
        errorIcon = "💳";
      } else if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
        errorIcon = "🌐";
      } else if (error.message.includes("insufficient")) {
        errorMessage = "Insufficient funds on your card.";
        errorIcon = "💸";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: errorIcon,
      });

      onError(error);
    } finally {
      setIsProcessing(false);
      dispatch(hideLoading());
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Card Details
        </label>
        <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg focus-within:border-amber-500 transition-colors">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || disabled || isProcessing}
        className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center cursor-pointer"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${amount}`
        )}
      </button>
    </form>
  );
}

function DepositFundsModal({
  showDepositFundsModal,
  setShowDepositFundsModal,
  reloadData,
}) {
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const [showPin, setShowPin] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "bank_transfer",
    reference: "",
    transactionPin: "",
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
    upiDetails: {
      upiId: "",
    },
  });
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { value: "bank_transfer", label: "Bank Transfer", icon: Building },
    { value: "upi", label: "UPI Payment", icon: Smartphone },
    { value: "card", label: "Debit/Credit Card", icon: CreditCard },
  ];

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateIFSC = (ifsc) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  };

  const validateUPI = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9.-]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
  };

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (parseFloat(formData.amount) < 1) {
      newErrors.amount = "Minimum deposit amount is ₹1";
    } else if (parseFloat(formData.amount) > 100000) {
      newErrors.amount = "Maximum deposit amount is ₹1,00,000";
    }

    // Reference validation
    if (!formData.reference.trim()) {
      newErrors.reference = "Reference is required";
    } else if (formData.reference.trim().length < 3) {
      newErrors.reference = "Reference must be at least 3 characters";
    }

    // Transaction PIN validation
    if (!formData.transactionPin.trim()) {
      newErrors.transactionPin = "Transaction PIN is required";
    } else if (formData.transactionPin.length < 4) {
      newErrors.transactionPin = "PIN must be at least 4 digits";
    }

    // Payment method specific validation
    if (formData.paymentMethod === "bank_transfer") {
      if (!formData.bankDetails.accountNumber.trim()) {
        newErrors["bankDetails.accountNumber"] = "Account number is required";
      } else if (formData.bankDetails.accountNumber.length < 8) {
        newErrors["bankDetails.accountNumber"] =
          "Account number must be at least 8 digits";
      }

      if (!formData.bankDetails.ifscCode.trim()) {
        newErrors["bankDetails.ifscCode"] = "IFSC code is required";
      } else if (!validateIFSC(formData.bankDetails.ifscCode)) {
        newErrors["bankDetails.ifscCode"] = "Please enter a valid IFSC code";
      }

      if (!formData.bankDetails.bankName.trim()) {
        newErrors["bankDetails.bankName"] = "Bank name is required";
      }
    }

    if (formData.paymentMethod === "upi") {
      if (!formData.upiDetails.upiId.trim()) {
        newErrors["upiDetails.upiId"] = "UPI ID is required";
      } else if (!validateUPI(formData.upiDetails.upiId)) {
        newErrors["upiDetails.upiId"] = "Please enter a valid UPI ID";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

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
        userId: user._id,
        amount: parseFloat(formData.amount),
        status: "pending", // Non-card payments need approval
        type: "deposit",
        timestamp: new Date().toISOString(),
      };

      const response = await DepositFunds(payload);
      dispatch(hideLoading());

      if (response.success) {
        toast.success(
          response.message || "Deposit request submitted successfully!",
          {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            icon: "💰",
          }
        );
        handleClose();
        window.location.reload();
        if (reloadData) reloadData();
      } else {
        // Handle specific PIN-related errors
        if (response.code === "PIN_NOT_SET") {
          toast.error("Please set your transaction PIN first in settings.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            icon: "🔐",
          });
        } else {
          toast.error(
            response.message || "Deposit request failed. Please try again.",
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
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Deposit error:", error);
      toast.error(
        error.message ||
          "Deposit failed. Please check your connection and try again.",
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
    setShowDepositFundsModal(false);
    setShowPin(false);
    setFormData({
      amount: "",
      paymentMethod: "bank_transfer",
      reference: "",
      transactionPin: "",
      bankDetails: {
        accountNumber: "",
        ifscCode: "",
        bankName: "",
      },
      upiDetails: {
        upiId: "",
      },
    });
    setErrors({});
  };

  const handleCardPaymentSuccess = () => {
    handleClose();
    window.location.reload();
    if (reloadData) reloadData();
  };

  const handleCardPaymentError = (error) => {
    console.error("Card payment error:", error);
  };

  if (!showDepositFundsModal) return null;

  const SelectedPaymentIcon =
    paymentMethods.find((method) => method.value === formData.paymentMethod)
      ?.icon || Building;

  const formValidationErrors = validateForm();
  const isFormValid = Object.keys(formValidationErrors).length === 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/60">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-amber-400" />
              Deposit Funds
            </h2>
            <p className="text-sm text-gray-300 pt-2">
              Current Balance: ₹{user?.balance?.toLocaleString("en-IN") || "0"}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
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
              placeholder="Enter amount to deposit"
              min="1"
              max="100000"
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
            <p className="text-xs text-gray-400">
              Minimum: ₹1 | Maximum: ₹1,00,000
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <SelectedPaymentIcon className="w-4 h-4 mr-2 text-amber-400" />
              Payment Method
            </label>
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.paymentMethod === method.value
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={(e) =>
                        handleInputChange("paymentMethod", e.target.value)
                      }
                      className="sr-only"
                    />
                    <Icon className="w-4 h-4 mr-3 text-amber-400" />
                    <span className="text-white">{method.label}</span>
                    {formData.paymentMethod === method.value && (
                      <CheckCircle className="w-4 h-4 ml-auto text-amber-400" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bank Details for Bank Transfer */}
          {formData.paymentMethod === "bank_transfer" && (
            <div className="space-y-4 border-t border-gray-700/60 pt-4">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <Building className="w-4 h-4 mr-2 text-amber-400" />
                Bank Details
              </h3>

              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) =>
                    handleInputChange(
                      "bankDetails.accountNumber",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Account Number"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors["bankDetails.accountNumber"]
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                {errors["bankDetails.accountNumber"] && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors["bankDetails.accountNumber"]}
                  </p>
                )}

                <input
                  type="text"
                  value={formData.bankDetails.ifscCode}
                  onChange={(e) =>
                    handleInputChange(
                      "bankDetails.ifscCode",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="IFSC Code (e.g., SBIN0001234)"
                  maxLength="11"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors["bankDetails.ifscCode"]
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                {errors["bankDetails.ifscCode"] && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors["bankDetails.ifscCode"]}
                  </p>
                )}

                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) =>
                    handleInputChange("bankDetails.bankName", e.target.value)
                  }
                  placeholder="Bank Name"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors["bankDetails.bankName"]
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                {errors["bankDetails.bankName"] && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors["bankDetails.bankName"]}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* UPI Details for UPI Payment */}
          {formData.paymentMethod === "upi" && (
            <div className="space-y-4 border-t border-gray-700/60 pt-4">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-amber-400" />
                UPI Details
              </h3>

              <input
                type="text"
                value={formData.upiDetails.upiId}
                onChange={(e) =>
                  handleInputChange(
                    "upiDetails.upiId",
                    e.target.value.toLowerCase()
                  )
                }
                placeholder="UPI ID (e.g., user@paytm)"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors["upiDetails.upiId"]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              />
              {errors["upiDetails.upiId"] && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors["upiDetails.upiId"]}
                </p>
              )}
            </div>
          )}

          {/* Reference */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-amber-400" />
              Reference
            </label>
            <textarea
              value={formData.reference}
              onChange={(e) => handleInputChange("reference", e.target.value)}
              placeholder="Enter deposit reference or notes"
              rows="3"
              maxLength="200"
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
            <p className="text-xs text-gray-400">
              {formData.reference.length}/200 characters
            </p>
          </div>

          {/* Stripe Card Form for Card Payments */}
          {formData.paymentMethod === "card" && (
            <div className="space-y-4 border-t border-gray-700/60 pt-4">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-amber-400" />
                Card Payment
              </h3>
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  amount={formData.amount}
                  reference={formData.reference}
                  transactionPin={formData.transactionPin}
                  onSuccess={handleCardPaymentSuccess}
                  onError={handleCardPaymentError}
                  disabled={!isFormValid}
                />
              </Elements>
            </div>
          )}

          {/* Transaction PIN */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-amber-400" />
              Transaction PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                value={formData.transactionPin}
                onChange={(e) =>
                  handleInputChange("transactionPin", e.target.value)
                }
                placeholder="Enter your transaction PIN"
                maxLength="6"
                className={`w-full px-4 py-3 pr-12 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.transactionPin
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer transition-colors"
              >
                {showPin ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.transactionPin && (
              <p className="text-sm text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.transactionPin}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Enter your 4-6 digit transaction PIN to confirm the deposit
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center text-amber-400 mb-2">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Important Information</span>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              {formData.paymentMethod === "card" ? (
                <>
                  <p>• Card payments are processed instantly</p>
                  <p>• Your card details are securely handled by Stripe</p>
                  <p>• You will receive immediate confirmation</p>
                  <p>• Transaction PIN is required for security</p>
                </>
              ) : (
                <>
                  <p>
                    • Deposits are usually processed within 1-2 business days
                  </p>
                  <p>• You will receive a confirmation email once processed</p>
                  <p>• Ensure all details are correct to avoid delays</p>
                  <p>• Transaction PIN is required for security</p>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons - Only show for non-card payments */}
          {formData.paymentMethod !== "card" && (
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
                Submit Request
              </button>
            </div>
          )}

          {/* Cancel button for card payments */}
          {formData.paymentMethod === "card" && (
            <div className="pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DepositFundsModal;
