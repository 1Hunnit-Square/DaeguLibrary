import { useState, useEffect, useRef, memo } from "react";
import ReactMarkdown from 'react-markdown';

const Chat = ({ onClose, chatHistory, addMessage }) => {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const prevChatLengthRef = useRef(chatHistory.length);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [chatHistory]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, []);

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
        if (!message.trim()) return;
        addMessage(message);
        setMessage("");
        setIsTyping(true);
    };

    return (
        <div className="fixed bottom-5 right-40 w-80 md:w-124 h-[700px] bg-white rounded-xl shadow-xl z-999 overflow-hidden flex flex-col">
            <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-bold">도서관 도우미 꿈틀이</h3>
                <button
                    onClick={onClose}
                    className="text-white text-xl hover:text-gray-200"
                >
                    &times;
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
                {chatHistory.map((chat, index) => (
                    <div key={index} className={`mb-3 ${chat.role === "user" ? "text-right" : ""}`}>
                        <div
                            className={`inline-block px-4 py-2 rounded-lg ${
                                chat.role === "user"
                                    ? "bg-green-500 text-white rounded-br-none"
                                    : "bg-white text-gray-800 rounded-bl-none shadow"
                            }`}
                        >
                            <ReactMarkdown>{chat.parts}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="mb-3">
                        <div className="inline-block px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow">
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
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700"
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default memo(Chat);