import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transactions from "./pages/Transactions";
import Docs from "./pages/Docs";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import ManageExpenses from "./pages/ManageExpenses";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Logout from "./components/Logout";
import UserNotVerified from "./pages/UserNotVerified";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence } from "framer-motion";
import ForgotTransactionPinModal from "./pages/modals/ForgotTransactionPinModal";

// ✅ Define your Stripe public key
const stripePromise = loadStripe(
  "pk_test_51RardOGbXFaGwlspj1ykMlqt1zYKGrXSN33WZwiHJzAUQRbVP7Qe2cz9S6mx8rLx1QrjaYO2MKlaWsmjPLJqq6p000MJvSo6MK"
); // Replace with actual key

function App() {
  return (
    <>
      <AnimatePresence mode="wait">
        <BrowserRouter>
          <Routes>
            {/* <Elements stripe={stripePromise}> */}
            <Route
              index
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <Requests />
                </ProtectedRoute>
              }
            />
            <Route path="/docs" element={<Docs />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/user-not-verified" element={<UserNotVerified />} />
            {/* </Elements> */}
          </Routes>
        </BrowserRouter>
      </AnimatePresence>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#000",
          color: "#ffffff",
        }}
      />
    </>
  );
}

export default App;
