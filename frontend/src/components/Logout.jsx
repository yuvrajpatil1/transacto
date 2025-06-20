// Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  }, [navigate]);

  return null; // Or a loading spinner, etc.
};

export default Logout;
