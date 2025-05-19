import Header from "./Header";
import Footer from "./Footer";
import LSide from "./LSide";
import MainMenu from "../menus/MainMenu";
import Search from "./Search";

const Layout = ({children, sideOn = true, LMainMenu, LSideMenu}) => {
    return(
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainMenu />
            <div className="w-full bg-emerald-900 p-15"><Search /></div>
            <div className="flex flex-1 flex-col md:flex-row">
                {sideOn && (
                    <aside className="w-full md:w-72 md:min-w-72 border-r border-gray-200 shadow-sm">
                        <LSide LMainMenu={LMainMenu} LSideMenu={LSideMenu} />
                    </aside>
                )}
                <main className="flex-1 flex flex-col">
                    <div className="p-4 md:p-6 w-full">
                        {children}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default Layout;