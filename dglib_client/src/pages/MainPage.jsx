import Layout from "../layouts/Layout"
import QMenuComponent from "../components/main/QMenuComponent";
import GenreMenu from "../menus/GenreMenu";
import GenreComponent from "../components/main/GenreComponent";
import ClosedInfoComponent from "../components/main/ClosedInfoComponent";
import BoardMenu from "../menus/BoardMenu";
import RecoMenu from "../menus/RecoMenu";
import RecoComponent from "../components/main/RecoComponent";
import ProgramMainBannerComponent from "../components/main/ProgramMainBannerComponent";
import EventMainBannerComponent from "../components/main/EventMainBannerComponent";

const MainPage = () => {
    return (
        <Layout sideOn={false}>
            <div className="bg-white">
                <QMenuComponent />
            </div>
            <div className="bg-[#f4f3f3] flex-1 w-full py-4 sm:py-6">
                <div className="mt-3 sm:mt-5 container mx-auto px-4 sm:px-6 lg:max-w-[90%] xl:max-w-[80%]">
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        <div className="w-full lg:w-[45%]">
                            <div className="bg-white rounded-lg shadow-sm h-[300px] sm:h-[400px] lg:h-[472px] p-4">
                                <ProgramMainBannerComponent />
                            </div>
                        </div>
                        <div className="w-full lg:w-[55%]">
                            <div className="flex flex-col space-y-3 sm:space-y-4 h-[300px] sm:h-[400px] lg:h-[472px]">
                                <div className="bg-white rounded-lg shadow-sm h-[150px] sm:h-[180px] lg:h-[200px] p-1">
                                    <BoardMenu />
                                </div>
                                <div className="flex flex-1 gap-x-4 min-h-0">
                                    <div className="w-full sm:flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                                        <EventMainBannerComponent />
                                    </div>
                                    <div className="w-full sm:flex-1 bg-white rounded-lg shadow-sm">
                                        <ClosedInfoComponent />
                                    </div>
                                
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-10 container mx-auto px-4 sm:px-6 lg:max-w-[90%] xl:max-w-[80%]">
                    <div className="mt-10 w-full bg-white rounded-lg shadow-sm min-h-[200px] mb-10 p-1">
                        <RecoMenu Component={RecoComponent} />
                    </div>
                    <div className="mt-10 w-full bg-white rounded-lg shadow-sm min-h-[200px] mb-10 p-1">
                        <GenreMenu Component={GenreComponent} />

                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MainPage;