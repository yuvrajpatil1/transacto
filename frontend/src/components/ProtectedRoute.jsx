import React from "react";
import { message } from "antd";
import { GetUserInfo } from "../apicalls/users";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ReloadUser, SetUser } from "../redux/usersSlice";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import Loader from "./Loader";
import Transition from "../Transition";

function ProtectedRoute(props) {
  const dispatch = useDispatch();
  const { user, reloadUser } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await GetUserInfo();
      dispatch(hideLoading());
      if (response.success) {
        dispatch(SetUser(response.data));
      } else {
        message.error(response.message);
        localStorage.removeItem("token");
        navigate("/login");
      }
      dispatch(ReloadUser(false));
    } catch (error) {
      dispatch(hideLoading());
      message.error(error.message);
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Skip protection logic if we're on the root path
    if (location.pathname === "/") {
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (token) {
      if (!user) {
        getData();
      } else {
        setIsChecking(false);
      }
    } else {
      setIsChecking(false);
      navigate("/login");
    }
  }, [user, location.pathname]);

  useEffect(() => {
    // Skip if on root path
    if (location.pathname === "/" || !reloadUser) return;

    setIsChecking(true);
    getData();
  }, [reloadUser, location.pathname]);

  // If we're on root path, just render children without protection
  if (location.pathname === "/") {
    return <div>{props.children}</div>;
  }

  // Show loading while checking authentication for protected routes
  if (isChecking) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  // Only render children if user is authenticated
  return user ? <div> {props.children}</div> : null;
}

export default Transition(ProtectedRoute);
