import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import MainElement from "../components/UI/MainElement";
import { Link } from "react-router-dom";
import AuthForm from "../components/loginAndSignup/AuthForm";
import { startLogInWithEmailAndPassword } from "../actions/auth";
import {
  selectAuthError,
  selectAuthLoading,
  resetErrorAndLoading,
} from "../slices/auth";

const LoginPage = ({
  resetErrorAndLoading,
  startLogInWithEmailAndPassword,
  authLoading,
  authError,
}) => {
  // to collect the state, if user came from some link, which in our application, user cannot come to login via a product page forexample that needs to be redirected back into that page after login
  const {
    state,
  } = useLocation();
  const navgiate = useNavigate();
  useEffect(() => {
    // to remove any errors we may have left from signup page.
    resetErrorAndLoading();
  }, [resetErrorAndLoading]);
  const onAuthFormSubmittion = async (loginData) => {
    try {
      const payload = await startLogInWithEmailAndPassword(loginData).unwrap();
      if(payload.flag === 'fulfilled') {
        if (!state) {
          navgiate("/dashboard", {
            replace: true,
          });
        } else {
        navgiate(state.from, {
          replace: true,
        });
      }
      }
    } catch (e) {

    }
  };

  return (
    <div className="app-login">
      <header className="app-login__header">
        <h1 className="app-login__title">
          <Link className="app-login__title-link" to="/">
            Budmoney
          </Link>
        </h1>
      </header>
      <MainElement>
        <AuthForm
          authLoading={authLoading}
          authError={authError}
          onAuthFormSubmittion={onAuthFormSubmittion}
        />
      </MainElement>
    </div>
  );
};

const mapStateToProps = (state, props) => {
  return {
    authLoading: selectAuthLoading(state),
    authError: selectAuthError(state),
  };
};
const mapDispatchToProps = (dispatch, props) => {
  return {
    startLogInWithEmailAndPassword: (loginData) =>
      dispatch(startLogInWithEmailAndPassword(loginData)),
    resetErrorAndLoading: () => dispatch(resetErrorAndLoading()),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
