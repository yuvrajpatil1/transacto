const express = require("express");
const cors = require("cors");
require("dotenv").config();
const QRCode = require("qrcode");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");
const { createClient } = require("redis");
const session = require("express-session");
const connectRedis = require("connect-redis");
const RedisStore = connectRedis(session); // ✅ Correct for v9 (no .default)

const app = express();

// Create Redis client (redis@4)
const redisClient = createClient({
  username: "default",
  password: "5Dbth8vILGzSbX2swSsoNJOEt18vScF7",
  socket: {
    host: "redis-12419.crce179.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 12419,
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("ready", () => console.log("Redis is ready"));

async function init() {
  await redisClient.connect();

  const store = new RedisStore({
    client: redisClient,
    prefix: "sess:",
  });

  // Middleware
  app.use(
    cors({
      origin: "https://transacto.onrender.com",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      store,
      secret: process.env.SESSION_SECRET || "your-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          "https://transacto-backend.onrender.com/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) return done(null, user);

          const newUser = new User({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            identificationNumber: `GOOGLE_${profile.id}`,
            isVerified: true,
            profilePicture: profile.photos[0]?.value,
            googleId: profile.id,
            authProvider: "google",
          });

          user = await newUser.save();
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const cachedUser = await redisClient.get(`user:${id}`);
      if (cachedUser) return done(null, JSON.parse(cachedUser));

      const user = await User.findById(id);
      if (user) {
        await redisClient.setEx(`user:${id}`, 3600, JSON.stringify(user));
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth Routes
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect:
        "https://transacto.onrender.com/login?error=oauth_failed",
    }),
    async (req, res) => {
      try {
        const token = jwt.sign(
          { userId: req.user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        res.redirect(
          `https://transacto.onrender.com/login?token=${token}&success=true`
        );
      } catch (error) {
        console.error("OAuth callback error:", error);
        res.redirect(
          "https://transacto.onrender.com/login?error=token_generation_failed"
        );
      }
    }
  );

  app.get("/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Session destruction failed" });
        }
        res.json({ success: true, message: "Logged out successfully" });
      });
    });
  });

  // Routes
  const dbconfig = require("./config/dbconfig");
  const usersRoute = require("./routes/usersRoute");
  const transactionsRoute = require("./routes/transactionsRoute");
  const requestRoute = require("./routes/requestRoute");

  app.use("/api/users", usersRoute);
  app.use("/api/transactions", transactionsRoute);
  app.use("/api/requests", requestRoute);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    try {
      await redisClient.quit();
      console.log("Redis connection closed");
    } catch (error) {
      console.error("Error closing Redis connection:", error);
    }
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully...");
    try {
      await redisClient.quit();
      console.log("Redis connection closed");
    } catch (error) {
      console.error("Error closing Redis connection:", error);
    }
    process.exit(0);
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

init();
