import React from "react";
import Cookies from "universal-cookie";
import { useDispatch } from "react-redux";
import { startLogout } from "../actions/auth";
import { setNewAccessToken } from "../slices/auth";
import { usersAxiosInstance } from "../api/api";

const useRefreshToken = () => {
  const dispatch = useDispatch();
  const forJwtRefreshTokenCookie = new Cookies();
  const refreshToken = forJwtRefreshTokenCookie.get("jwtRefreshToken");
  const refresh = async () => {
    try {
      const res = await usersAxiosInstance({
        url: "/refresh",
        timeout: 10000,
        data: {
          refreshToken,
        },
      });
      dispatch(setNewAccessToken(res.data.token));
      return {
        status : 'fulfilled',
        accessToken : res.data.token,
      };
    } catch (e) {
      if(e.response) {
        if(e.response.status) {
          if(e.response.status === 400) {
            // expired refresh Token
            dispatch(startLogout());
            return;
          }
        }
      } else {
        return {
          status : 'rejected',
          errorMessage : 'something went wrong! Try refreshing the page again!'
        };
      }
    }
  };
  return refresh;
};

export default useRefreshToken;
