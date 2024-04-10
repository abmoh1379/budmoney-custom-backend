import React, { useCallback, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { selectAccessToken } from "../slices/auth";
import useRefreshToken from "../hooks/useRefreshToken";
import Loader from "./UI/Loader";
import { startLogout } from "../actions/auth";


const PersistLogin = ({ accessToken, startLogout }) => {
  const cookies = new Cookies();
  const jwtRefreshToken = cookies.get("jwtRefreshToken");
  const refresh = useRefreshToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const trustThisDeviceValue = (!localStorage.getItem('budmoneyRememberMe')) ? false : true;


  const verifyAccessToken = useCallback(async () => {
    try {
      const refreshData = await refresh();
      if(refreshData.status === 'rejected') {
        setError(refreshData.errorMessage);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (accessToken && loading) {
      setLoading(false);
    } else if(!accessToken && loading){
      // 2 scenarios : 1 --> user refreshed the page. 2--> user is not logged in and is viewing the public pages.
      // scenario 1 :
      if (jwtRefreshToken && loading && trustThisDeviceValue) {
        verifyAccessToken();
      } else if(jwtRefreshToken && loading && !trustThisDeviceValue){
        startLogout().then(() => {
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
      }  else if (!jwtRefreshToken && loading) {
        //scenario 2
        setLoading(false);
      }
    }
  }, [verifyAccessToken]);

  let content;
  if(!!loading) {
    content = <div className="loader-container">
    <Loader />
  </div>
  } else if(!!error) {
    content = <div className="loader-container">
      <p>{error}</p>
    </div>
  } else {
    content = <Outlet />
  }
  return content;
};

const mapStateToProps = (state, props) => {
  return {
    accessToken: selectAccessToken(state),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    startLogout : () => dispatch(startLogout())
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PersistLogin);
