import { useRecoilValue } from "recoil";
import { memberIdSelector, memberRoleSelector } from "../atoms/loginState";
import { useMoveTo } from "../hooks/useMoveTo";
import { useEffect } from "react";

const ProtectedAdminRoute = ({ children }) => {
  const mid = useRecoilValue(memberIdSelector);
  const role = useRecoilValue(memberRoleSelector);
  console.log("ProtectedAdminRoute mid:", mid, "role:", role);
  const { moveToPath } = useMoveTo();




  useEffect(() => {
    
    if (role !== "MANAGER" && role !== "ADMIN") {
      alert("권한이 필요합니다.");
      moveToPath("/");
    }
  }, [mid, role, moveToPath]);


  return mid ? children : null;
};

export default ProtectedAdminRoute;