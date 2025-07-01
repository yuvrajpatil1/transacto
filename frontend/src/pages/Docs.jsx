import React, { useState, useEffect } from "react";
import {
  Shield,
  Database,
  Server,
  Globe,
  Zap,
  Lock,
  CreditCard,
  Mail,
  Smartphone,
  Users,
  Activity,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const SystemArchitecture = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodeDetails = {
    login: {
      title: "Login/Register System",
      content: `
        <strong>Routes:</strong><br>
        • POST /register - User registration<br>
        • POST /login - User authentication<br>
        • POST /send-password-reset-otp - Password reset<br>
        • POST /verify-password-reset-otp - OTP verification<br>
        <br><strong>Features:</strong><br>
        • Bcrypt password hashing<br>
        • JWT token generation<br>
        • OAuth Google integration<br>
        • Email verification required
      `,
    },
    dashboard: {
      title: "User Dashboard",
      content: `
        <strong>Routes:</strong><br>
        • POST /get-user-info - Fetch user data<br>
        • GET /get-all-users - Admin user list<br>
        <br><strong>Features:</strong><br>
        • Real-time balance display<br>
        • Transaction history<br>
        • Account verification status<br>
        • Cached user data (30 min)
      `,
    },
    transfer: {
      title: "Money Transfer",
      content: `
        <strong>Routes:</strong><br>
        • POST /transfer-funds - Execute transfer<br>
        • POST /verify-account - Account validation<br>
        • POST /verify-transaction-pin - PIN check<br>
        <br><strong>Features:</strong><br>
        • Instant wallet transfers<br>
        • Balance validation<br>
        • Transaction PIN security<br>
        • Real-time balance updates
      `,
    },
    request: {
      title: "Payment Requests",
      content: `
        <strong>Routes:</strong><br>
        • POST /send-request - Create payment request<br>
        • POST /update-request-status - Accept/Reject<br>
        • GET /get-pending-requests - View pending<br>
        <br><strong>Features:</strong><br>
        • Send money requests<br>
        • Accept/reject functionality<br>
        • Automatic balance transfers<br>
        • Request history tracking
      `,
    },
    deposit: {
      title: "Deposit System",
      content: `
        <strong>Routes:</strong><br>
        • POST /deposit-funds - Process deposits<br>
        <br><strong>Payment Methods:</strong><br>
        • Credit/Debit Cards (Stripe)<br>
        • UPI Payments<br>
        • Bank Transfers<br>
        • Instant card processing<br>
        • Pending bank/UPI verification
      `,
    },
    auth: {
      title: "Authentication Service",
      content: `
        <strong>Middleware:</strong><br>
        • JWT token validation<br>
        • User session management<br>
        • Route protection<br>
        <br><strong>Security Features:</strong><br>
        • Token expiry (24 hours)<br>
        • User ID extraction<br>
        • Protected route access<br>
        • Invalid token handling
      `,
    },
    "pin-verify": {
      title: "PIN Verification",
      content: `
        <strong>Routes:</strong><br>
        • POST /verify-transaction-pin - PIN check<br>
        • POST /update-transaction-pin - PIN update<br>
        <br><strong>Security:</strong><br>
        • Bcrypt PIN hashing<br>
        • Salt generation (12 rounds)<br>
        • OAuth user PIN setup<br>
        • Secure PIN comparison
      `,
    },
    otp: {
      title: "OTP Service",
      content: `
        <strong>OTP Features:</strong><br>
        • 6-digit random generation<br>
        • 10-15 minute expiry<br>
        • Rate limiting (5 attempts)<br>
        • In-memory storage<br>
        <br><strong>Use Cases:</strong><br>
        • Password reset<br>
        • PIN reset<br>
        • Account verification
      `,
    },
    redis: {
      title: "Cache Layer",
      content: `
        <strong>Cached Data:</strong><br>
        • User info (30 min)<br>
        • All users list (30 min)<br>
        • Transactions (15 min)<br>
        • QR codes (2 hours)<br>
        • Account verification (30 min)<br>
        <br><strong>Cache Keys:</strong><br>
        • user:{userId}<br>
        • transactions:{userId}<br>
        • qr:{userId}
      `,
    },
    stripe: {
      title: "Stripe Integration",
      content: `
        <strong>Payment Processing:</strong><br>
        • Card payment intents<br>
        • INR currency support<br>
        • Instant confirmations<br>
        • Metadata tracking<br>
        <br><strong>Features:</strong><br>
        • Secure payment processing<br>
        • Transaction references<br>
        • Payment status tracking<br>
        • Error handling
      `,
    },
    gmail: {
      title: "Email Service",
      content: `
        <strong>Email Types:</strong><br>
        • Account verification<br>
        • OTP delivery<br>
        • Password reset confirmation<br>
        • PIN update notifications<br>
        <br><strong>Templates:</strong><br>
        • Professional HTML designs<br>
        • Branded Transacto styling<br>
        • Security tips included<br>
        • Responsive layouts
      `,
    },
    users: {
      title: "Users Collection",
      content: `
        <strong>User Schema:</strong><br>
        • Personal information<br>
        • Email & password<br>
        • Wallet balance<br>
        • Transaction PIN<br>
        • Verification status<br>
        • OAuth provider info<br>
        <br><strong>Security:</strong><br>
        • Hashed passwords<br>
        • Encrypted PINs<br>
        • Email verification flags
      `,
    },
    transactions: {
      title: "Transactions Collection",
      content: `
        <strong>Transaction Types:</strong><br>
        • Wallet transfers<br>
        • Deposit transactions<br>
        • Request payments<br>
        <br><strong>Data Fields:</strong><br>
        • Sender/Receiver IDs<br>
        • Amount & currency<br>
        • Transaction status<br>
        • Payment method details<br>
        • Reference numbers<br>
        • Timestamps
      `,
    },
    requests: {
      title: "Payment Requests Collection",
      content: `
        <strong>Request Schema:</strong><br>
        • Sender/Receiver users<br>
        • Requested amount<br>
        • Reference/description<br>
        • Status (pending/accepted/rejected)<br>
        • Creation timestamp<br>
        <br><strong>Status Flow:</strong><br>
        • Created → Pending<br>
        • Pending → Accepted/Rejected<br>
        • Auto-transaction on accept
      `,
    },
  };

  const relationships = {
    login: ["auth", "users", "gmail", "oauth"],
    transfer: ["transaction-api", "pin-verify", "transactions", "users"],
    deposit: ["stripe", "transaction-api", "transactions", "pin-verify"],
    request: ["request-api", "users", "transactions"],
    dashboard: ["user-api", "redis", "users"],
    auth: ["users", "middleware"],
    otp: ["gmail", "otp-store"],
    "pin-verify": ["users", "redis"],
  };

  const isRelated = (sourceNode, targetNode) => {
    return relationships[sourceNode]?.includes(targetNode) || false;
  };

  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId);
  };

  useEffect(() => {
    // Initialize with login node selected
    setSelectedNode("login");
  }, []);

  const NodeComponent = ({ id, title, type, className = "" }) => {
    const isSelected = selectedNode === id;
    const isHovered = hoveredNode === id;
    const isRelatedToSelected = selectedNode && isRelated(selectedNode, id);

    return (
      <div
        className={`
          relative p-4 rounded-lg text-center text-white font-medium cursor-pointer
          transition-all duration-300 border border-gray-700/50
          ${className}
          ${
            isSelected
              ? "ring-2 ring-blue-500 transform -translate-y-1 shadow-2xl"
              : ""
          }
          ${isHovered ? "transform -translate-y-1 shadow-xl" : ""}
          ${isRelatedToSelected ? "ring-1 ring-purple-400 shadow-lg" : ""}
          hover:transform hover:-translate-y-1 hover:shadow-xl
        `}
        onClick={() => handleNodeClick(id)}
        onMouseEnter={() => setHoveredNode(id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <div className="text-sm font-medium">{title}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <nav className="fixed  max-w-dvw lg:static top-0 left-0 w-full z-50 backdrop-blur-xl lg:border-none lg:backdrop-blur-none lg:bg-transparent bg-gray-900/60 border-b border-gray-700/50 px-6 py-4 lg:px-12 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-white">Transacto</span>
          </div>

          <div className="flex flex-row">
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-md lg:text-lg rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Tech Stack */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">
              Tech Stack
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["React.js", "Node.js", "Express.js", "MongoDB"].map((tech) => (
                <div
                  key={tech}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-lg px-4 py-2 border border-gray-700/50"
                >
                  <span className="text-sm font-medium text-gray-300">
                    {tech}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
              <div className="w-3 h-3 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50 rounded"></div>
              <span className="text-sm text-gray-300">Frontend Layer</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
              <div className="w-3 h-3 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50 rounded"></div>
              <span className="text-sm text-gray-300">Backend Services</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
              <div className="w-3 h-3 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50 rounded"></div>
              <span className="text-sm text-gray-300">Database</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
              <div className="w-3 h-3 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50 rounded"></div>
              <span className="text-sm text-gray-300">External Services</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
              <div className="w-3 h-3 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50 rounded"></div>
              <span className="text-sm text-gray-300">Cache Layer</span>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Frontend Layer */}
          <div className="space-y-4">
            <div className="text-center font-semibold text-blue-400 uppercase tracking-wide text-sm p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              Frontend Layer
            </div>
            <div className="space-y-3">
              <NodeComponent
                id="login"
                title="Login/Register"
                type="frontend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="dashboard"
                title="Dashboard"
                type="frontend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="transfer"
                title="Money Transfer"
                type="frontend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="request"
                title="Payment Requests"
                type="frontend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="deposit"
                title="Deposit Funds"
                type="frontend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="qr"
                title="QR Code"
                type="frontend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="profile"
                title="Profile Settings"
                type="frontend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
            </div>
          </div>

          {/* Backend Services */}
          <div className="space-y-4">
            <div className="text-center font-semibold text-green-400 uppercase tracking-wide text-sm p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              Backend Services
            </div>
            <div className="space-y-3">
              <NodeComponent
                id="auth"
                title="Authentication"
                type="backend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="user-api"
                title="User Management"
                type="backend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="transaction-api"
                title="Transaction API"
                type="backend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="request-api"
                title="Request API"
                type="backend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="pin-verify"
                title="PIN Verification"
                type="backend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="otp"
                title="OTP Service"
                type="backend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="middleware"
                title="Middleware"
                type="backend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
            </div>
          </div>

          {/* Cache & Storage */}
          <div className="space-y-4">
            <div className="text-center font-semibold text-purple-400 uppercase tracking-wide text-sm p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              Cache & Storage
            </div>
            <div className="space-y-3">
              <NodeComponent
                id="redis"
                title="Cache Layer"
                type="cache"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="users"
                title="Users Collection"
                type="database"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="transactions"
                title="Transactions"
                type="database"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="requests"
                title="Requests"
                type="database"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="otp-store"
                title="OTP Store"
                type="backend"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
            </div>
          </div>

          {/* External Services */}
          <div className="space-y-4">
            <div className="text-center font-semibold text-orange-400 uppercase tracking-wide text-sm p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              External Services
            </div>
            <div className="space-y-3">
              <NodeComponent
                id="stripe"
                title="Stripe Payments"
                type="external"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="gmail"
                title="Gmail SMTP"
                type="external"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="oauth"
                title="Google OAuth"
                type="external"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
              <NodeComponent
                id="qr-service"
                title="QR Generator"
                type="external"
                className="bg-gray-800/50 rounded-lg px-3 py-3 border border-gray-700/50"
              />
            </div>
          </div>
        </div>

        {/* Details Panel */}
        {selectedNode && nodeDetails[selectedNode] && (
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 mb-12">
            <h3 className="text-2xl font-bold text-blue-400 mb-6">
              {nodeDetails[selectedNode].title}
            </h3>
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: nodeDetails[selectedNode].content,
              }}
            />
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Authentication & Security
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                JWT-based authentication
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Google OAuth integration
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Transaction PIN verification
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                OTP-based password/PIN reset
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Email verification system
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Rate limiting & brute force protection
              </li>
            </ul>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Payment Features
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Wallet-to-wallet transfers
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Payment request system
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Multi-method deposits (Card, UPI, Bank)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Stripe payment integration
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Transaction history tracking
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                QR code payments
              </li>
            </ul>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Performance & Caching
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Redis caching layer
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                User data caching (30 min)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Transaction caching (15 min)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                QR code caching (2 hours)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Cache invalidation strategies
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Optimized database queries
              </li>
            </ul>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-xl font-bold text-orange-400 mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Communication
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Email notifications
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Verification emails
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                OTP delivery system
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Transaction confirmations
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Password reset notifications
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                Professional email templates
              </li>
            </ul>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">
            Security Features Implemented
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Helmet.js",
                icon: Shield,
                features: [
                  "Comprehensive security headers",
                  "CSP (Content Security Policy) configured",
                  "Compatible with OAuth flow",
                  "Disabled COEP to prevent OAuth breaks",
                ],
              },
              {
                title: "Express Rate Limit",
                icon: Activity,
                features: [
                  "General: 100 requests per 15 min per IP",
                  "Auth routes: 10 requests per 15 min",
                  "Applied to /auth/*, /api/users/login",
                  "Applied to /api/users/register",
                ],
              },
              {
                title: "XSS Clean",
                icon: Lock,
                features: [
                  "Sanitizes user input",
                  "Prevents cross-site scripting attacks",
                  "Cleans HTML tags from requests",
                  "Removes malicious scripts",
                ],
              },
              {
                title: "Express Mongo Sanitize",
                icon: Database,
                features: [
                  "Prevents NoSQL injection attacks",
                  "Removes prohibited characters",
                  "Filters $ and . from user input",
                  "Protects MongoDB queries",
                ],
              },
              {
                title: "HPP (HTTP Parameter Pollution)",
                icon: Server,
                features: [
                  "Prevents parameter pollution attacks",
                  "Whitelisted query parameters",
                  "Allows: sort, fields, page, limit",
                  "Blocks malicious duplicate params",
                ],
              },
              {
                title: "Enhanced CORS",
                icon: Globe,
                features: [
                  "Maintained existing CORS config",
                  "Already properly configured",
                  "No changes needed",
                  "Secure cross-origin requests",
                ],
              },
            ].map((security, index) => (
              <div
                key={index}
                className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <security.icon className="w-6 h-6 text-yellow-400" />
                  <h4 className="text-lg font-semibold text-white">
                    {security.title}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {security.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-300 flex items-start gap-2"
                    >
                      <ArrowRight className="w-3 h-3 text-yellow-400 mt-1 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitecture;
