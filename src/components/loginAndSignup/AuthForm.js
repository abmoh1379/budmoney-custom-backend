import React, {
  useCallback,
  useState,
  useReducer,
  useRef,
  useEffect,
} from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useLocation } from "react-router-dom";
import useInput from "../../hooks/useInput";
import PrimaryBtn from "../app/UI/PrimaryBtn";
import Loader from "../UI/Loader";

const recaptchaReducer = (state, action) => {
  switch (action.type) {
    case "ON_RECAPTCHA_SUCCESS": {
      return {
        recaptchaIsValid: true,
        recaptchaErrorMsg: "",
      };
    }
    case "ON_RECAPTCHA_ERROR": {
      return {
        ...state,
        recaptchaErrorMsg: action.payload,
      };
    }
    case "ON_RECAPTCHA_RESET": {
      return {
        ...state,
        recaptchaIsValid: false,
      };
    }
    default:
      return state;
  }
};

const recaptchaInitialState = {
  recaptchaIsValid: false,
  recaptchaErrorMsg: "",
};

// successfullOperation is for showing a message for succesfull signed up operation.
const AuthForm = ({
  authLoading,
  authError,
  onAuthFormSubmittion,
  successfullOperation = undefined,
}) => {
  // state related to handle remember me checkbox
  const rememberMeInitialValue = !localStorage.getItem("budmoneyRememberMe")
    ? false
    : JSON.parse(localStorage.getItem("budmoneyRememberMe"));
  const [rememberMe, setRememberMe] = useState(rememberMeInitialValue);
  // this state is for validating and shwoing potential error on network issue the Recaptcha
  const [{ recaptchaIsValid, recaptchaErrorMsg }, recaptchaDispatcher] =
    useReducer(recaptchaReducer, recaptchaInitialState);
  // this ref is used for reseting recaptcha validation after form got an error.
  const recaptchaRef = useRef();
  // this state is used for hidden input to validate if the form is being filled with bots.
  const [hiddenInputValue, setHiddenInputValue] = useState("");
  // we rename the state to make things more clear, we adding this feature so that the user who accidently wrote in signup form but now wants to login, will still have inputs filled when visiting login page and vice-versa
  const { pathname, state: linkState } = useLocation();
  const currentPage = pathname === "/sign-up" ? "sign-up" : "login";

  // hidden input for escaping bots onChange
  const onHiddenInputChange = (e) => {
    setHiddenInputValue(e.target.value);
  };
  // Email useInput hook setup
  const emailInputValidator = useCallback((value) => {
    if (value.length === 0) {
      return "Email is required!";
    } else if (
      value.length &&
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value)
    ) {
      return "Incorrect email format!";
    }
    return "";
  }, []);
  const {
    inputValue: emailValue,
    onInputChange: onEmailChange,
    onInputBlur: onEmailBlur,
    error: emailError,
    isInputValid: isEmailValid,
    inputDispatcher: emailDispatcher,
  } = useInput(
    !!linkState ? linkState.email && linkState.email : "",
    emailInputValidator
  );

  // Password useInput hook setup
  const passwordInputValidator = useCallback(
    (value) => {
      if (value.length === 0) {
        return "Password is required!";
      } else if (currentPage === "sign-up") {
        if (
          value.length &&
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$$/.test(
            value
          )
        ) {
          return "Password must be atleast 8 and maximum 15 characters long. It must also include atleast 1 lowercase and uppercase letters, 1 number and 1 special character. Spcecial characters allowed are @$!%*?&";
        }
      }
      return "";
    },
    [currentPage]
  );
  const {
    inputValue: passwordValue,
    onInputChange: onPasswordChange,
    onInputBlur: onPasswordBlur,
    error: passwordError,
    isInputValid: isPasswordValid,
    inputDispatcher: passwordDispatcher,
  } = useInput(
    !!linkState ? linkState.password && linkState.password : "",
    passwordInputValidator
  );

  // Password useInput hook setup
  const confirmPasswordInputValidator = useCallback(
    (value) => {
      if (!value.length) {
        return "Confirm password is required!";
      } else if (value !== passwordValue) {
        return "Passwords do not match!";
      }
      return "";
    },
    [passwordValue]
  );
  const handleOnRememberMeChange = () => {
    setRememberMe((prevState) => {
      // add or remove the budmoneyRememberMe value from localstorage as well.
      if (prevState) {
        localStorage.removeItem("budmoneyRememberMe");
      } else {
        localStorage.setItem("budmoneyRememberMe", JSON.stringify(!prevState));
      }
      return !prevState;
    });
  };
  const {
    inputValue: confirmPasswordValue,
    onInputChange: onConfirmPasswordChange,
    onInputBlur: onConfirmPasswordBlur,
    error: confirmPasswordError,
    isInputValid: isConfirmPasswordValid,
    inputDispatcher: confirmPasswordDispatcher,
  } = useInput("", confirmPasswordInputValidator);

  // recaptcha validation handling
  const onRecaptchaChange = () => {
    recaptchaDispatcher({ type: "ON_RECAPTCHA_SUCCESS" });
  };

  const onRecaptchaError = () => {
    recaptchaDispatcher({
      type: "ON_RECAPTCHA_ERROR",
      payload:
        "Recaptcha validator failed to load. Please check your network connection.",
    });
  };

  // this useEffect handles the idea of making the user revalidate on every submit failure.
  useEffect(() => {
    if (!!authError) {
      recaptchaDispatcher({ type: "ON_RECAPTCHA_RESET" });
      recaptchaRef.current.reset();
    }
  }, [authError, recaptchaRef]);

  //   checking if form is valid for enabling the btn and let submit happen
  let isFormValid = false;
  if (currentPage === "sign-up") {
    if (
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid &&
      !hiddenInputValue &&
      recaptchaIsValid
    ) {
      isFormValid = true;
    }
  } else if (currentPage === "login") {
    if (
      isEmailValid &&
      isPasswordValid &&
      !hiddenInputValue &&
      recaptchaIsValid
    ) {
      isFormValid = true;
    }
  }

  const onFormSubmit = (e) => {
    e.preventDefault();

    if (!recaptchaIsValid) {
      recaptchaDispatcher({
        type: "ON_RECAPTCHA_ERROR",
        payload: "Recaptcha validation is required!",
      });
    }
    emailDispatcher({ type: "INPUT_TOUCHED_TRUE" });
    if (currentPage === "sign-up") {
      confirmPasswordDispatcher({ type: "INPUT_TOUCHED_TRUE" });
      passwordDispatcher({ type: "INPUT_TOUCHED_TRUE" });
    } else if (currentPage === "login") {
      passwordDispatcher({ type: "INPUT_TOUCHED_TRUE" });
    }

    if (isFormValid) {
      onAuthFormSubmittion({
        email: emailValue.trim(),
        password: passwordValue.trim(),
      });
    }
  };

  let successOperationContent = "";
  if (!!successfullOperation) {
    if (successfullOperation === "sign-up") {
      successOperationContent = (
        <p className="form-container__success-message">
          Your account has been succesfully created.{' '}
          <Link className="form-container__success-link" to="/login">Login</Link>
        </p>
      );
    }
  }
  const containerTitle =
    currentPage === "sign-up" ? "Create an account" : "Sign in to your account";

  let formSubmitBtnText;
  if (currentPage === "sign-up") {
    if (authLoading) {
      formSubmitBtnText = (
        <Loader spinerColor="#fff" spinnerWidth="27" spinnerHeight="27" />
      );
    } else {
      formSubmitBtnText = "Sign up";
    }
  } else if (currentPage === "login") {
    if (authLoading) {
      formSubmitBtnText = (
        <Loader spinerColor="#fff" spinnerWidth="27" spinnerHeight="27" />
      );
    } else {
      formSubmitBtnText = "Login";
    }
  }

  // we need to disable the button while loading to avoid too many attempts and bugging the process.
  let disableFormBtn = false;
  if (authLoading) {
    disableFormBtn = true;
  }

  // we only use formParagraph for signup and login page.
  const formParagraph =
    currentPage === "sign-up"
      ? "Already have an account? "
      : `Doesn't have an account? `;

  // we only use formParagraphLink for signup and login page.
  const formParagraphLink =
    currentPage === "sign-up" ? "Login here!" : "Sign up here!";
  // we only use formParagraphLinkTo for signup and login page.
  const formParagraphLinkTo = currentPage === "sign-up" ? "/login" : "/sign-up";
  // we only use linStateData for signup and login page.
  const linkStateData = {
    email: !!emailValue ? emailValue : "",
    password: !!passwordValue ? passwordValue : "",
  };

  return (
    <article className="form-container">
      <h2 className="form-container__title">{containerTitle}</h2>
      {successOperationContent}
      {authError && (
        <p className="form-container__error-message">{authError}</p>
      )}
      <form className="form-container__form" onSubmit={onFormSubmit}>
        {/* this hidden input, could never be filled with a real user, so we use it as a way validating form being filled with bots.*/}
        <input
          className="form-container__hidden-input"
          type="text"
          value={hiddenInputValue}
          onChange={onHiddenInputChange}
        />
        <section className="form-container__input-container">
          {/* we need this input-label-container for the effect of label we need.*/}
          <div className="form-container__input-label-container">
            <input
              className={`form-container__input${
                emailError ? " form-container__input--invalid" : ""
              }`}
              type="text"
              placeholder=""
              id="email"
              autoComplete="on"
              value={emailValue}
              onChange={onEmailChange}
              onBlur={onEmailBlur}
            />
            <label className="form-container__input-label" htmlFor="email">
              Email
            </label>
          </div>
          <p className="form-container__input-error">{emailError}</p>
        </section>
        <section className="form-container__input-container">
          {/* we need this input-label-container for the effect of label we need.*/}
          <div className="form-container__input-label-container">
            <input
              className={`form-container__input${
                passwordError ? " form-container__input--invalid" : ""
              }`}
              type="password"
              placeholder=""
              id="password"
              autoComplete="off"
              value={passwordValue}
              onChange={onPasswordChange}
              onBlur={onPasswordBlur}
            />
            <label className="form-container__input-label" htmlFor="password">
              Password
            </label>
          </div>
          <p className="form-container__input-error">{passwordError}</p>
        </section>
        {/* we only add remember me checkbox in login page.*/}
        {currentPage === "login" && (
          <section className="form-container__remember-container">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe ? true : false}
              onChange={handleOnRememberMeChange}
            />
            <label
              htmlFor="rememberMe"
              className="form-container__remember-label"
            >
              Remember me
            </label>
          </section>
        )}
        {/* we are allowed to conditionally render this due to login absolutely should not have the confirm password input*/}
        {currentPage === "sign-up" && (
          <section className="form-container__input-container">
            {/* we need this input-label-container for the effect of label we need.*/}
            <div className="form-container__input-label-container">
              <input
                className={`form-container__input${
                  confirmPasswordError ? " form-container__input--invalid" : ""
                }`}
                type="password"
                placeholder=""
                id="confirmPassword"
                autoComplete="off"
                value={confirmPasswordValue}
                onChange={onConfirmPasswordChange}
                onBlur={onConfirmPasswordBlur}
              />
              <label
                className="form-container__input-label"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>
            </div>
            <p className="form-container__input-error">
              {confirmPasswordError}
            </p>
          </section>
        )}
        <section className="form-container__recaptcha-container">
          <ReCAPTCHA
            sitekey="6LcYOpspAAAAAMzEKiBLy0O3VhTpM-dLq0zt-5UY"
            onChange={onRecaptchaChange}
            onErrored={onRecaptchaError}
            ref={recaptchaRef}
            onExpired={() => {
              recaptchaRef.current.reset();
            }}
          />
          {!!recaptchaErrorMsg && (
            <p className="form-container__recaptcha-error">
              {recaptchaErrorMsg}
            </p>
          )}
        </section>
        <PrimaryBtn
          className="button--flex-align-stretch"
          type="submit"
          disabled={disableFormBtn}
        >
          {formSubmitBtnText}
        </PrimaryBtn>
      </form>
      <p className="form-container__paragraph">
        {formParagraph}
        <Link
          className="form-container__prargraph-link"
          state={linkStateData}
          to={formParagraphLinkTo}
        >
          {formParagraphLink}
        </Link>
      </p>
    </article>
  );
};
export default AuthForm;
