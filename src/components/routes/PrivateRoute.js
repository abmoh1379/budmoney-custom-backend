import React from "react";
import { connect } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { selectAccessToken } from "../../slices/auth";

const PrivateRoute = ({ accessToken }) => {
  let content;
  if(!accessToken) {
    content = (
      <Navigate to= '/login' replace = {true} />
    );
  } else {
    content = <Outlet />
  }
  return content;
};

const mapStateToProps = (state) => {
  return {
    accessToken : selectAccessToken(state)
  };
};

export default connect(mapStateToProps)(PrivateRoute);
