import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SetUser } from "../redux/usersSlice";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.removeItem("token");
    dispatch(SetUser(null));
    navigate("/", { replace: true });
  }, [navigate, dispatch]);

  return null;
};

export default Logout;
