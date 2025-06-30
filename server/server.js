const express = require("express");
const cors = require("cors");
require("dotenv").config();
const QRCode = require("qrcode");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/userModel"); // Import your User model
const jwt = require("jsonwebtoken");
const redis = require("redis");

const app = express();

// Create Redis client for caching only (not sessions)
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectDelay: 50,
    lazyConnect: true,
  },
});

// Handle Redis connection events
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

// Middlewares
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

// SOLUTION 1: Use MemoryStore temporarily (for development/testing)
// NOTE: This won't persist sessions across server restarts
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// SOLUTION 2: Alternative - Custom Redis session handling
// Uncomment this if you want custom Redis session management
/*
const customSessionStore = {
  get: async (sid, callback) => {
    try {
      const session = await redisClient.get(`sess:${sid}`);
      callback(null, session ? JSON.parse(session) : null);
    } catch (error) {
      callback(error);
    }
  },
  set: async (sid, session, callback) => {
    try {
      await redisClient.setEx(`sess:${sid}`, 86400, JSON.stringify(session)); // 24 hours
      callback(null);
    } catch (error) {
      callback(error);
    }
  },
  destroy: async (sid, callback) => {
    try {
      await redisClient.del(`sess:${sid}`);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
};

app.use(
  session({
    store: customSessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
*/

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
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

        if (user) {
          return done(null, user);
        } else {
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
        }
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
    // Try to get user from cache first
    const cachedUser = await redisClient.get(`user:${id}`);
    if (cachedUser) {
      return done(null, JSON.parse(cachedUser));
    }

    const user = await User.findById(id);
    if (user) {
      // Cache user for 1 hour
      await redisClient.setEx(`user:${id}`, 3600, JSON.stringify(user));
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://transacto.onrender.com/login?error=oauth_failed",
  }),
  async (req, res) => {
    try {
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

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
      return res.status(500).json({ success: false, message: "Logout failed" });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
