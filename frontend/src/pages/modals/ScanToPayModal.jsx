import React, { useState, useRef, useEffect } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Send,
  IndianRupee,
  FileText,
  QrCode,
  Camera,
  Upload,
} from "lucide-react";

// Mock jsQR for demonstration
const mockJsQR = (imageData, width, height) => {
  // Simulate QR code detection - in real app, use actual jsQR
  const mockQRData = "https://transacto.onrender.com/user/ACC123456789";
  return Math.random() > 0.7 ? { data: mockQRData } : null;
};

// Mock API functions for demonstration
const mockVerifyAccount = async ({ receiver }) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    data: {
      accountNumber: receiver,
      firstName: "John",
      lastName: "Doe",
      name: "John Doe",
      bankName: "Demo Bank",
    },
  };
};

const mockTransferFunds = async (payload) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    message: "Transfer completed successfully!",
  };
};

function ScanToPayModal({
  showScanToPayModal = true,
  setShowScanToPayModal = () => {},
  reloadData = () => {},
}) {
  // Mock user data
  const user = { _id: "user123", balance: 50000 };

  const [isScanning, setIsScanning] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [formData, setFormData] = useState({
    receiver: "",
    amount: "",
    reference: "",
    receiverName: "",
  });
  const [errors, setErrors] = useState({});
  const [scanMethod, setScanMethod] = useState("camera");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [messages, setMessages] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Message system
  const message = {
    success: (msg) => {
      setMessages((prev) => [
        ...prev,
        { type: "success", text: msg, id: Date.now() },
      ]);
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.text !== msg));
      }, 3000);
    },
    error: (msg) => {
      setMessages((prev) => [
        ...prev,
        { type: "error", text: msg, id: Date.now() },
      ]);
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.text !== msg));
      }, 3000);
    },
  };

  // QR code detection function
  const detectQRCodeFromImage = (canvas) => {
    try {
      const context = canvas.getContext("2d");
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = mockJsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        console.log("QR Code detected:", code.data);

        // Check if the QR code contains the expected URL pattern
        const urlPattern =
          /https:\/\/transacto\.onrender\.com\/user\/([a-zA-Z0-9]+)/;
        const match = code.data.match(urlPattern);

        if (match && match[1]) {
          const accountNumber = match[1];
          console.log("Extracted account number:", accountNumber);
          return accountNumber;
        } else {
          console.log("QR code doesn't match expected URL pattern");
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error("Error detecting QR code:", error);
      return null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Wait for video to load before starting scanning
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => {
              // Start scanning interval
              scanIntervalRef.current = setInterval(() => {
                if (
                  !qrCodeData &&
                  !isProcessing &&
                  videoRef.current &&
                  videoRef.current.readyState === 4
                ) {
                  captureAndScan();
                }
              }, 1000);
            })
            .catch((err) => {
              console.error("Error playing video:", err);
              message.error("Failed to start video playback");
              setIsScanning(false);
            });
        };

        videoRef.current.onerror = (err) => {
          console.error("Video error:", err);
          message.error("Camera error occurred");
          setIsScanning(false);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      message.error(
        "Unable to access camera. Please check permissions and try again."
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsScanning(false);
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  };

  const captureAndScan = () => {
    try {
      if (
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState === 4
      ) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext("2d");

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        if (canvas.width > 0 && canvas.height > 0) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const accountNumber = detectQRCodeFromImage(canvas);

          if (accountNumber) {
            handleQRCodeDetected(accountNumber);
          }
        }
      }
    } catch (error) {
      console.error("Error capturing and scanning:", error);
    }
  };

  const handleQRCodeDetected = async (accountNumber) => {
    if (qrCodeData || isProcessing) return;

    try {
      stopCamera();
      setIsProcessing(true);

      console.log("Verifying account:", accountNumber);

      const response = await mockVerifyAccount({ receiver: accountNumber });

      if (response.success) {
        const accountData = {
          accountNumber: response.data.accountNumber || accountNumber,
          name:
            response.data.name ||
            `${response.data.firstName} ${response.data.lastName}`,
          bankName: response.data.bankName || "Default Bank",
        };

        setQrCodeData(accountData);
        setFormData((prev) => ({
          ...prev,
          receiver: accountNumber,
          receiverName: accountData.name,
        }));
        setIsVerified(true);
        message.success("QR Code scanned and account verified!");
      } else {
        message.error(response.message || "Account verification failed");
        // Restart camera after delay
        setTimeout(() => {
          if (scanMethod === "camera") {
            startCamera();
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      message.error("Failed to verify account");
      // Restart camera on error
      setTimeout(() => {
        if (scanMethod === "camera") {
          startCamera();
        }
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      message.error("Please select a valid image file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      message.error("File size should be less than 10MB");
      return;
    }

    try {
      setIsProcessing(true);

      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const loadImage = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      await loadImage;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const accountNumber = detectQRCodeFromImage(canvas);

      if (accountNumber) {
        await handleQRCodeDetected(accountNumber);
      } else {
        message.error("No valid QR code found in the image");
        setIsProcessing(false);
      }

      // Clean up
      URL.revokeObjectURL(img.src);
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      message.error("Failed to process the uploaded image");
      setIsProcessing(false);
    }

    // Clear the file input
    event.target.value = "";
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
        newErrors.amount = "Please enter a valid amount";
      } else if (amount > user.balance) {
        newErrors.amount = "Insufficient balance";
      }
    }

    if (!formData.reference.trim()) {
      newErrors.reference = "Reference is required";
    }

    if (!qrCodeData) {
      newErrors.receiver = "Please scan a QR code first";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsProcessing(true);

      const payload = {
        sender: user._id,
        receiver: formData.receiver,
        amount: parseFloat(formData.amount),
        reference: formData.reference,
        type: "debit",
        status: "success",
      };

      const response = await mockTransferFunds(payload);

      if (response.success) {
        message.success(response.message);
        setTimeout(() => {
          handleClose();
          if (reloadData) reloadData();
        }, 1500);
      } else {
        message.error(response.message || "Transfer failed");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      message.error("Transfer failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setShowScanToPayModal(false);
    setIsScanning(false);
    setQrCodeData(null);
    setFormData({
      receiver: "",
      amount: "",
      reference: "",
      receiverName: "",
    });
    setErrors({});
    setScanMethod("camera");
    setIsProcessing(false);
    setIsVerified(false);
    setMessages([]);
  };

  const resetScan = () => {
    setQrCodeData(null);
    setFormData({
      receiver: "",
      amount: "",
      reference: "",
      receiverName: "",
    });
    setIsVerified(false);
    setErrors({});
  };

  if (!showScanToPayModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Messages */}
      <div className="fixed top-4 right-4 z-60 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              msg.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="no-scrollbar bg-gray-800/95 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/60">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center">
              <QrCode className="w-5 h-5 mr-2 text-amber-400" />
              Scan to Pay
            </h2>
            <p className="text-sm text-gray-300 pt-2">
              Current Balance: ₹{user.balance?.toLocaleString("en-IN")}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-2xl">
            <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
              <span className="text-white">Processing...</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* QR Code Scanner Section */}
          {!qrCodeData && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <QrCode className="w-4 h-4 mr-2 text-amber-400" />
                Scan QR Code
              </label>
              <p className="text-xs text-gray-400">
                Scan QR codes with URL format:
                https://transacto.onrender.com/user/[accountNumber]
              </p>

              {/* Scan Method Toggle */}
              <div className="flex bg-gray-700/50 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setScanMethod("camera");
                    if (isScanning) {
                      stopCamera();
                    }
                  }}
                  disabled={isProcessing}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                    scanMethod === "camera"
                      ? "bg-amber-600 text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanMethod("upload");
                    if (isScanning) {
                      stopCamera();
                    }
                  }}
                  disabled={isProcessing}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                    scanMethod === "upload"
                      ? "bg-amber-600 text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </button>
              </div>

              {/* Camera Scanner */}
              {scanMethod === "camera" && (
                <div className="space-y-3">
                  {!isScanning ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={isProcessing}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 border-2 border-amber-400 border-dashed rounded-lg pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 border-2 border-amber-400 rounded-lg bg-amber-400/10"></div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                          <p className="text-white text-sm bg-black/70 px-3 py-1 rounded-full">
                            {isProcessing
                              ? "Processing QR code..."
                              : "Position QR code within the frame"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={stopCamera}
                        disabled={isProcessing}
                        className="w-full py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Stop Camera
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* File Upload */}
              {scanMethod === "upload" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full py-8 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:border-amber-400 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-col items-center justify-center"
                  >
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="font-medium">
                      Click to upload QR code image
                    </span>
                    <span className="text-sm text-gray-400 mt-1">
                      PNG, JPG, JPEG up to 10MB
                    </span>
                  </button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Scanned QR Code Info */}
          {qrCodeData && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center text-green-400 mb-3">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">QR Code Scanned & Verified</span>
              </div>
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="font-medium">{qrCodeData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account:</span>
                  <span className="font-mono text-sm">
                    {qrCodeData.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bank:</span>
                  <span>{qrCodeData.bankName}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={resetScan}
                disabled={isProcessing}
                className="mt-3 text-sm text-amber-400 hover:text-amber-300 disabled:opacity-50 underline"
              >
                Scan different QR code
              </button>
            </div>
          )}

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
              disabled={isProcessing}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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

          {/* Reference */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-amber-400" />
              Reference
            </label>
            <textarea
              value={formData.reference}
              onChange={(e) => handleInputChange("reference", e.target.value)}
              placeholder="Enter transfer reference or description"
              rows="3"
              disabled={isProcessing}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
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
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!qrCodeData || isProcessing}
              className={`flex-1 px-6 py-3 font-medium rounded-lg transition-colors flex items-center justify-center ${
                qrCodeData && !isProcessing
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanToPayModal;
