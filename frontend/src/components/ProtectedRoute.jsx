import React from "react";
import { message } from "antd";
import { GetUserInfo } from "../apicalls/users";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ReloadUser, SetUser } from "../redux/usersSlice";
import { hideLoading, showLoading } from "../redux/loaderSlice";

function ProtectedRoute(props) {
  const dispatch = useDispatch();
  const { user } = useSelector((state, reloadUser) => state.users);
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await GetUserInfo();
      dispatch(hideLoading());
      if (response.success) {
        dispatch(SetUser(response.data));
      } else {
        message.error(response.message);
        navigate("/login");
      }
      dispatch(ReloadUser(false));
    } catch (error) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      if (!user) {
        getData();
      }
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (ReloadUser) {
      getData();
    }
  }, [ReloadUser]);
  return user && <div>{props.children}</div>;
}

export default ProtectedRoute;
