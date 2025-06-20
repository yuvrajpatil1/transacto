import React from "react";
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function PublicRoute(props) {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, []);

  return <div>{props.children}</div>;
}

export default PublicRoute;
