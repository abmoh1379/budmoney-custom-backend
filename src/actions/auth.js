import { createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "universal-cookie";
import axios from "axios";
import { usersAxiosInstance, privateUsersAxiosInstance } from "../api/api";

const cookies = new Cookies();
export const startSignUpWithEmailAndPassword = createAsyncThunk(
  "auth/startSignUpWithEmailAndPassword",
  async ({ email, password }, { getState, dispatch }) => {
    try {
      await usersAxiosInstance({
        url: "/register",
        timeout: 10000,
        data: {
          email,
          password,
          username: email,
          role: "Admin",
        },
      });
    } catch (e) {
      let errorMessage = "";
      if (!!e.response) {
        switch (e.response.status) {
          case 400:
            {
              // handling email already taken.
              errorMessage =
                e.response.data.DuplicateEmail &&
                e.response.data.DuplicateEmail[0];
            }
            break;
          case 500: {
            errorMessage = "Something went wrong. Try again.";
          }
          case 502:
            {
              errorMessage = "The server is overloaded. Try again later.";
            }
            break;
          case 503:
            {
              errorMessage = "Server is currently unavaible. Try again later.";
            }
            break;
          case 408:
            {
              errorMessage = "your request timed out. Try again.";
            }
            break;
          default: {
            errorMessage = "";
          }
        }
      } else if (!e.response) {
        if (e.request) {
          switch (e.message) {
            case "Network Error":
              {
                errorMessage = "Server is down. Try again later.";
              }
              break;

            case "timeout of 10000ms exceeded":
              {
                errorMessage = "Your request has been canceled. Try again.";
              }
              break;
            default: {
              errorMessage = "";
            }
          }
        } else {
          errorMessage =
            "Something went wrong with request. Check your internet connection";
        }
      }
      return errorMessage;
    } finally {
      
    }
  }
);

export const startLogInWithEmailAndPassword = createAsyncThunk(
  "auth/startLogInWithEmailAndPassword",
  async ({ email, password }, { getState, dispatch }) => {
    try {
      const res = await usersAxiosInstance({
        url: "/login",
        timeout: 10000,
        data: {
          email,
          password,
        },
      });

      const {
        email: loggedInEmail,
        token: accessToken,
        refreshToken,
      } = res.data;
      cookies.set("jwtRefreshToken", refreshToken);
      return {
        flag: "fulfilled",
        email: loggedInEmail,
        accessToken,
      };
    } catch (e) {
      console.log(e);
      let errorMessage = "";
      if (!!e.response) {
        switch (e.response.status) {
          case 400:
            {
              if (e.response.data === "Bad credentials") {
                errorMessage = "Password or email is incorrect.";
              }
            }
            break;
          case 500: {
            errorMessage = "Something went wrong. Try again.";
          }
          case 502:
            {
              errorMessage = "The server is overloaded. Try again later.";
            }
            break;
          case 503:
            {
              errorMessage = "Server is currently unavaible. Try again later.";
            }
            break;
          case 408:
            {
              errorMessage = "Your request timed out. Try again.";
            }
            break;
          default: {
            errorMessage = "";
          }
        }
      } else if (!e.response) {
        if (e.request) {
          switch (e.message) {
            case "Network Error":
              {
                errorMessage = "Server is down. Try again later.";
              }
              break;
            case "timeout of 10000ms exceeded":
              {
                errorMessage = "Your request has been canceled. Try again.";
              }
              break;
            default: {
              errorMessage = "";
            }
          }
        } else {
          errorMessage =
            "Something went wrong with request. Check your internet connection";
        }
      }
      return {
        flag: "rejected",
        errorMessage,
      };
    } finally {
    }
  }
);

export const startLogout = createAsyncThunk(
  "auth/startLogout",
  async (undefined, { getState }) => {
    const {
      auth: { accessToken },
    } = getState();
    const responseInterceptor =
      privateUsersAxiosInstance.interceptors.response.use(
        (res) => res,
        async (e) => {
          let prevRequest = e.config && e.config;
          if (e.response) {
            if (e.response.status) {
              if (e.response.status === 401) {
                const refreshToken = cookies.get("jwtRefreshToken");
                try {
                  const res = await usersAxiosInstance({
                    url: "/refresh",
                    timeout: 10000,
                    data: {
                      refreshToken,
                    },
                  });
                  // we dont need to store accessToken, since we are just logging out anyways.
                  prevRequest.headers.Authorization = `Bearer ${res.data.token}`;
                  return privateUsersAxiosInstance(prevRequest);
                } catch (e) {
                  if (e.response) {
                    if (e.response.status) {
                      if (e.response.status === 400) {
                        // if refreshToken is expired and we make request to get a new accessToken with an expired refreshToken.
                        return Promise.reject("expiredRefreshToken");
                      } else if (e.response.status === 500) {
                        // if internal server 
                        return privateUsersAxiosInstance(prevRequest);
                      } else if (e.response.status === 502) {
                        // if server was overloaded, dont try again.
                        return Promise.reject(e);
                      } else if (e.response.status === 503) {
                        // if service is unaviable
                        return Promise.reject(e);
                      }
                    }
                  } else if (!e.response) {
                    if (e.request) {
                      switch (e.message) {
                        case "timeout of 10000ms exceeded": {
                          // we just run the request with previous request to again try for getting an accessToken
                          return privateUsersAxiosInstance(prevRequest);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          // if accessToken was valid or whatever, but we did not even gotten a 401 with first attempt with the existing accesstoken.
          return Promise.reject(e);
        }
      );
    try {
      await privateUsersAxiosInstance({
        url: "/revoke",
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      cookies.remove("jwtRefreshToken");
    } catch (e) {
      if (e === "expiredRefreshToken") {
        // remove the expiredRefreshToken from client cookies.
        cookies.remove("jwtRefreshToken");
        return e;
      }
      if (e.response) {
        if (e.response.status) {
          switch (e.response.status) {
            case 500 : {
              // server error
              return 'internal server error. Try again.'
            }
            case 503: {
              // service unavailable
              return "serivce is unavaiable";
            }
            case 502: {
              // server overloaded.
              return "server is overloaded.";
            }
          }
        }
      } else if (!e.response) {
        if (e.request) {
          switch (e.message) {
            case "timeout of 10000ms exceeded":
              {
                // ...
              }
              break;
            default: {
              // ..
            }
          }
        }
      }
    } finally {
      privateUsersAxiosInstance.interceptors.response.eject(
        responseInterceptor
      );
    }
  }
);
