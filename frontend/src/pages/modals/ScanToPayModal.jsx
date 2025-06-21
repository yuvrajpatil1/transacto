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
import { useDispatch, useSelector } from "react-redux";
import jsQR from "jsqr";
import { hideLoading, showLoading } from "../../redux/loaderSlice";
import { TransferFunds, VerifyAccount } from "../../apicalls/transactions";
import { ReloadUser } from "../../redux/usersSlice";

function ScanToPayModal({
  showScanToPayModal,
  setShowScanToPayModal,
  reloadData,
}) {
  const { user } = useSelector((state) => state.users);

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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Replace with your actual message system
  const message = {
    success: (msg) => console.log("Success:", msg),
    error: (msg) => console.log("Error:", msg),
  };

  const [verifiedAccount, setVerifiedAccount] = useState(null);
  const dispatch = useDispatch();

  // Modified QR code detection for URLs containing account numbers
  // Enhanced QR code detection with better error handling and debugging
  const detectQRCodeFromImage = (canvas) => {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Add multiple detection attempts with different configurations
    const detectionOptions = [
      { inversionAttempts: "dontInvert" },
      { inversionAttempts: "onlyInvert" },
      { inversionAttempts: "attemptBoth" },
    ];

    for (const options of detectionOptions) {
      const code = jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        options
      );

      if (code && code.data) {
        console.log("QR Code detected:", code.data);

        // More flexible URL pattern matching
        const patterns = [
          /http:\/\/localhost:5173\/user\/([a-zA-Z0-9]+)/,
          /https:\/\/localhost:5173\/user\/([a-zA-Z0-9]+)/,
          /http:\/\/[^\/]+\/user\/([a-zA-Z0-9]+)/,
          /https:\/\/[^\/]+\/user\/([a-zA-Z0-9]+)/,
          // Add pattern for production URLs
          /https:\/\/yourapp\.com\/user\/([a-zA-Z0-9]+)/,
          // Direct account number pattern (if QR contains just the account number)
          /^([a-zA-Z0-9]{8,})$/,
        ];

        for (const pattern of patterns) {
          const match = code.data.match(pattern);
          if (match && match[1]) {
            const accountNumber = match[1];
            console.log("Extracted account number:", accountNumber);
            return accountNumber;
          }
        }

        // If no pattern matches but we have data, log it for debugging
        console.log(
          "QR code data doesn't match any expected patterns:",
          code.data
        );
        return null;
      }
    }

    console.log("No QR code detected in image");
    return null;
  };

  // Cleanup camera stream on unmount
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Start continuous scanning once video is loaded
        videoRef.current.onloadedmetadata = () => {
          scanIntervalRef.current = setInterval(() => {
            if (!qrCodeData && !isProcessing) {
              captureAndScan();
            }
          }, 1000);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      message.error("Unable to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  // Enhanced camera capture with better image quality
  const captureAndScan = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      // Ensure video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas before drawing
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0);

      // Apply image enhancement for better QR detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Optional: Apply basic image enhancement
      enhanceImageForQRDetection(imageData);
      context.putImageData(imageData, 0, 0);

      const accountNumber = detectQRCodeFromImage(canvas);
      if (accountNumber) {
        handleQRCodeDetected(accountNumber);
      }
    }
  };

  // Basic image enhancement to improve QR code detection
  const enhanceImageForQRDetection = (imageData) => {
    const data = imageData.data;

    // Convert to grayscale and increase contrast
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );

      // Increase contrast
      const contrast = 1.5;
      const factor =
        (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
      const enhanced = Math.min(255, Math.max(0, factor * (gray - 128) + 128));

      data[i] = enhanced; // Red
      data[i + 1] = enhanced; // Green
      data[i + 2] = enhanced; // Blue
      // Alpha channel remains unchanged
    }
  };

  const handleQRCodeDetected = async (accountNumber) => {
    if (qrCodeData || isProcessing) return; // Prevent multiple scans

    try {
      stopCamera();
      setIsProcessing(true);

      console.log("Verifying account:", accountNumber);

      // Verify the account
      dispatch(showLoading());
      const response = await VerifyAccount({ receiver: accountNumber });
      dispatch(hideLoading());

      if (response.success) {
        setQrCodeData({
          accountNumber: response.data.accountNumber || accountNumber,
          name:
            response.data.name ||
            response.data.firstName + " " + response.data.lastName,
          bankName: response.data.bankName || "Default Bank",
        });
        setFormData((prev) => ({
          ...prev,
          receiver: accountNumber,
          receiverName:
            response.data.name ||
            response.data.firstName + " " + response.data.lastName,
        }));
        setIsVerified(true);
        setVerifiedAccount(response.data);
        message.success("QR Code scanned and account verified!");
      } else {
        message.error(response.message || "Account verification failed");
        // Restart camera if account verification fails
        setTimeout(() => {
          if (scanMethod === "camera") {
            startCamera();
          }
        }, 2000);
      }
    } catch (error) {
      dispatch(hideLoading());
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

  // Enhanced file upload handler with better image processing
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      message.error("Please upload a valid image file");
      return;
    }

    // Check file size (optional, e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error(
        "Image file is too large. Please upload an image smaller than 5MB"
      );
      return;
    }

    try {
      setIsProcessing(true);

      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = async () => {
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        console.log("Image loaded, dimensions:", img.width, "x", img.height);

        // Try to detect QR code
        const accountNumber = detectQRCodeFromImage(canvas);

        if (accountNumber) {
          await handleQRCodeDetected(accountNumber);
        } else {
          // More specific error messages
          message.error(
            "Could not find a valid QR code in this image. Please ensure:\n" +
              "• The QR code is clearly visible and not blurry\n" +
              "• The image has good lighting\n" +
              "• The QR code contains a valid account URL"
          );
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        message.error(
          "Failed to load the image. Please try a different image."
        );
        setIsProcessing(false);
      };

      // Create object URL for the image
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;

      // Clean up object URL after use
      img.onload = async (originalOnLoad) => {
        URL.revokeObjectURL(imageUrl);
        if (originalOnLoad) await originalOnLoad();
      };
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      message.error("Failed to process the uploaded image. Please try again.");
      setIsProcessing(false);
    }

    // Clear the file input
    event.target.value = "";
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

    if (!qrCodeData) {
      newErrors.receiver = "Please scan a QR code first";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsProcessing(true);
      dispatch(showLoading());

      const payload = {
        sender: user._id,
        receiver: formData.receiver,
        amount: parseFloat(formData.amount),
        reference: formData.reference,
        type: "debit",
        status: "success",
      };

      const response = await TransferFunds(payload);
      dispatch(hideLoading());

      if (response.success) {
        message.success(response.message);
        handleClose();
        if (reloadData) reloadData();
        window.location.reload();
        dispatch(ReloadUser(true));
      } else {
        message.error(response.message || "Transfer failed");
      }
    } catch (error) {
      dispatch(hideLoading());
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
    setVerifiedAccount(null);
  };

  if (!showScanToPayModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="no-scrollbar bg-gray-800/95 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                onClick={() => {
                  setQrCodeData(null);
                  setFormData({
                    receiver: "",
                    amount: "",
                    reference: "",
                    receiverName: "",
                  });
                  setIsVerified(false);
                  setVerifiedAccount(null);
                }}
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
              type="button"
              onClick={handleSubmit}
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
