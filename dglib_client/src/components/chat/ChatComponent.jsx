import { useState, useEffect, useRef, memo, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import ChatActionComponent from "./ChatActionComponent";
import VoiceWebSocketComponent from "./VoiceWebSocketComponent";
import { getChatbotResponse, resetChatHistory } from "../../api/chatbotApi";
import { useMutation } from '@tanstack/react-query';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { chatHistoryState, clientIdState } from '../../atoms/chatState';

const ChatComponent = ({ onClose }) => {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    const [chatHistory, setChatHistory] = useRecoilState(chatHistoryState);
    const resetChatHistoryState = useResetRecoilState(chatHistoryState);
    const [clientId, setClientId] = useRecoilState(clientIdState);
    const chatEndRef = useRef(null);
    const prevChatLengthRef = useRef(chatHistory.length);

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
    });

    const addMessage = useCallback((message) => {
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
    


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [chatHistory]);

    useEffect(() => {
        if (chatHistory.length > prevChatLengthRef.current &&
            chatHistory.length > 0 &&
            chatHistory[chatHistory.length - 1].role === "model") {
            setIsTyping(false);
        }
        prevChatLengthRef.current = chatHistory.length;
    }, [chatHistory]);


   const handleSendMessage = (e) => {
        e.preventDefault();
        if (isTyping) {
            return;
        }
       
        if (!message.trim()) return;
        addMessage(message);
        setMessage("");
        setIsTyping(true);
    };

    return (
        <>
        <div className="fixed bottom-23 sm:bottom-5 right-4 sm:right-5 md:right-10 lg:right-20 xl:right-40 
                        w-[calc(100vw-32px)] sm:w-80 md:w-96 lg:w-[400px] 
                        h-[calc(100dvh-130px)] sm:h-[600px] md:h-[650px] lg:h-[600px] 
                        bg-white rounded-lg sm:rounded-xl shadow-xl z-150 overflow-hidden flex flex-col">
            
            <div className="bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
                <h3 className="font-bold text-sm sm:text-base">도서관 도우미 꿈틀이</h3>
                <div className="flex items-center gap-4">
                    <img src="/reset.png" title="초기화" className="w-4 h-4 mt-1.5 items-center hover:cursor-pointer" onClick={resetHandler} />
                    <button
                        onClick={onClose}
                        className="text-white text-3xl sm:text-xl hover:text-gray-200 hover:cursor-pointer "
                    >
                        &times;
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-100">
            {chatHistory.map((chat, index) => { 
                    return(
                    <div key={index}>
                        
                        <div className={`mb-3 sm:mb-4 flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] sm:max-w-[90%] px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                                    chat.role === "user"
                                        ? "bg-green-500 text-white rounded-br-none"
                                        : "bg-white text-gray-800 rounded-bl-none shadow"
                                }`}
                            >
                                <ReactMarkdown
                                    breaks={true}
                                    components={{
                                        p: ({children}) => <p className="whitespace-pre-line break-words">{children}</p>,
                                        code: ({node, inline, className, children, ...props}) => {
                                            return inline
                                                ? <code className="bg-opacity-25 bg-black text-white px-1 rounded text-xs sm:text-sm break-words" {...props}>{children}</code>
                                                : <div className="bg-gray-800 text-white bg-opacity-10 p-2 rounded-md overflow-x-auto">
                                                    <code className="text-xs sm:text-sm break-words whitespace-pre-wrap">{children}</code>
                                                </div>
                                        },
                                        pre: ({children}) => <pre className="overflow-x-auto max-w-full">{children}</pre>
                                    }}
                                >
                                    {chat.parts}
                                </ReactMarkdown>
                            </div>
                        </div>
                        
                        
                        <ChatActionComponent chat={chat} />
                    </div>
                )})}
                {isTyping && (
                    <div className="mb-3">
                        <div className="inline-block px-3 sm:px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{animationDelay: '0.15s'}}></div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{animationDelay: '0.3s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-2 sm:p-3 bg-white border-t flex gap-2">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (message.trim()) handleSendMessage(e);
                        }
                    }}
                    rows="1"
                    style={{ resize: 'none' }}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 border rounded-lg px-2 sm:px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 
                             min-h-[36px] sm:min-h-[40px] max-h-[100px] sm:max-h-[120px] overflow-y-auto text-base
                             [&::-webkit-scrollbar]:w-2
                             [&::-webkit-scrollbar-thumb]:bg-gray-400
                             [&::-webkit-scrollbar-thumb]:rounded-md
                             [&::-webkit-scrollbar-track]:bg-transparent"
                />
                <img src="/mic.png" className="w-8 border rounded-full border-green-700 hover:cursor-pointer"
                onClick={() => setIsVoiceOpen(true)} />
                <button
                    type="submit"
                    className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base whitespace-nowrap"
                >
                    전송
                </button>
            </form>
            
        </div>
        {isVoiceOpen && <VoiceWebSocketComponent onClose={() => setIsVoiceOpen(false)} />}
        </>
    );
};

export default memo(ChatComponent);