import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  CheckCircle,
  AlertCircle,
  Send,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Key,
  Shield,
} from "lucide-react";
import { showLoading, hideLoading } from "../../redux/loaderSlice";
import { toast } from "react-toastify";
import {
  SendPasswordResetOTP,
  VerifyPasswordResetOTP,
  ResetPassword,
  ResendPasswordResetOTP,
} from "../../apicalls/users";

function ForgotPasswordModal({
  showForgotPasswordModal,
  setShowForgotPasswordModal,
}) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Email verification, 2: OTP verification, 3: Set new password
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateEmail = () => {
    if (!formData.email.trim()) {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required",
      }));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }

    return true;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    try {
      dispatch(showLoading());

      const response = await SendPasswordResetOTP({ email: formData.email });

      dispatch(hideLoading());

      if (response.success) {
        setOtpSent(true);
        setCurrentStep(2);
        startResendTimer();
        setErrors((prev) => ({ ...prev, email: "" }));

        toast.success("Password reset OTP sent to your email!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "📧",
        });
      } else {
        if (response.code === "OAUTH_USER") {
          setErrors((prev) => ({
            ...prev,
            email: "Please use Google to sign in to your account",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            email: response.message || "Failed to send OTP",
          }));
        }
      }
    } catch (error) {
      dispatch(hideLoading());
      setErrors((prev) => ({
        ...prev,
        email: error.message || "Failed to send OTP",
      }));
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp.trim()) {
      setErrors((prev) => ({
        ...prev,
        otp: "OTP is required",
      }));
      return;
    }

    if (formData.otp.length !== 6) {
      setErrors((prev) => ({
        ...prev,
        otp: "OTP must be 6 digits",
      }));
      return;
    }

    try {
      dispatch(showLoading());

      const response = await VerifyPasswordResetOTP({
        email: formData.email,
        otp: formData.otp,
      });

      dispatch(hideLoading());

      if (response.success) {
        setCurrentStep(3);
        setErrors((prev) => ({ ...prev, otp: "" }));

        toast.success("OTP verified successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "✅",
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          otp: response.message || "Invalid OTP",
        }));
      }
    } catch (error) {
      dispatch(hideLoading());
      setErrors((prev) => ({
        ...prev,
        otp: error.message || "OTP verification failed",
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleResetPassword = async () => {
    const newErrors = validatePasswordForm();
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

      const response = await ResetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      dispatch(hideLoading());

      if (response.success) {
        toast.success(
          "Password reset successfully! You can now login with your new password.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            icon: "🔐",
          }
        );

        handleClose();
      } else {
        toast.error(
          response.message || "Failed to reset password. Please try again.",
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
      toast.error(
        error.message || "Failed to reset password. Please try again.",
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

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      dispatch(showLoading());

      const response = await ResendPasswordResetOTP({ email: formData.email });

      dispatch(hideLoading());

      if (response.success) {
        startResendTimer();
        toast.success("New OTP sent to your email!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "📧",
        });
      } else {
        toast.error(response.message || "Failed to resend OTP", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "❌",
        });
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error(error.message || "Failed to resend OTP", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "🚨",
      });
    }
  };

  const handleClose = () => {
    setShowForgotPasswordModal(false);
    setCurrentStep(1);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setOtpSent(false);
    setResendTimer(0);
  };

  if (!showForgotPasswordModal) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-amber-400" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your registered email"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
              <p className="text-xs text-gray-400">
                We'll send a verification code to this email address
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center text-amber-400 mb-2">
                <Shield className="w-5 h-5 mr-2" />
                <span className="font-medium">Security Information</span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• OTP will be sent to your registered email</p>
                <p>• OTP is valid for 15 minutes</p>
                <p>• Use a strong password with at least 6 characters</p>
                <p>• Don't share your password with anyone</p>
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
                type="button"
                onClick={handleSendOTP}
                className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send OTP
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* OTP Verification Success */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center text-green-400 mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">OTP Sent Successfully</span>
              </div>
              <div className="text-sm text-gray-300">
                <p>Verification code sent to: {formData.email}</p>
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Key className="w-4 h-4 mr-2 text-amber-400" />
                Enter OTP
              </label>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) =>
                  handleInputChange("otp", e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors text-center text-lg tracking-widest ${
                  errors.otp
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              />
              {errors.otp && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.otp}
                </p>
              )}

              {/* Resend OTP */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0}
                  className={`${
                    resendTimer > 0
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-amber-400 hover:text-amber-300"
                  } transition-colors`}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyOTP}
                className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify OTP
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center text-green-400 mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Email Verified Successfully</span>
              </div>
              <div className="text-sm text-gray-300">
                <p>Now set your new password</p>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-amber-400" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  placeholder="Enter new password (min 6 characters)"
                  className={`w-full px-4 py-3 pr-12 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.newPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-amber-400" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Re-enter your new password"
                  className={`w-full px-4 py-3 pr-12 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center text-amber-400 mb-2">
                <Shield className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Password Security Guidelines
                </span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• Use at least 6 characters for better security</p>
                <p>• Include a mix of letters, numbers, and symbols</p>
                <p>• Avoid using personal information or common words</p>
                <p>• Keep your password confidential and secure</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                Reset Password
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Email Verification";
      case 2:
        return "OTP Verification";
      case 3:
        return "Set New Password";
      default:
        return "Reset Password";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/60">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-amber-400" />
              Reset Password
            </h2>
            <p className="text-sm text-gray-300 pt-2">
              Step {currentStep} of 3: {getStepTitle()}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4 text-center items-center justify-center">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-amber-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      step < currentStep ? "bg-amber-600" : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">{renderStepContent()}</div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
