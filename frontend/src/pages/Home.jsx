import React from "react";
import {
  CreditCard,
  Wallet,
  CheckCircle,
  Users,
  QrCode,
  Lock,
  Clock,
  Star,
  Phone,
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Send,
  UserCheck,
  HandCoins,
} from "lucide-react";
import Mockup from "../components/Mockup";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SlideInOnScroll from "../components/SlideInOnScroll";
import SlideInOnScrollMockUp from "../components/SlideInOnScrollMockUp";

export default function Home() {
  const navigate = useNavigate();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  // Progressive scroll-based transform
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]); // Slide up
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]); // Fade in

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed md:static top-0 left-0 w-full z-50 backdrop-blur-xl md:border-none md:backdrop-blur-none md:bg-transparent bg-gray-900/60 border-b border-gray-700/50 px-6 py-4 lg:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-bold text-white">Transacto</span>
        </div>

        <button
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <div className="px-6 lg:px-12 py-30 lg:py-20 lg:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-18">
            <div className="inline-flex items-center space-x-2 bg-gray-800/50 rounded-full px-4 py-2 mb-6 border border-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">
                Now Live - Money Request & Role-Based Access
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold pb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Your Digital Wallet
              <br />
              Reimagined
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Send money instantly with QR codes, make secure card payments, and
              manage money requests with role-based access control. All
              transactions tracked in real-time.
            </p>

            <div className="flex gap-4 sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-2 rounded-lg font-medium text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
                onClick={() => navigate("/register")}
              >
                <span>Sign Up</span>
              </button>
              <button
                className="border border-gray-600 px-8 py-2 rounded-lg font-medium text-lg hover:border-gray-500 hover:bg-gray-800/50 transition-all duration-300 flex items-center space-x-2"
                onClick={() => navigate("/register")}
              >
                <span>Log in</span>
              </button>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <SlideInOnScrollMockUp>
            <div className="hidden lg:block relative mx-auto max-w-4xl mb-24">
              <Mockup />
            </div>
          </SlideInOnScrollMockUp>
          <div className="lg:hidden relative mx-auto max-w-4xl mb-24">
            <Mockup />
          </div>

          {/* Trust Badges */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400 mt-4">
              Trusted by financial institutions worldwide
            </p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-lg font-semibold">Stripe</div>
              <div className="text-lg font-semibold">RBI Licensed</div>
              <div className="text-lg font-semibold">UPI Certified</div>
              <div className="text-lg font-semibold">PCI DSS</div>
              <div className="text-lg font-semibold">ISO 27001</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="px-6 lg:px-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm text-blue-400 font-medium mb-4">
              POWERFUL FEATURES
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything you need for{" "}
              <span className="text-blue-400">secure payments</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From instant QR payments to money requests, experience complete
              control over your digital transactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <SlideInOnScroll>
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">UPI QR Payments</h3>
                <p className="text-gray-400 mb-6">
                  Send and receive money instantly using QR codes. Compatible
                  with all major UPI apps and supports merchant payments
                  nationwide.
                </p>
                <div className="flex items-center space-x-2 text-sm text-blue-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Instant transfers</span>
                </div>
              </div>
            </SlideInOnScroll>
            <SlideInOnScroll>
              {/* Feature 2 */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Stripe Card Payments</h3>
                <p className="text-gray-400 mb-6">
                  Secure card payments powered by Stripe. Accept all major
                  credit and debit cards with enterprise-grade security and
                  fraud protection.
                </p>
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Bank-level security</span>
                </div>
              </div>
            </SlideInOnScroll>
            <SlideInOnScroll>
              {/* Feature 3 */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <HandCoins className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Money Requests</h3>
                <p className="text-gray-400 mb-6">
                  Request money from contacts and fulfill payment requests
                  seamlessly. Track all pending requests and manage approvals
                  efficiently.
                </p>
                <div className="flex items-center space-x-2 text-sm text-purple-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Request tracking</span>
                </div>
              </div>
            </SlideInOnScroll>
            <SlideInOnScroll>
              {/* Feature 4 */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Identity Verification
                </h3>
                <p className="text-gray-400 mb-6">
                  Complete account and identity verification for enhanced
                  security. Multi-layer verification ensures safe transactions
                  and compliance.
                </p>
                <div className="flex items-center space-x-2 text-sm text-orange-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>KYC compliant</span>
                </div>
              </div>
            </SlideInOnScroll>
            <SlideInOnScroll>
              {/* Feature 5 */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Role-Based Access</h3>
                <p className="text-gray-400 mb-6">
                  Manage user permissions with role-based access control.
                  Different access levels for admins, users, and merchants with
                  customizable permissions.
                </p>
                <div className="flex items-center space-x-2 text-sm text-cyan-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Flexible permissions</span>
                </div>
              </div>
            </SlideInOnScroll>
            <SlideInOnScroll>
              {/* Feature 6 */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Real-Time Tracking</h3>
                <p className="text-gray-400 mb-6">
                  Track all transactions, balance updates, and money requests in
                  real-time. Complete transaction history with detailed
                  analytics.
                </p>
                <div className="flex items-center space-x-2 text-sm text-yellow-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Live updates</span>
                </div>
              </div>
            </SlideInOnScroll>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 lg:px-12 py-16 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                5L+
              </div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-2">
                ₹50Cr+
              </div>
              <div className="text-gray-400">Transactions Processed</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-purple-400 mb-2">
                1Cr+
              </div>
              <div className="text-gray-400">Money Requests Fulfilled</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-orange-400 mb-2">
                99.9%
              </div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <SlideInOnScroll>
        <div className="px-6 lg:px-12 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-12 border border-blue-500/20">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Ready to revolutionize your payments?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join millions of users who trust Transacto for secure, instant
                digital payments with complete transaction control.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"></div>
              <div className="flex items-center justify-center mt-6 space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SlideInOnScroll>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-12 border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold">Transacto</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 pr-8">
                The future of digital payments. Secure, instant, and trackable
                financial transactions with role-based access control.
              </p>
              <div className="flex space-x-4">
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-12">
              {/* Product */}
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    API Documentation
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Mobile Apps
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Integrations
                  </a>
                </div>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Press Kit
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Investors
                  </a>
                </div>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    System Status
                  </a>
                  <a
                    href="#"
                    className="block hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>+91 1800-123-456</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>support@transacto.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400 mb-4 md:mb-0">
                <span>
                  © 2025 Transacto Technologies Pvt. Ltd. All rights reserved.
                </span>
                <div className="flex items-center space-x-4">
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <span>Developed with ❤️ by</span>
                  <a
                    className="underline text-white"
                    href="https://linkedin.com/in/yuvrajkpatil"
                  >
                    Yuvraj Patil.
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
