import axios from "axios";

const API_KEY =`aea7f764f199c88568ded7e2620f0622`
const REDIRECT_URI =`http://localhost:5173/login/kakao`
const AUTH_KAKAO = `https://kauth.kakao.com/oauth/authorize`
const ACCESS_URL =`https://kauth.kakao.com/oauth/token`

export const kakaoURL = () => {
return `${AUTH_KAKAO}?client_id=${API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
}

export const getAccessToken = async (authCode) => {
const header = {
    headers: {
    "Content-Type": "application/x-www-form-urlencoded",
            }
        }
    const params = {
    grant_type: "authorization_code",
    client_id: API_KEY,
    redirect_uri: REDIRECT_URI,
    code: authCode
    }
const res = await axios.post(ACCESS_URL, params , header)
const accessToken = res.data.access_token
return accessToken
}