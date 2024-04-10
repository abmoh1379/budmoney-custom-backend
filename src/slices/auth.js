import { createSlice } from "@reduxjs/toolkit";
import {
  startSignUpWithEmailAndPassword,
  startLogInWithEmailAndPassword,
  startLogout,
} from "../actions/auth";

const initialState = {
  loading: false,
  error: null,
  email: null,
  accessToken: null,
};

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setNewAccessToken: {
      reducer: (state, { payload }) => {
        state.accessToken = payload;
      },
      prepare: (accessToken) => {
        return {
          payload: accessToken,
        };
      },
    },
    resetErrorAndLoading: (state, action) => {
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startSignUpWithEmailAndPassword.pending, (state, action) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(
        startSignUpWithEmailAndPassword.fulfilled,
        (state, { payload }) => {
          if(!!payload) { // payload will always only be error message
            state.error = payload;
          }
          state.loading = false;
        }
      )
      .addCase(startSignUpWithEmailAndPassword.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(startLogInWithEmailAndPassword.pending, (state, action) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(
        startLogInWithEmailAndPassword.fulfilled,
        (state, { payload }) => {
          state.loading = false;
          if(payload.flag === 'fulfilled') {
            state.email = payload.email;
            state.accessToken = payload.accessToken;
          } else if(payload.flag === 'rejected'){    // some error occured.
            state.error = payload.errorMessage;
          }
        }
      )
      .addCase(startLogInWithEmailAndPassword.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(startLogout.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startLogout.fulfilled, (state, { payload }) => {
        state.loading = false;
        if(!payload) {
          state.email = null;
          state.accessToken = null;
        } else if(payload === 'expiredRefreshToken') {
          //here, we just remove the refreshToken cookie and log the user out manually.
          state.email = null;
          state.accessToken = null;
        } else {
          // for all other type of errors, we just dont logout the user.
        }
      })
      .addCase(startLogout.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserEmail = (state) => state.auth.email;
export const selectAccessToken = (state) => state.auth.accessToken;
export const { login, logout, resetErrorAndLoading, setNewAccessToken } =
  auth.actions;
export default auth.reducer;
