import BasicLayout from "../layouts/BasicLayout";
import GenreMenu from "../components/GenreMenu";
import { Outlet } from "react-router-dom";

const Genre = () => {
    

    return (
        <BasicLayout>
            <GenreMenu />
            <Outlet />
        </BasicLayout>
        
    )
}

export default Genre;