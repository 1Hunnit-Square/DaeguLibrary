import { API_SERVER_HOST, API_ENDPOINTS } from "../api/config";
import { getCookie, setCookie } from "./cookieUtil";
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
    
    const res = await axios.post(
        `${host}/refresh`, 
        params, 
        header
    );
    
    return res.data;
};

const axiosAuth = axios.create();

const beforeReq = (config) => {
    console.log("before request...");
    const memberInfo = getCookie("auth");

    if(!memberInfo) {
    console.log("Member NOT FOUND")
    return Promise.reject(
    {
        response:
        { data:
            { error:"REQUIRE_LOGIN" }
        }
    }
    );
    }

    const {accessToken} = memberInfo;
    config.headers.Authorization = `Bearer ${accessToken}`;

return config;
}

const requestFail = (err) => {
    console.log("request error...")
return Promise.reject(err)
}

const beforeRes = async (res) => {
    console.log("before return response...");
    console.log(res);
    const data = res.data;

    if(data && data.error ==='ERROR_ACCESS_TOKEN'){
        const memberCookie = getCookie("auth")
        const result = await refreshToken( memberCookie.accessToken, memberCookie.refreshToken );
        console.log("refreshJWT RESULT", result)
        memberCookie.accessToken = result.accessToken
        memberCookie.refreshToken = result.refreshToken
        setCookie("member", JSON.stringify(memberCookie), 1);

        const originalRequest = res.config;
        originalRequest.headers.Authorization = `Bearer ${result.accessToken}`
        return await axios(originalRequest);
        }
        return res
}

const responseFail = (err) => {
    console.log("response fail error...")
return Promise.reject(err);
}

axiosAuth.interceptors.request.use( beforeReq, requestFail );
axiosAuth.interceptors.response.use( beforeRes, responseFail);

export default axiosAuth;