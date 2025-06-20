const express = require("express");
const cors = require("cors");
require("dotenv").config();
const QRCode = require("qrcode");

// Allow only your frontend origin

const app = express();
const allowedOrigins = ["https://transacto01.vercel.app/"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // If you're using cookies or sessions
  })
);

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const dbconfig = require("./config/dbconfig");
const usersRoute = require("./routes/usersRoute");
const transactionsRoute = require("./routes/transactionsRoute");
const requestRoute = require("./routes/requestRoute");

app.use("/api/users", usersRoute);
app.use("/api/transactions", transactionsRoute);
app.use("/api/requests", requestRoute);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
