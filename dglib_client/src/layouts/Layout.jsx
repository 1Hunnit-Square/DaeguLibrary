import Header from "./Header";
import Footer from "./Footer";
import LSide from "./LSide";
import MainMenu from "../menus/MainMenu";
import Search from "./Search";
import ChatComponent from "../components/chat/ChatComponent";
import { getChatbotResponse, resetChatHistory } from "../api/chatbotApi";
import { useMutation } from '@tanstack/react-query';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { chatHistoryState, isChatOpenState, clientIdState } from '../atoms/chatState';
import { useCallback } from "react";



const Layout = ({children, sideOn = true, LMainMenu, LSideMenu}) => {
    const [isChatOpen, setIsChatOpen] = useRecoilState(isChatOpenState);
    const [chatHistory, setChatHistory] = useRecoilState(chatHistoryState);
    const resetChatHistoryState = useResetRecoilState(chatHistoryState);
    const [clientId, setClientId] = useRecoilState(clientIdState);
  

    const chatMutation = useMutation({
        mutationFn: async (param) => {
            const response = await getChatbotResponse(param);
            return response;
        },
        onSuccess: (data) => {
            console.log("Chatbot response:", data);
            setChatHistory(prev => [...prev, { role: "model", parts: data.parts, service: data.service, to: data.to }]);
            setClientId(data.clientId);
        },
        onError: (error) => {
            console.error("Error fetching chatbot response:", error);
            setChatHistory(prev => [...prev, { role: "model", parts: "오늘은 쉽니당. 꿈틀꿈틀🌱" }]);
        }
    });

    const resetChatMutation = useMutation({
        mutationFn: async (clientId) => {
            const response = await resetChatHistory(clientId);
            return response;
        },
        onSuccess: () => {
            resetChatHistoryState();
            setClientId("");
            console.log("Chat history reset successfully.");
        },
        onError: (error) => {
            console.error("Error resetting chat history:", error);
        }
    })

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
            clientId: clientId,
           
        }
        chatMutation.mutate(param);
    }, [clientId, chatMutation, setChatHistory]);

    const resetHandler = useCallback(() => {
        console.log("Resetting chat history for clientId:", clientId);
        resetChatMutation.mutate(clientId);
    }, [clientId, resetChatMutation]);


    return(
        <div className="flex flex-col min-h-screen ">
            <Header />
            <MainMenu />
            <div className="w-full bg-emerald-900 p-15"><Search /></div>
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
            <div className="fixed bottom-6 sm:bottom-6 right-6 sm:right-10 z-999 cursor-pointer hover:scale-105 transition-transform bg-white rounded-full p-1 sm:p-2 shadow-lg"
           onClick={toggleChat}>
            <img
                src="/chaticon.png"
                alt="꿈틀이AI"
                className="w-14 h-14 sm:w-20 sm:h-20"
            />
        </div>
        {isChatOpen && <ChatComponent onClose={() => setIsChatOpen(false)} chatHistory={chatHistory} addMessage={addMessage} resetChat={resetHandler} />}
            <Footer />
        </div>
    );
}

export default Layout;