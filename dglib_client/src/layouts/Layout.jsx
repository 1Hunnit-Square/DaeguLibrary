import Header from "./Header";
import Footer from "./Footer";
import LSide from "./LSide";
import MainMenu from "../menus/MainMenu";
import Search from "./Search";
import Chat from "./Chat";
import { getChatbotResponse } from "../api/chatbotApi";
import { useMutation } from '@tanstack/react-query';
import { useRecoilState } from 'recoil';
import { chatHistoryState, isChatOpenState, clientIdState } from '../atoms/chatState';
import { useCallback } from "react";


const Layout = ({children, sideOn = true, LMainMenu, LSideMenu}) => {
    const [isChatOpen, setIsChatOpen] = useRecoilState(isChatOpenState);
    const [chatHistory, setChatHistory] = useRecoilState(chatHistoryState);
    const [clientId, setClientId] = useRecoilState(clientIdState);
    const chatMutation = useMutation({
        mutationFn: async (param) => {
            const response = await getChatbotResponse(param);
            return response;
        },
        onSuccess: (data) => {
            console.log("Chatbot response:", data);
            setChatHistory(prev => [...prev, { role: "model", parts: data.parts }]);
            setClientId(data.clientId);
        },
        onError: (error) => {
            console.error("Error fetching chatbot response:", error);
            setChatHistory(prev => [...prev, { role: "model", parts: "죄송합니다. 오류가 발생했습니다." }]);
        }
    });
    console.log(clientId);


    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }
    const addMessage = useCallback((message) =>  {
        setChatHistory(prev => [...prev, {
            role: "user",
            parts: message,
            clientId: clientId
        }]);
        const param = {
            parts: message,
            clientId: clientId
        }
        chatMutation.mutate(param);
    }, [clientId, chatMutation, setChatHistory]);


    return(
        <div className="flex flex-col min-h-screen ">
            <Header />
            <MainMenu />
            <div className="w-full bg-emerald-900 p-15"><Search /></div>
            <div className="flex flex-1 flex-col md:flex-row">
                {sideOn && (
                    <aside className="w-full md:w-72 md:min-w-72 border-r border-gray-200 shadow-sm">
                        <LSide LMainMenu={LMainMenu} LSideMenu={LSideMenu} />
                    </aside>
                )}
                <main className="flex-1 flex flex-col w-full min-w-0">
                    <div className="p-4 md:p-6 w-full">
                        {children}
                    </div>
                </main>
            </div>
           <div className="fixed bottom-6 right-10 z-999 cursor-pointer hover:scale-105 transition-transform bg-white rounded-full p-2 shadow-lg"
           onClick={toggleChat}>
            <img
                src="/chaticon.png"
                alt="꿈틀이AI"
                className="w-20 h-20"
            />
        </div>
        {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} chatHistory={chatHistory} addMessage={addMessage} />}
            <Footer />
        </div>
    );
}

export default Layout;