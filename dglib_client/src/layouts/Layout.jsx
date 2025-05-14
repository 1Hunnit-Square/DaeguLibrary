import Header from "./Header";
import Footer from "./Footer";
import LSide from "./LSide";

const Layout = ({children, sideOn = true}) => {
    return(
        <div className="flex flex-col min-h-screen text-center">
            <Header />
            <div className="flex flex-1 flex-col md:flex-row">
                {sideOn && <aside className="w-full md:w-64 bg-gray-100 p-4"> <LSide /> </aside>}
                <main className="flex-1 flex flex-col">{children}</main>
            </div>
            <Footer />
        </div>
    );
}

export default Layout;