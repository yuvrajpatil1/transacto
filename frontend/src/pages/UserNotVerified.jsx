import React, { useState, useEffect } from "react";
import {
  Shield,
  Clock,
  CheckCircle,
  FileText,
  Mail,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserNotVerified() {
  const [emailStatus, setEmailStatus] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (emailStatus?.type === "success") {
      setTimeLeft(60); // 60 seconds cooldown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [emailStatus]);

  const handleResendVerificationEmail = async () => {
    if (!userInfo || !userInfo.email) {
      setEmailStatus({
        type: "error",
        message: "Unable to resend email. User information not available.",
      });
      return;
    }

    if (timeLeft > 0) {
      setEmailStatus({
        type: "error",
        message: `Please wait ${timeLeft} seconds before resending.`,
      });
      return;
    }

    setIsResending(true);
    setEmailStatus(null);

    try {
      // Simulate API call
      const SendVerificationEmail = async (payload) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: Math.random() > 0.2, // 80% success rate for demo
              message:
                Math.random() > 0.2
                  ? "Email sent successfully!"
                  : "Failed to send email",
            });
          }, 2000);
        });
      };

      const response = await SendVerificationEmail({
        userId: userInfo._id || userInfo.id,
        userName: userInfo.firstName || userInfo.name || "User",
        userEmail: userInfo.email,
      });

      if (response.success) {
        setEmailStatus({
          type: "success",
          message:
            "Verification reminder email sent successfully! Check your inbox.",
        });
      } else {
        setEmailStatus({
          type: "error",
          message:
            response.message || "Failed to send email. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      setEmailStatus({
        type: "error",
        message:
          "Failed to send email. Please check your connection and try again.",
      });
    } finally {
      setIsResending(false);

      // Clear error messages after 5 seconds, but keep success messages
      if (emailStatus?.type !== "success") {
        setTimeout(() => {
          setEmailStatus(null);
        }, 5000);
      }
    }
  };

  const getEstimatedTime = () => {
    if (!userInfo?.registrationTime) return "2-24 hours";

    const hoursSinceRegistration =
      (Date.now() - userInfo.registrationTime) / (1000 * 60 * 60);
    const remainingHours = Math.max(0, 24 - hoursSinceRegistration);

    if (remainingHours < 1) return "Less than 1 hour";
    if (remainingHours < 2) return "About 1 hour";
    return `About ${Math.ceil(remainingHours)} hours`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-bl from-black via-gray-900 to-black text-white overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel */}
        <div className="lg:w-2/5 bg-black p-8 md:p-16 flex flex-col relative overflow-hidden border-r border-gray-800">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <h1
                className="text-4xl md:text-5xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => navigate("/")}
              >
                Transacto
              </h1>
            </div>

            <h2 className="text-2xl md:text-4xl font-semibold mb-6 leading-tight bg-gradient-to-r from-gray-300 via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Verification in Progress
            </h2>

            <p className="text-gray-400 md:mb-12 mb-6 md:text-lg text-sm">
              Your account is being verified by our security team. This process
              ensures the highest level of security for your digital wallet.
            </p>

            <div className="hidden md:block space-y-6">
              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mr-4 border border-blue-500/20 group-hover:border-blue-500/40 transition-all">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-white">
                    Security First
                  </h3>
                  <p className="text-gray-400 text-sm">
                    We verify every account to protect your assets
                  </p>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center mr-4 border border-orange-500/20 group-hover:border-orange-500/40 transition-all">
                  <FileText className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-white">
                    Document Verification
                  </h3>
                  <p className="text-gray-400 text-sm">
                    ID verification ensures compliance and security
                  </p>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-teal-600/20 rounded-xl flex items-center justify-center mr-4 border border-green-500/20 group-hover:border-green-500/40 transition-all">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold  mb-1 text-white">
                    Almost Ready
                  </h3>
                  <p className="text-gray-400 text-sm">
                    You'll be notified once verification is complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Verification Status */}
        <div className="lg:w-3/5 flex items-center justify-center px-8 py-16 bg-gray-900/30">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              {/* Animated verification icon */}
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 relative">
                <Clock className="w-12 h-12 text-blue-400 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-spin border-t-blue-500"></div>
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">
                Registration Successful!
              </h3>
              <p className="text-gray-400 mb-6">
                Your account has been created successfully
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-400 mr-2" />
                <h4 className="text-lg font-semibold text-white">
                  Verification Required
                </h4>
              </div>

              <p className="text-gray-300 text-left mb-4 leading-relaxed">
                You'll be able to log in once the wallet verifies your
                credentials and document IDs. Please wait till it completes.
              </p>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center text-blue-300 mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Processing Time</span>
                </div>
                <p className="text-sm text-left text-gray-400">
                  Estimated completion:{" "}
                  <span className="text-blue-300 font-medium">
                    1-2 business days
                  </span>
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center text-green-300 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    Email Notification
                  </span>
                </div>
                <p className="text-sm text-left text-gray-400">
                  We'll send you an email as soon as your account is verified
                  and ready to use.
                </p>
              </div>

              {/* Email Status Messages */}
              {emailStatus && (
                <div
                  className={`rounded-lg p-4 mb-4 transition-all duration-300 ${
                    emailStatus.type === "success"
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      emailStatus.type === "success"
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                  >
                    {emailStatus.type === "success" ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    <p className="text-sm">{emailStatus.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center group cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <span className=" transition-transform">
                  Try Logging in Again
                </span>
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-800/40 border border-gray-600 text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-800/60 hover:text-white transition-all duration-300 flex items-center justify-center backdrop-blur-sm group cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 p-4 lg:p-6 mt-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400 mb-4 md:mb-0">
            <span className="hidden md:block">
              © 2025 Transacto Technologies Pvt. Ltd. All rights reserved.
            </span>
            <span className="md:hidden text-center">
              © 2025 Transacto Technologies Pvt. Ltd. <br /> All rights
              reserved.
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span>Developed with ❤️ by</span>
              <a
                className="underline text-white"
                href="https://linkedin.com/in/yuvrajkpatil"
              >
                Yuvraj Patil.
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
