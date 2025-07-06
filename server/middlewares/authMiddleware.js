const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    console.log("🔐 Received Auth Header:", req.headers.authorization);
    console.log("👤 User ID from token:", req.userId);

    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    return res
      .status(401)
      .send({ success: false, message: "Invalid or expired token" });
  }
};
