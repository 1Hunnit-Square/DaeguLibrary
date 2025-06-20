import React, { memo } from 'react';
import MainMenu from "../menus/MainMenu";
import LoginMenu from "../menus/LoginMenu";
import { Link } from "react-router-dom";
import Search from "./Search";


const Header = () => {
    return(
        <>
            <div className="flex justify-end mr-3 sm:mr-10 mt-3"> <LoginMenu /> </div>
            <Link to="/" className="inline-block w-fit">
                <img src="/logo.png" className="w-35 ml-3" />
            </Link>
            {/* <div className=''> <MainMenu /> </div> */}
            {/* <div className="w-full bg-emerald-900 p-15"><Search /></div> */}
        </>
    );
};

export default memo(Header);