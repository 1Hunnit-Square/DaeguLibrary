import Layout from "../layouts/Layout"
import QMenuComponent from "../components/main/QMenuComponent";
import GenreMenu from "../menus/GenreMenu";
import GenreComponent from "../components/main/GenreComponent";
import ClosedInfoComponent from "../components/main/ClosedInfoComponent";
import BoardMenu from "../menus/BoardMenu";

const MainPage = () => {
    return (
        <Layout sideOn={false}>
            <div className="bg-white">
                <QMenuComponent />
            </div>
            <div className="bg-[#f4f3f3] flex-1 w-full py-6">
                <div className="mt-5 container mx-auto max-w-[80%]">
                    <div className="flex gap-6">
                        <div className="w-[45%]">
                            <div className="bg-white rounded-lg shadow-sm h-[472px]">
                                이달의 프로그램
                            </div>
                        </div>
                        <div className="w-[55%]">
                            <div className="flex flex-col space-y-4">
                                <div className="bg-white rounded-lg shadow-sm h-[200px]">
                                <BoardMenu />
                                </div>
                                <div className="bg-white rounded-lg shadow-sm h-[120px]">
                                    독서 마라톤 대회
                                </div>
                                <div className="bg-white rounded-lg shadow-sm h-[120px]">
                                    <ClosedInfoComponent />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-10 container mx-auto max-w-[80%]">
                    <div className="w-full bg-white rounded-lg shadow-sm h-[350px]">
                        추천도서
                    </div>
                    <div className="mt-10 w-full bg-white rounded-lg shadow-sm h-[350px] mb-10">
                        <GenreMenu Component={GenreComponent} />

                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MainPage;