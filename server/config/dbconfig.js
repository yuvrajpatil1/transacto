const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL);
const connectionResult = mongoose.connection;

connectionResult.on("error", () => {
  console.log("connection error");
});
connectionResult.on("connected", () => {
  console.log("connection successful");
});

module.exports = connectionResult;
