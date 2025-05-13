import { Navigate, useNavigate } from "react-router-dom"



export const useMoveTo = () => {
    const navigate = useNavigate();

    
    const moveToPath = (path) => {
    navigate({pathname: path}, {replace:true})
    }


return {moveToPath}; 
} 