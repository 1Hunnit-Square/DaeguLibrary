import { useState, useEffect, useRef, memo } from "react";
import ReactMarkdown from 'react-markdown';

const ChatComponent = ({ onClose, chatHistory, addMessage, resetChat }) => {
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
        <div className="fixed bottom-5 right-40 w-80 md:w-160 h-[700px] bg-white rounded-xl shadow-xl z-999 overflow-hidden flex flex-col">
            <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-bold">도서관 도우미 꿈틀이</h3>
                <div className="flex items-center gap-2">
                    <img src="/reset.png" title="초기화"  className="w-4 h-4 hover:cursor-pointer mt-1.5" onClick={resetChat} />
                    <button
                        onClick={onClose}
                        className="text-white text-xl hover:text-gray-200 hover:cursor-pointer"
                    >
                        &times;
                    </button>
            </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
                {chatHistory.map((chat, index) => (
                    <div key={index}
                    className={`mb-5 flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[90%] px-4 py-2 rounded-lg ${
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
                                            ? <code className="bg-opacity-25 bg-black text-white px-1 rounded text-sm break-words" {...props}>{children}</code>
                                            : <div className="bg-gray-800 text-white bg-opacity-10 p-2 rounded-md overflow-x-auto">
                                                <code className="text-sm break-words whitespace-pre-wrap">{children}</code>
                                            </div>
                                    },
                                    pre: ({children}) => <pre className="overflow-x-auto max-w-full">{children}</pre>
                                }}
                            >
                                {chat.parts}
                            </ReactMarkdown>
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
                    className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 min-h-[40px] max-h-[120px] overflow-y-auto
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-thumb]:bg-gray-400
                    [&::-webkit-scrollbar-thumb]:rounded-md
                    [&::-webkit-scrollbar-track]:bg-transparent"
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

export default memo(ChatComponent);