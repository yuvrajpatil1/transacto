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
        return !this.googleId;
      },
    },
    transactionPin: {
      type: String,
      required: function () {
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
    googleId: {
      type: String,
      sparse: true,
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

UserSchema.pre("save", function (next) {
  if (this.googleId) {
    this.authProvider = "google";
    this.isVerified = true;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
