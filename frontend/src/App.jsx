import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import ManageExpenses from "./pages/ManageExpenses";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Logout from "./components/Logout";

// ✅ Define your Stripe public key
const stripePromise = loadStripe(
  "pk_test_51RardOGbXFaGwlspj1ykMlqt1zYKGrXSN33WZwiHJzAUQRbVP7Qe2cz9S6mx8rLx1QrjaYO2MKlaWsmjPLJqq6p000MJvSo6MK"
); // Replace with actual key

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Elements stripe={stripePromise}> */}
        <Route
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
        <Route path="/logout" element={<Logout />} />
        {/* </Elements> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
