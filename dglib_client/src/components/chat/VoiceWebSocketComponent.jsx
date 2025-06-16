import React, { useState, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@stomp/stompjs';
import { API_SERVER_HOST, API_ENDPOINTS } from '../../api/config';
import { chatHistoryState, clientIdState } from '../../atoms/chatState';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { type } from '@amcharts/amcharts5';


const sockJsUrl = `${API_SERVER_HOST}${API_ENDPOINTS.chatbot}/voice`;

const VoiceWebSocketComponent = ({ onClose }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [serverMessages, setServerMessages] = useState([]);
    const [saying, setSaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [clientId, setClientId] = useRecoilState(clientIdState);
    const clientRef = useRef({ 
        stompClient: null,
        uuid: uuidv4(),
    });
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });
            
            streamRef.current = stream;
            
            mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0 && clientRef.current.stompClient && isConnected) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64Data = reader.result.split(',')[1];
                        
                        const message = {
                            type: 'voice',
                            uuid: clientRef.current.uuid,
                            audioData: base64Data,
                            timestamp: new Date().toISOString()
                        };

                        clientRef.current.stompClient.publish({
                            destination: '/app/voice',
                            body: JSON.stringify(message),
                        });

                        console.log("🎤 음성 데이터 전송");
                    };
                    reader.readAsDataURL(event.data);
                }
            };
            
            mediaRecorderRef.current.start(100);
            setIsRecording(true);
            console.log("🎤 녹음 자동 시작");
            
        } catch (error) {
            console.error("마이크 접근 오류:", error);
            alert("마이크 접근 권한이 필요합니다.");
        }
    };

    useEffect(() => {
        if (clientRef.current.stompClient) return;
        
        console.log("STOMP 연결 시도...");
        setServerMessages([{ type: 'info', text: '서버에 연결을 시도합니다...' }]);

        clientRef.current.stompClient = new Client({
            webSocketFactory: () => new SockJS(sockJsUrl),
            
            debug: (str) => {
                console.log(new Date(), str);
            },
            
            reconnectDelay: 5000,
        });

        clientRef.current.stompClient.onConnect = () => {

            console.log("✅ STOMP 연결 성공!");
            const destination = `/topic/response/${clientRef.current.uuid}`;
            setIsConnected(true);
            setServerMessages(prev => [...prev, { type: 'info', text: '서버에 성공적으로 연결되었습니다.' }]);
            startRecording();
            clientRef.current.stompClient.subscribe(destination, (message) => {
                console.log("📩 서버로부터 메시지 수신:", message.body);
                const receivedData = JSON.parse(message.body);
                setServerMessages(prev => [...prev, { type: 'server', data: receivedData }]);
            });
        };

        clientRef.current.stompClient.onStompError = (frame) => {
            console.error("🔥 STOMP 프로토콜 오류:", frame.headers['message']);
            setIsConnected(false);
            setServerMessages(prev => [...prev, { type: 'error', text: `STOMP 오류: ${frame.headers['message']}` }]);
        };
        
        clientRef.current.stompClient.activate();

        return () => {
            if (clientRef.current.stompClient) {
                console.log("STOMP 연결을 비활성화합니다.");
                clientRef.current.stompClient.deactivate();
                if (mediaRecorderRef.current && isRecording) {
                    mediaRecorderRef.current.stop();
                }
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            }
        };
    }, []); 

    
    
    return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">음성 대화</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
                <img src="/gumtle.gif" className="w-50 mx-auto"/>
                {isConnected ? (
                    <div className="mb-3 mt-10 flex justify-center">
                    <div className="px-3 sm:px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow">
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full bg-green-500 ${saying ? animate-bounce : ""}`}></div>
                            <div className={`w-2 h-2 rounded-full bg-green-500 ${saying ? animate-bounce : ""}`} style={{animationDelay: '0.15s'}}></div>
                            <div className={`w-2 h-2 rounded-full bg-green-500 ${saying ? animate-bounce : ""}`} style={{animationDelay: '0.3s'}}></div>
                        </div>
                    </div>
                </div>
                ) : (
                    <div className="mb-3 mt-10 flex justify-center">
                        <div className="px-3 sm:px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow">
                            <p className="text-sm text-gray-500">서버에 연결 중...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceWebSocketComponent;