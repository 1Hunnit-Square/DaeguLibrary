import { API_SERVER_HOST, API_ENDPOINTS } from "../api/config";
import { getCookie, setCookie } from "./cookieUtil";
import { useLogin } from "../hooks/useLogin";
import { logoutHelper } from "./logoutHelper";

import axios from "axios";

const host = `${API_SERVER_HOST}${API_ENDPOINTS.member}`;

const refreshToken = async (accessToken, refreshToken) => {
    const header = {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
        }
    };
    const params = new URLSearchParams();
    params.append("refreshToken", refreshToken);

    const result = await axios.post(
        `${host}/refresh`,
        params,
        header
    ).then(res => res.data)
    .catch(error => {
        console.error(error)
        return null;
    });
    return result;

};


const axiosClient = axios.create();

const beforeReq = (config) => {
    console.log("before request...");
    const memberInfo = getCookie("auth");
    if(!memberInfo) {
        console.log("Request without auth (guest user)");
        return config;
    }
    const {accessToken} = memberInfo;
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
}

const requestFail = (err) => {
    console.log("request error...");
    return Promise.reject(err);
}

const beforeRes = async (res) => {
    console.log("before return response...");


    if (!res.data || res.data.error !== 'ERROR_ACCESS_TOKEN') {
        return res;
    }
    const memberCookie = getCookie("auth");
    if (!memberCookie) {
        if(res.data.error == "ERROR_ACCESS_TOKEN"){
            return Promise.reject(new Error("NOT_EXIST_TOKEN"));
        }
        return res;
    }

    const result = await refreshToken(memberCookie.accessToken, memberCookie.refreshToken);
    if(!result){
        console.log("아무거나")
        return Promise.reject(new Error("REQUIRE_RELOGIN"));
    }

    console.log("refreshJWT RESULT", result);
    memberCookie.accessToken = result.accessToken;
    memberCookie.refreshToken = result.refreshToken;
    setCookie("auth", memberCookie, 1);

    const originalRequest = res.config;
    originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
    return await axios(originalRequest);
}

const responseFail = (err) => {
    console.log("response fail error...");
    return Promise.reject(err);
}

axiosClient.interceptors.request.use(beforeReq, requestFail);
axiosClient.interceptors.response.use(beforeRes, responseFail);


export const isAuthenticated = () => {
    return !!getCookie("auth");
};

export default axiosClient;