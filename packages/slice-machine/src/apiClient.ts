import axios, { AxiosResponse } from "axios";
import { CheckAuthStatusResponse } from "@models/common/Auth";

const defaultAxiosConfig = {
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/** Auth Routes **/

export const startAuth = (): Promise<AxiosResponse<{}>> =>
  axios.post("/api/auth/start", {}, defaultAxiosConfig);

export const checkAuthStatus = (): Promise<
  AxiosResponse<CheckAuthStatusResponse>
> => axios.post("/api/auth/status", {}, defaultAxiosConfig);
