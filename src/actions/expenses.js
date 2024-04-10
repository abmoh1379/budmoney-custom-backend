import { createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "universal-cookie";
import { privateExpensesAxiosInstance, usersAxiosInstance } from "../api/api";
import { startLogout } from "./auth";
import moment from "moment";
import { setNewAccessToken } from "../slices/auth";

const cookies = new Cookies();
export const startAddExpense = createAsyncThunk(
  "expenses/startAddExpense",
  async (expenseData, { getState, dispatch }) => {
    const {
      auth: { accessToken },
    } = getState();
    const responseIntercept =
      privateExpensesAxiosInstance.interceptors.response.use(
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
                  dispatch(setNewAccessToken(res.data.token));
                  prevRequest.headers.Authorization = `Bearer ${res.data.token}`;
                  return privateExpensesAxiosInstance(prevRequest);
                } catch (e) {
                  if (e.response) {
                    if (e.response.status) {
                      if (e.response.status === 400) {
                        // if refreshToken is expired and we make request to get a new accessToken with an expired refreshToken.
                        return Promise.reject("expiredRefreshToken");
                      } else if (e.response.status === 500) {
                        // if internal server
                        // we dont handle any interval server error in client, we just make the request again.
                        return privateExpensesAxiosInstance(prevRequest);
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
                          return privateExpensesAxiosInstance(prevRequest);
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
      // destructring expenseData and putting default values
      const {
        description = "",
        note = "",
        amount = 0,
        type = "Others",
        createdAt = moment().valueOf(),
      } = expenseData;
      const res = await privateExpensesAxiosInstance({
        url: "/new",
        method: "POST",
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          description,
          amount,
          note,
          type,
          createdAt,
        },
      });
      return {
        status : 'fulfilled',
        newExpense: {
          id: res.data.id,
          description,
          note,
          amount,
          type,
          createdAt,
        },
      };
    } catch (e) {
      if (e === "expiredRefreshToken") {
        // logout the user.
        dispatch(startLogout());
      }
      if (e.response) {
        if (e.response.status) {
          switch (e.response.status) {
            case 500: {
              // internal server error
              return {
                status: "rejected",
                errorMessage: "Something went wrong. Try again.",
              };
            }
            case 503: {
              // service unavailable
              return {
                status: "rejected",
                errorMessage: "Serivce is unavaiable. Try again.",
              };
            }
            case 502: {
              // server overloaded.
              return {
                status: "rejected",
                errorMessage: "Server is overloaded. Try again.",
              };
            }
            default: {
              return {
                status: "rejected",
                errorMessage: "Something went wrong.",
              };
            }
          }
        }
      } else if (!e.response) {
        if (e.request) {
          switch (e.message) {
            case "timeout of 10000ms exceeded": {
              return {
                status: "rejected",
                errorMessage: "Your request timed out. Try again.",
              };
            }
            default: {
              return {
                status: "rejected",
                errorMessage: "Something went wrong. Try again.",
              };
            }
          }
        }
      }
    } finally {
      privateExpensesAxiosInstance.interceptors.response.eject(
        responseIntercept
      );
    }
  }
);

export const startEditExpense = createAsyncThunk(
  "expenses/startEditExpense",
  async (expenseData, { getState, dispatch }) => {
    const {
      auth: { accessToken },
    } = getState();
    const responseIntercept =
      privateExpensesAxiosInstance.interceptors.response.use(
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
                  dispatch(setNewAccessToken(res.data.token));
                  prevRequest.headers.Authorization = `Bearer ${res.data.token}`;
                  return privateExpensesAxiosInstance(prevRequest);
                } catch (e) {
                  if (e.response) {
                    if (e.response.status) {
                      if (e.response.status === 400) {
                        // if refreshToken is expired and we make request to get a new accessToken with an expired refreshToken.
                        return Promise.reject("expiredRefreshToken");
                      } else if (e.response.status === 500) {
                        // if internal server
                        // we dont handle any interval server error in client, we just make the request again.
                        return privateExpensesAxiosInstance(prevRequest);
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
                          return privateExpensesAxiosInstance(prevRequest);
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
      await privateExpensesAxiosInstance({
        method: "PUT",
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        data: expenseData,
      });
      return {
        status : 'fulfilled',
        expenseData : expenseData
      };
    } catch (e) {
      if (e === "expiredRefreshToken") {
        // logout the user.
        dispatch(startLogout());
      }
      if (e.response) {
        if (e.response.status) {
          switch (e.response.status) {
            case 500: {
              // internal server error
              return {
                status: "rejected",
                errorMessage: "Something went wrong. Try again.",
              };
            }
            case 503: {
              // service unavailable
              return {
                status: "rejected",
                errorMessage: "Serivce is unavaiable. Try again.",
              };
            }
            case 502: {
              // server overloaded.
              return {
                status: "rejected",
                errorMessage: "Server is overloaded. Try again.",
              };
            }
            default: {
              return {
                status: "rejected",
                errorMessage: "Something went wrong.",
              };
            }
          }
        }
      } else if (!e.response) {
        if (e.request) {
          switch (e.message) {
            case "timeout of 10000ms exceeded": {
              return {
                status: "rejected",
                errorMessage: "Your request timed out. Try again.",
              };
            }
            default: {
              return {
                status: "rejected",
                errorMessage: "Something went wrong. Try again.",
              };
            }
          }
        }
      }
    } finally {
      privateExpensesAxiosInstance.interceptors.response.eject(
        responseIntercept
      );
    }
  }
);

export const startRemoveExpense = createAsyncThunk(
  "expenses/startRemoveExpense",
  async (expenseId, { getState, dispatch }) => {
    const {
      auth: { accessToken },
    } = getState();
    const responseIntercept =
      privateExpensesAxiosInstance.interceptors.response.use(
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
                  dispatch(setNewAccessToken(res.data.token));
                  prevRequest.headers.Authorization = `Bearer ${res.data.token}`;
                  return privateExpensesAxiosInstance(prevRequest);
                } catch (e) {
                  if (e.response) {
                    if (e.response.status) {
                      if (e.response.status === 400) {
                        // if refreshToken is expired and we make request to get a new accessToken with an expired refreshToken.
                        return Promise.reject("expiredRefreshToken");
                      } else if (e.response.status === 500) {
                        // if internal server
                        // we dont handle any interval server error in client, we just make the request again.
                        return privateExpensesAxiosInstance(prevRequest);
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
                          return privateExpensesAxiosInstance(prevRequest);
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
      const res = await privateExpensesAxiosInstance({
        method: "DELETE",
        timeout: 10000,
        url: `/${expenseId}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return {
        expenseId : expenseId,
        status : 'fulfilled'
      };
    } catch (e) {
      if (e === "expiredRefreshToken") {
        // logout the user.
        dispatch(startLogout());
      }
      if (e.response) {
        if (e.response.status) {
          switch (e.response.status) {
            case 500: {
              // internal server error
              return {
                status: "rejected",
                errorMessage: "Something went wrong. Try again.",
              };
            }
            case 503: {
              // service unavailable
              return {
                status: "rejected",
                errorMessage: "Serivce is unavaiable. Try again.",
              };
            }
            case 502: {
              // server overloaded.
              return {
                status: "rejected",
                errorMessage: "Server is overloaded. Try again.",
              };
            }
            default: {
              return {
                status: "rejected",
                errorMessage: "Something went wrong.",
              };
            }
          }
        }
      } else if (!e.response) {
        if (e.request) {
          switch (e.message) {
            case "timeout of 10000ms exceeded": {
              return {
                status: "rejected",
                errorMessage: "Your request timed out. Try again.",
              };
            }
            default: {
              return {
                status: "rejected",
                errorMessage: "Something went wrong. Try again.",
              };
            }
          }
        }
      }
    } finally {
      privateExpensesAxiosInstance.interceptors.response.eject(
        responseIntercept
      );
    }
  }
);

export const startFetchUserExpenses = createAsyncThunk(
  "expenses/startFetchUserExpenses",
  async (undefined, { getState, dispatch }) => {
    const {
      auth: { accessToken },
    } = getState();
    const responseIntercept =
      privateExpensesAxiosInstance.interceptors.response.use(
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
                  dispatch(setNewAccessToken(res.data.token));
                  prevRequest.headers.Authorization = `Bearer ${res.data.token}`;
                  return privateExpensesAxiosInstance(prevRequest);
                } catch (e) {
                  if (e.response) {
                    if (e.response.status) {
                      if (e.response.status === 400) {
                        // if refreshToken is expired and we make request to get a new accessToken with an expired refreshToken.
                        return Promise.reject("expiredRefreshToken");
                      } else if (e.response.status === 500) {
                        // if internal server
                        return privateExpensesAxiosInstance(prevRequest);
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
                          return privateExpensesAxiosInstance(prevRequest);
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
      const res = await privateExpensesAxiosInstance({
        method: "POST",
        timeout: 10000,
        data: {
          skipCount: 0,
          maxTakeCount: 100,
          filter: "",
          maxAmount: 10000000,
          minAmount: 0,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return {
        status: "fulfilled",
        expenses: res.data.expenses,
      };
    } catch (e) {
      if (e === "expiredRefreshToken") {
        // logout the user.
        dispatch(startLogout());
      }
      if (e.response) {
        if (e.response.status) {
          switch (e.response.status) {
            case 500: {
              // internal server error
              return {
                status: "rejected",
                errorMessage: "Something went wrong.",
              };
            }
            case 503: {
              // service unavailable
              return {
                status: "rejected",
                errorMessage: "Serivce is unavaiable.",
              };
            }
            case 502: {
              // server overloaded.
              return {
                status: "rejected",
                errorMessage: "Server is overloaded.",
              };
            }

            default: {
              return {
                status: "rejected",
                errorMessage: "Something went wrong.",
              };
            }
          }
        }
      } else if (!e.response) {
        if (e.request) {
          switch (e.message) {
            case "timeout of 10000ms exceeded": {
              return {
                status: "rejected",
                errorMessage: "Your request timed out.",
              };
            }
            default: {
              return {
                status: "rejected",
                errorMessage: "Something went wrong.",
              };
            }
          }
        }
      }
    } finally {
      privateExpensesAxiosInstance.interceptors.response.eject(
        responseIntercept
      );
    }
  }
);
