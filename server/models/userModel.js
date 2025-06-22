const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: false,
    },
    identification: {
      type: String,
      required: false,
    },
    identificationNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if googleId is not present
        return !this.googleId;
      },
    },
    balance: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // New fields for Google OAuth
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values but unique non-null values
    },
    profilePicture: {
      type: String,
      required: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to set authProvider based on googleId
UserSchema.pre("save", function (next) {
  if (this.googleId) {
    this.authProvider = "google";
    this.isVerified = true; // Auto-verify Google users
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
