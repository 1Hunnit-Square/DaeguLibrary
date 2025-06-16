import Layout from "../layouts/Layout"
import QMenuComponent from "../components/main/QMenuComponent";
import GenreMenu from "../menus/GenreMenu";
import GenreComponent from "../components/main/GenreComponent";
import ClosedInfoComponent from "../components/main/ClosedInfoComponent";
import BoardMenu from "../menus/BoardMenu";
import RecoMenu from "../menus/RecoMenu";
import RecoComponent from "../components/main/RecoComponent";

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
                                <h2 className="text-lg sm:text-xl font-bold mb-4">이달의 프로그램</h2>
                                {/* 프로그램 내용 */}
                            </div>
                        </div>
                        <div className="w-full lg:w-[55%]">
                            <div className="flex flex-col space-y-3 sm:space-y-4">
                                <div className="bg-white rounded-lg shadow-sm h-[150px] sm:h-[180px] lg:h-[200px] p-1">
                                   <BoardMenu />
                                </div>
                                <div className="bg-white rounded-lg shadow-sm h-[100px] sm:h-[110px] lg:h-[120px] p-4">
                                    <h2 className="text-base sm:text-lg font-bold mb-2">독서 마라톤 대회</h2>
                                    {/* 대회 내용 */}
                                </div>
                                <div className="bg-white rounded-lg shadow-sm h-[150px] sm:h-[140px] lg:h-[120px]">
                                    <ClosedInfoComponent />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-10 container mx-auto max-w-[80%]">
                    <div className="mt-10 w-full bg-white rounded-lg shadow-sm min-h-[200px] mb-10">
                        <RecoMenu Component={RecoComponent} />
                    </div>
                    <div className="mt-10 w-full bg-white rounded-lg shadow-sm min-h-[200px] mb-10">
                        <GenreMenu Component={GenreComponent} />

                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MainPage;