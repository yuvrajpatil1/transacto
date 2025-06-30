const express = require("express");
const cors = require("cors");
require("dotenv").config();
const QRCode = require("qrcode");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");

// Redis (required before route handlers using cache)
const redis = require("./config/redis");

// Connect Redis explicitly since lazyConnect: true
redis.connect().catch((err) => {
  console.error("Redis connection failed on startup:", err);
});

const app = express();

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
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
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
    const user = await User.findById(id);
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

// Logout route
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

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
