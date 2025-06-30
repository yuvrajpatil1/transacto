import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SetUser } from "../redux/usersSlice";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear token from localStorage
    localStorage.removeItem("token");

    // Clear user from Redux state
    dispatch(SetUser(null));

    // Navigate to login page
    navigate("/", { replace: true });
  }, [navigate, dispatch]);

  return null; // Or a loading spinner
};

export default Logout;
