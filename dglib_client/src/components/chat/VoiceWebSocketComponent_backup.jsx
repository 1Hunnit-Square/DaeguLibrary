import React, { useState, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@stomp/stompjs';
import { API_SERVER_HOST, API_ENDPOINTS } from '../../api/config';


const sockJsUrl = `${API_SERVER_HOST}${API_ENDPOINTS.chatbot}/voice`;

const VoiceWebSocketComponent = ({ onClose }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [serverMessages, setServerMessages] = useState([]); 
    const [isRecording, setIsRecording] = useState(false);
    // const [clientId, setClientId] = useRecoilState(clientIdState); 
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const prevSpeakingRef = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);

   
    const clientRef = useRef({ 
        stompClient: null,
        uuid: uuidv4(),
    });

    const audioRef = useRef({
        audioContext: null,
        stream: null,
        workletNode: null,
    });

    const stopRecording = () => {
        if (!isRecording && !audioRef.current.stream) return;
        
        audioRef.current.stream?.getTracks().forEach(track => track.stop());
        audioRef.current.audioContext?.close().catch(e => console.error("AudioContext close error:", e));

        audioRef.current.stream = null;
        audioRef.current.audioContext = null;
        audioRef.current.workletNode = null;
        
        setIsRecording(false);
        console.log("🎤 녹음 중지 및 리소스 정리 완료");
    };

   
    const sendMessage = (type, body = {}) => {
        if (clientRef.current.stompClient?.active) {
            clientRef.current.stompClient.publish({
                destination: '/app/voice',
                body: JSON.stringify({
                    type: type,
                    
                    uuid: clientRef.current.uuid,
                    ...body
                }),
            });
        }
    };

    const startRecordingAndStreaming = async () => {
        if (isRecording) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
            audioRef.current.audioContext = audioContext;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioRef.current.stream = stream;
            
            await audioContext.audioWorklet.addModule('/audio-processor.js');

            const source = audioContext.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(audioContext, 'audio-processor', {
                processorOptions: {
                    sourceSampleRate: audioContext.sampleRate,
                    targetSampleRate: 16000, 
                    bufferSize: 4096, 
                }
            });
            audioRef.current.workletNode = workletNode;

            workletNode.port.onmessage = (event) => {
                if (isProcessing) {
                    return;
                }
                const pcm16Data = new Int16Array(event.data);
                if (pcm16Data.length > 0 && clientRef.current.stompClient?.active) {
                    const base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(pcm16Data.buffer)));
                    sendMessage('audio_chunk', { audioData: base64Data });
                }
            };
            
            source.connect(workletNode).connect(audioContext.destination); 
            
            setIsRecording(true);
            console.log("🎤 원시 오디오 스트림 녹음 및 전송 시작");

        } catch (error) {
            console.error("마이크 또는 오디오 처리 오류:", error);
            alert("마이크 접근 권한이 필요하거나 오디오 컨텍스트 생성에 실패했습니다.");
            handleClose(); 
        }
    };
    
  
    useEffect(() => {
        if (clientRef.current.stompClient) return;
        
        console.log("STOMP 연결 시도...");
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(sockJsUrl),
            // debug: (str) => { console.log(new Date(), str); },
            reconnectDelay: 5000,
        });

        stompClient.onConnect = () => {
            console.log("✅ STOMP 연결 성공!");
            setIsConnected(true);
            
            const destination = `/topic/response/${clientRef.current.uuid}`;
            
            stompClient.subscribe(destination, (message) => {
                const receivedData = JSON.parse(message.body);
                console.log("📩 서버로부터 메시지 수신:", receivedData);
                
              
                if (receivedData.type === 'transcription_result' && receivedData.text) {
                    setServerMessages(prev => [...prev, { type: 'stt', text: receivedData.text }]);
                    setIsProcessing(false);
                    prevSpeakingRef.current = false;
                }
                if (receivedData.type === 'speaking_status') {
                    const newSpeakingState = receivedData.is_speaking;

                    if (newSpeakingState === false && prevSpeakingRef.current === true) {
                        setIsProcessing(true);
                        console.log("일해라 꿈틀아");
                    }

                    setIsUserSpeaking(receivedData.is_speaking);
                    
                    prevSpeakingRef.current = newSpeakingState;
                }

                if (receivedData.type === 'no_speech_detected') {
                    console.log("음성이 감지되지 않았습니다. 녹음을 중지합니다.");
                    setIsUserSpeaking(false);
                    setIsProcessing(false);
                }




               
            });

          
            sendMessage('start_session');
            startRecordingAndStreaming();
        };

        stompClient.onStompError = (frame) => {
            console.error("🔥 STOMP 프로토콜 오류:", frame.headers['message']);
            setIsConnected(false);
        };
        
        clientRef.current.stompClient = stompClient;
        stompClient.activate();

        // 컴포넌트 언마운트 시 정리 함수
        return () => {
            console.log("컴포넌트 언마운트. 정리 작업을 수행합니다.");
            handleClose(true); // isUnmounting 플래그를 true로 전달
        };
    
    }, []); 

    const handleClose = (isUnmounting = false) => {
        stopRecording();
        
        if (clientRef.current.stompClient?.active) {
            console.log("세션 종료 메시지를 전송합니다.");
            sendMessage('end_session');
            
            // 언마운트 시 즉시 비활성화, 사용자 클릭 시 약간의 딜레이 후 비활성화
            setTimeout(() => {
                
                const currentStompClient = clientRef.current.stompClient;
                if (currentStompClient && currentStompClient.active) {
                    console.log("STOMP 연결을 비활성화합니다.");
                    currentStompClient.deactivate();
                }
                clientRef.current.stompClient = null;
            }, isUnmounting ? 0 : 500);
        } else {
            clientRef.current.stompClient = null;
        }
        
        if (!isUnmounting) {
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">음성 대화</h3>
                    <button onClick={() => handleClose(false)} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                <img src={`${isProcessing ? '/gumtle.gif' : '/gumtle1.png'}`} className="w-50 mx-auto" alt="gumtle"/>
                
                <div className="h-20 overflow-y-auto p-2 border rounded-md my-4 bg-gray-50">
                    {serverMessages.map((msg, index) => (
                        <p key={index} className="text-gray-700">{msg.text}</p>
                    ))}
                </div>
                {isConnected ? (
                    <div className="mb-3 mt-10 flex justify-center">
                        <div className="px-3 sm:px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow">
                            <div className="flex items-center space-x-1">
                                <span className="text-sm mr-2">궁금한게 있음면 뭐든 물어봐!</span>
                                <div className={`w-2 h-2 rounded-full bg-green-500 ${isUserSpeaking ? 'animate-bounce' : ''}`}></div>
                                <div className={`w-2 h-2 rounded-full bg-green-500 ${isUserSpeaking ? 'animate-bounce' : ''}`} style={{animationDelay: '0.15s'}}></div>
                                <div className={`w-2 h-2 rounded-full bg-green-500 ${isUserSpeaking ? 'animate-bounce' : ''}`} style={{animationDelay: '0.3s'}}></div>
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