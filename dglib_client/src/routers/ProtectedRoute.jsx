import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../atoms/loginState";
import { useMoveTo } from "../hooks/useMoveTo";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const mid = useRecoilValue(memberIdSelector);
  const { moveToLogin } = useMoveTo();


  useEffect(() => {
    if (!mid) {
      moveToLogin("로그인이 필요합니다.", { replace: true });
    }
  }, [mid, moveToLogin]);


  return mid ? children : null;
};

export default ProtectedRoute;