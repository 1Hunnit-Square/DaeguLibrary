import Header from "./Header";
import Footer from "./Footer";
import LSide from "./LSide";
import MainMenu from "../menus/MainMenu";
import Search from "./Search";
import ChatComponent from "../components/chat/ChatComponent";
import { getChatbotResponse, resetChatHistory } from "../api/chatbotApi";
import { useMutation } from '@tanstack/react-query';
import { useRecoilState} from 'recoil';
import { isChatOpenState } from '../atoms/chatState';
import { useCallback } from "react";




const Layout = ({children, sideOn = true, LMainMenu, LSideMenu}) => {
    const [isChatOpen, setIsChatOpen] = useRecoilState(isChatOpenState);
  
    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }
   

  



    return(
        <div className="flex flex-col min-h-screen ">
            <Header />
            <MainMenu />
            <div className="w-full
                aspect-[5/1] sm:aspect-[6.2/1] md:aspect-[6.1/1] lg:aspect-[6/1]
                p-4 sm:p-6 md:p-8 lg:p-12 xl:p-15 shadow-lg 
                flex items-center justify-center" 
                style={{
                backgroundImage: 'url(/main.png)', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
                
                }}>
            <Search />
            </div>
            <div className="flex flex-1 flex-col md:flex-row">
            {sideOn && (
                    <aside className="hidden lg:block lg:w-72 lg:min-w-72 border-r border-gray-200 shadow-sm">
                        <LSide LMainMenu={LMainMenu} LSideMenu={LSideMenu} />
                    </aside>
                )}
                <main className="flex-1 flex flex-col w-full min-w-0">
                    <div className="p-4 md:p-6 w-full">
                        {children}
                    </div>
                </main>
            </div>
          
            <div className="fixed bottom-6 sm:bottom-6 left-5 sm:left-7 z-999 cursor-pointer hover:scale-120 transition-transform bg-white rounded-full p-1 sm:p-2 shadow-lg"
           onClick={toggleChat}>
            <img
                src="/chaticon.png"
                alt="꿈틀이AI"
                className="w-14 h-14 sm:w-16 sm:h-16"
            />
        </div>  
        {isChatOpen && <ChatComponent onClose={()=> setIsChatOpen(false)} />}
            <Footer />
        </div>
    );
}

export default Layout;