import { useState, useEffect, useRef, memo, useCallback, useLayoutEffect } from "react";
import ReactMarkdown from 'react-markdown';
import ChatActionComponent from "./ChatActionComponent";
import VoiceWebSocketComponent from "./VoiceWebSocketComponent";
import { getChatbotResponse, resetChatHistory, pushFeedback } from "../../api/chatbotApi";
import { useMutation } from '@tanstack/react-query';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { chatHistoryState, clientIdState, isChatAnimatingState } from '../../atoms/chatState';
import { ThumbsUp, ThumbsDown } from "phosphor-react";

const ChatComponent = ({ onClose }) => {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    const [chatHistory, setChatHistory] = useRecoilState(chatHistoryState);
    const resetChatHistoryState = useResetRecoilState(chatHistoryState);
    const [clientId, setClientId] = useRecoilState(clientIdState);
    const chatEndRef = useRef(null);
    const prevChatLengthRef = useRef(chatHistory.length);
    const inputRef = useRef(null);
    const chatRef = useRef(null);
    const [isChatAnimating, setIsChatAnimating] = useRecoilState(isChatAnimatingState);


    useLayoutEffect(() => {
        if (isChatAnimating) {
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
                chatRef.current?.classList.remove('invisible');
                chatRef.current?.classList.add('visible');
            }, 200);
        } else {
            chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
            chatRef.current?.classList.remove('invisible');
            chatRef.current?.classList.add('visible');
        }
    }, [isChatAnimating]);


    const handleClose = () => {
        setIsChatAnimating(true);
        setTimeout(() => {
            onClose();
        }, 200);
    }

    const chatMutation = useMutation({
        mutationFn: async (param) => {
            const response = await getChatbotResponse(param);
            return response;
        },
        onSuccess: (data) => {
            console.log("챗봇 응답:", data);
            setChatHistory(prev => [...prev, { role: "model", parts: data.parts, service: data.service, to: data.to, entities: data.entities, intent: data.intent, intent_confidence: data.intent_confidence, feedback: null }]);
            setClientId(data.clientId);
        },
        onError: (error) => {
            console.error("챗봇 에러:", error);
            setChatHistory(prev => [...prev, { role: "model", parts: "오늘은 쉽니당. 꿈틀꿈틀🌱", feedback: null}]);
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
            console.log("챗봇 리셋 성공.");
        },
        onError: (error) => {
            console.error("챗봇 리셋 실패:", error);
        }
    });

    const feedbackMutation = useMutation({
        mutationFn: async (feedback) => {
            const response = await pushFeedback(feedback);
            return response;
        },
        onSuccess: (data) => {
            console.log("피드백이 전달되었습니다.:", data);
        },
        onError: (error) => {
            console.error("피드백 전달이 실패했습니다.:", error);
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
    }, [chatHistory.length]);

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

    const handleFeedback = useCallback((feedbackIndex, feedbackType) => {
        const modelResponse = chatHistory[feedbackIndex];
        if (modelResponse.feedback) {
            return;
        }

        const userQuery = (feedbackIndex > 0 && chatHistory[feedbackIndex - 1]?.role === 'user')
            ? chatHistory[feedbackIndex - 1]
            : null;

        console.log("모델 응답:", modelResponse);
        if (userQuery) {
            console.log("이전 사용자 질문:", userQuery.parts);
        } else {
            console.log("이전 사용자 질문을 찾을 수 없습니다.");
        }
        const { service, to, intent, intent_confidence, entities, ...rest } = modelResponse;
        const feedback = {
            ...rest,
            userQuery: userQuery ? userQuery.parts : "",
            feedbackType: feedbackType,
            nlp: {
              intent,
              intent_confidence,
              entities
            }
          };
        feedbackMutation.mutate(feedback);

        const updatedChatHistory = chatHistory.map((chat, index) => {
            if (index === feedbackIndex) {
                return {
                    ...chat,
                    feedback: feedbackType
                };
            }
            return chat;
        });
        setChatHistory(updatedChatHistory);
        
    
    }, [chatHistory, setChatHistory, feedbackMutation]);
    
    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;
    
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.isComposing) {
              if (e.shiftKey) {
                return;
              } else {
                e.preventDefault();
                handleSendMessage(e);
    
              }
            }
          };

        input.addEventListener('keydown', handleKeyDown);

        return () => {
            input.removeEventListener('keydown', handleKeyDown);
        };
    }, [message]);

    

    return (
        <>
        <div className={`fixed bottom-23 sm:bottom-5 sm:left-5 md:left-10 lg:left-20 xl:left-40 
                        w-[calc(109vw-32px)] sm:w-80 md:w-96 lg:w-[500px] 
                        h-[calc(100dvh-130px)] sm:h-[600px] md:h-[650px] lg:h-[600px] 
                        bg-white rounded-lg sm:rounded-xl shadow-xl z-150 overflow-hidden flex flex-col
                        transform transition-all duration-150 ease-in-out ${!isChatAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} origin-bottom-left
                        `}>
            
            <div className="bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
                <h3 className="font-bold text-sm sm:text-base">도서관 도우미 꿈틀이</h3>
                <div className="flex items-center gap-4">
                    <img src="/reset.png" title="초기화" className="w-3.5 h-3.5 sm:w-4 sm:h-4 items-center hover:cursor-pointer select-none" onClick={resetHandler} />
                    <button
                        onClick={handleClose}
                        className="text-white text-xl sm:text-lg hover:text-gray-200 hover:cursor-pointer select-none"
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-gray-100 min-h-0">
                <div ref={chatRef} className="invisible p-2 sm:p-4 w-full h-full overflow-y-auto">
            {chatHistory.map((chat, index) => { 
                    return(
                    <div key={index}>
                        
                        <div className={`flex ${chat.role === "user" || index === 0 ? "mb-3 sm:mb-4" : "mb-1"} ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
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

                        {chat.role === 'model' && index > 0 && (
                            <div className="flex justify-start items-center pl-2 mt-4 mb-4">
                                 <ChatActionComponent chat={chat} />
                            <div className="flex gap-2">
                            {!chat.feedback && (
                                    <>
                                        <ThumbsUp
                                            size={20}
                                            className="text-gray-400 hover:text-green-600 cursor-pointer transition-colors"
                                            onClick={() => handleFeedback(index, 'like')}
                                        />
                                        <ThumbsDown
                                            size={20}
                                            className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                                            onClick={() => handleFeedback(index, 'dislike')}
                                        />
                                    </>
                                )}
                                {chat.feedback === 'like' && (
                                    <ThumbsUp size={20} weight="fill" className="text-green-600" />
                                )}
                                {chat.feedback === 'dislike' && (
                                    <ThumbsDown size={20} weight="fill" className="text-red-600" />
                                )}
                               
                            </div>
                            </div>
                        )}
                                    
                        
                        
                        
                        
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
            </div>
            
            <form onSubmit={handleSendMessage} className="p-2 sm:p-3 bg-white border-t border-gray-200 flex gap-2">
                <textarea
                    value={message}
                    ref={inputRef}
                    onChange={(e) => setMessage(e.target.value)}
                    // onKeyDown={(e) => {
                    //     if (e.key === 'Enter' && !e.shiftKey) {
                    //         e.preventDefault();
                    //         if (message.trim()) handleSendMessage(e);
                    //     }
                    // }}
                    rows="1"
                    style={{ resize: 'none' }}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 border border-gray-400 rounded-lg px-2 sm:px-3 pt-2.5 pb-2 focus:outline-none focus:ring-1 focus:ring-green-500 
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