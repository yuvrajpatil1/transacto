import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Shield,
  CreditCard,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  FileText,
  CheckCircle,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RegisterUser } from "../apicalls/users";
import { message } from "antd";
import { toast } from "react-toastify";
import bcrypt from "bcryptjs";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    identification: "",
    identificationNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
    transactionPin: "",
    confirmTransactionPin: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTransactionPin, setShowTransactionPin] = useState(false);
  const [showConfirmTransactionPin, setShowConfirmTransactionPin] =
    useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const identificationTypes = [
    "Passport",
    "Driver's License",
    "National ID",
    "Aadhaar Card",
    "PAN Card",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle PIN input - only allow digits and limit length
    if (name === "transactionPin" || name === "confirmTransactionPin") {
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.contactNo.trim()) {
      newErrors.contactNo = "Contact number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.contactNo)) {
      newErrors.contactNo = "Invalid contact number";
    }

    if (!formData.identification)
      newErrors.identification = "Please select identification type";
    if (!formData.identificationNumber.trim())
      newErrors.identificationNumber = "Identification number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.transactionPin) {
      newErrors.transactionPin = "Transaction PIN is required";
    } else if (formData.transactionPin.length < 4) {
      newErrors.transactionPin = "PIN must be at least 4 digits";
    } else if (formData.transactionPin.length > 6) {
      newErrors.transactionPin = "PIN must be at most 6 digits";
    }

    if (!formData.confirmTransactionPin) {
      newErrors.confirmTransactionPin = "Please confirm your transaction PIN";
    } else if (formData.transactionPin !== formData.confirmTransactionPin) {
      newErrors.confirmTransactionPin = "PINs do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Hash the transaction PIN before sending to backend
      const saltRounds = 12;
      const hashedTransactionPin = await bcrypt.hash(
        formData.transactionPin,
        saltRounds
      );

      const dataToSubmit = {
        ...formData,
        transactionPin: hashedTransactionPin,
        // Remove confirm fields as they're not needed in the backend
        confirmPassword: undefined,
        confirmTransactionPin: undefined,
      };

      console.log(dataToSubmit);

      const response = await RegisterUser(dataToSubmit);
      if (response.success) {
        toast.success(response.message || "Registration successful!.", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(() => {
          navigate("/user-not-verified");
        }, 1500);
      } else {
        toast.error(
          response.message || "Registration failed. Please try again.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        console.log(
          "Registration failed:",
          response.message || "Something went wrong!"
        );
      }
    } catch (error) {
      toast.error(
        error.message ||
          "Registration failed. Please check your information and try again.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      console.error("Registration error:", error);
    }

    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-dvh w-full bg-gradient-to-br from-black via-slate-900 to-black text-white overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-dvh">
        {/* Left Panel */}
        <div className="lg:w-2/5 bg-black p-8 md:p-16 flex flex-col relative overflow-hidden border-r border-gray-800">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <h1
                className="text-4xl md:text-5xl font-bold"
                onClick={() => navigate("/")}
              >
                Transacto
              </h1>
            </div>

            <h2 className="text-2xl md:text-4xl font-semibold mb-6 leading-tight bg-gradient-to-r from-gray-300 via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Join the Future of Digital Payments
            </h2>

            <p className="text-gray-400 md:mb-12 mb-6 md:text-lg text-sm">
              Create your secure wallet account and experience seamless, fast,
              and secure digital transactions.
            </p>

            <div className="space-y-6 hidden md:block">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mr-4 border border-blue-500/20">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-white">
                    Bank-Level Security
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Advanced encryption for all transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-teal-600/20 rounded-xl flex items-center justify-center mr-4 border border-green-500/20">
                  <Lock className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-white">
                    Multi-Factor Authentication
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Secure access protection layers
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-xl flex items-center justify-center mr-4 border border-purple-500/20">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-white">
                    Instant Transfers
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Lightning-fast money transfers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="lg:w-3/5 flex items-center justify-center px-12 py-16 bg-gray-900/30 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <div className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="md:text-3xl text-2xl font-bold text-white mb-2">
                    Create Account
                  </h3>
                  <p className="hidden md:block md:text-xl text-md text-gray-400">
                    Fill in your details to get started with Transacto
                  </p>

                  <div className="md:hidden text-left">
                    <p className="text-sm text-gray-400">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                        onClick={() => navigate("/login")}
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                      onClick={() => navigate("/login")}
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                      errors.firstName ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                      errors.lastName ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                    errors.email ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                    errors.contactNo ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter your contact number"
                />
                {errors.contactNo && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.contactNo}
                  </p>
                )}
              </div>

              {/* Identification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Identification Type
                  </label>
                  <select
                    name="identification"
                    value={formData.identification}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white backdrop-blur-sm ${
                      errors.identification
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  >
                    <option value="" className="bg-gray-800">
                      Select identification type
                    </option>
                    {identificationTypes.map((type) => (
                      <option key={type} value={type} className="bg-gray-800">
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.identification && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.identification}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                      errors.identificationNumber
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                    placeholder="Enter ID number"
                  />
                  {errors.identificationNumber && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.identificationNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm resize-none ${
                    errors.address ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter your full address"
                />
                {errors.address && (
                  <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                        errors.password ? "border-red-500" : "border-gray-600"
                      }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-600"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Transaction PIN Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <KeyRound className="w-4 h-4 inline mr-2" />
                    Transaction PIN (4-6 digits)
                  </label>
                  <div className="relative">
                    <input
                      type={showTransactionPin ? "text" : "password"}
                      name="transactionPin"
                      value={formData.transactionPin}
                      onChange={handleInputChange}
                      maxLength={6}
                      className={`w-full px-4 py-3 pr-12 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                        errors.transactionPin
                          ? "border-red-500"
                          : "border-gray-600"
                      }`}
                      placeholder="Enter your transaction PIN"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTransactionPin(!showTransactionPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showTransactionPin ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.transactionPin && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.transactionPin}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <KeyRound className="w-4 h-4 inline mr-2" />
                    Confirm Transaction PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmTransactionPin ? "text" : "password"}
                      name="confirmTransactionPin"
                      value={formData.confirmTransactionPin}
                      onChange={handleInputChange}
                      maxLength={6}
                      className={`w-full px-4 py-3 pr-12 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                        errors.confirmTransactionPin
                          ? "border-red-500"
                          : "border-gray-600"
                      }`}
                      placeholder="Confirm your transaction PIN"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmTransactionPin(!showConfirmTransactionPin)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmTransactionPin ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmTransactionPin && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmTransactionPin}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </button>

              {/* Terms */}
              <p className="text-center text-sm text-gray-400">
                By creating an account, you agree to our{" "}
                <button className="text-blue-400 ">Terms of Service</button> and{" "}
                <button className="text-blue-400 ">Privacy Policy</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
