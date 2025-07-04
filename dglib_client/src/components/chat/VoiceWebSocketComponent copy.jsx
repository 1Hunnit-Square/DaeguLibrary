import React, { useState, useRef, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@stomp/stompjs';
import { API_SERVER_HOST, API_ENDPOINTS } from '../../api/config';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { chatHistoryState, isChatOpenState, clientIdState } from '../../atoms/chatState';
import { getCookie } from '../../util/cookieUtil';
import { checkaccess } from '../../api/chatbotApi';
import { has } from 'lodash';

const sockJsUrl = `${API_SERVER_HOST}${API_ENDPOINTS.chatbot}/voice`;

const VoiceWebSocketComponent = ({ onClose }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [IsNotconnected, setIsNotconnected] = useState(false);
    const [clientId, setClientId] = useRecoilState(clientIdState); 
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [isGumtleSpeaking, setIsGumtleSpeaking] = useState(false);
    const prevSpeakingRef = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
    const [chatHistory, setChatHistory] = useRecoilState(chatHistoryState);
    const microphoneTimeoutRef = useRef(null);
    const hasplayedErrorSoundRef = useRef(false);
    const selfclosed = useRef(false);
    
    const isProcessingRef = useRef(false);
    const clientRef = useRef({ 
        stompClient: null,
        uuid: uuidv4(),
    });



    const audioRef = useRef({
        audioContext: null,
        stream: null,
        workletNode: null,
    });

    const responseAudioRef = useRef(null);

    const playErrorSound = () => {
        
        const errorAudio = new Audio('/error.wav');
        responseAudioRef.current = errorAudio;
        errorAudio.onended = () => {
            console.log("에러 사운드 재생 완료");
            setIsProcessing(false);
            isProcessingRef.current = false;
            setIsGumtleSpeaking(false);
        }; 
        errorAudio.onerror = (error) => {
            console.error("에러 사운드 재생 오류:", error);
            setIsProcessing(false);
            isProcessingRef.current = false;
            setIsGumtleSpeaking(false);
        };

        console.log("에러 사운드 재생 시작");
        setIsGumtleSpeaking(true);
        errorAudio.play().catch(error => {
            console.error("에러 사운드 재생 실패:", error);
            setIsProcessing(false);
            isProcessingRef.current = false;
            setIsGumtleSpeaking(false);
        });
    };

    const playAudioFromBase64 = (base64Data) => {
        try {
            
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            
            const blob = new Blob([bytes], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(blob);

            
            const audio = new Audio(audioUrl);
            responseAudioRef.current = audio;

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl); 
                console.log("오디오 재생 완료");
                setIsProcessing(false);
                isProcessingRef.current = false;
                setIsGumtleSpeaking(false);
            };

            audio.onerror = (error) => {
                console.error("오디오 재생 오류:", error);
                URL.revokeObjectURL(audioUrl);
                setIsProcessing(false);
                isProcessingRef.current = false;
                setIsGumtleSpeaking(false);
            };

            console.log("TTS 오디오 재생 시작");
            setIsGumtleSpeaking(true);
            audio.play().catch(error => {
                console.error("오디오 재생 실패:", error);
                URL.revokeObjectURL(audioUrl);
                setIsProcessing(false);
                isProcessingRef.current = false;
                setIsGumtleSpeaking(false);
            });

        } catch (error) {
            console.error("base64 오디오 변환 오류:", error);
            setIsProcessing(false);
            isProcessingRef.current = false;
        }
    };

     const addMessage = useCallback((message) => {
            setChatHistory(prev => [...prev, {
                role: "user",
                parts: message,
                clientId: clientId
            }]);
        }, [clientId, setChatHistory]);

    const stopRecording = () => {
        if (!isRecording && !audioRef.current.stream) return;
        
        audioRef.current.stream?.getTracks().forEach(track => track.stop());
        audioRef.current.audioContext?.close().catch(e => console.error("AudioContext close error:", e));

        audioRef.current.stream = null;
        audioRef.current.audioContext = null;
        audioRef.current.workletNode = null;

        if (microphoneTimeoutRef.current) {
            clearTimeout(microphoneTimeoutRef.current);
            microphoneTimeoutRef.current = null;
        }
        
        setIsRecording(false);
        setIsMicrophoneActive(false);
        console.log("녹음 중지 및 리소스 정리 완료");
    };

   
    const sendMessage = (type, body = {}) => {
        try {
            if (clientRef.current.stompClient?.active) {
                const memberInfo = getCookie("auth");
                const accessToken = memberInfo?.accessToken || '';
                clientRef.current.stompClient.publish({
                    destination: '/app/voice',
                    headers: type === 'start_session' ? { 'Authorization': `Bearer ${accessToken}` } : {},
                    body: JSON.stringify({
                        type: type,
                        clientId: clientId,
                        uuid: clientRef.current.uuid,
                        ...body
                    }),
                });
            }
        } catch (error) {
            console.error(`${type} 메시지 전송 실패:`, error);
        }
    };

    const startRecordingAndStreaming = async () => {
        if (isRecording || isProcessingRef.current) return;

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
                if (isProcessingRef.current) {
                    return;
                }
                const pcm16Data = new Int16Array(event.data);
                if (pcm16Data.length > 0 && clientRef.current.stompClient?.active) {
                    const base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(pcm16Data.buffer)));
                    const sum = pcm16Data.reduce((acc, val) => acc + Math.abs(val), 0);
                    const average = sum / pcm16Data.length;
                    const threshold = 1000; 
                    if (average > threshold) {
                        if (!isProcessingRef.current) {
                            setIsMicrophoneActive(true);
                        }

                       
                       
                        if (microphoneTimeoutRef.current) {
                            clearTimeout(microphoneTimeoutRef.current);
                            microphoneTimeoutRef.current = null;
                        }
                    } else {
                        
                        if (!microphoneTimeoutRef.current) {
                            microphoneTimeoutRef.current = setTimeout(() => {
                                setIsMicrophoneActive(false);
                                microphoneTimeoutRef.current = null;
                            }, 1500); 
                        }
                    }
                    sendMessage('audio_chunk', { audioData: base64Data });
                }
            };
            
            source.connect(workletNode).connect(audioContext.destination); 
            
            setIsRecording(true);
            console.log("오디오 스트림 녹음 및 전송 시작");

        } catch (error) {
            console.error("마이크 또는 오디오 처리 오류:", error);
            alert("마이크 접근 권한이 필요하거나 오디오 컨텍스트 생성에 실패했습니다.");
            handleClose(); 
        }
    };
    
  
    useEffect(() => {
        if (clientRef.current.stompClient) return;

       

        const handleBeforeUnload = () => {
            
            if (clientRef.current.stompClient?.active) {
                sendMessage('end_session');
                
                const start = Date.now();
                while (Date.now() - start < 100) {
                   
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        console.log("STOMP 연결 시도...");

      
        checkaccess()
         
      
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(sockJsUrl),
            // debug: (str) => { console.log(new Date(), str); },
            reconnectDelay: 5000,
        });

        stompClient.onConnect = () => {
            console.log("STOMP 연결 성공!");
            setIsConnected(true);
            
            const destination = `/topic/response/${clientRef.current.uuid}`;
            
            stompClient.subscribe(destination, (message) => {
                const receivedData = JSON.parse(message.body);
                console.log("서버로부터 메시지 수신:", receivedData);
                
              
               
                if (receivedData.type === 'speaking_status') {
                    const newSpeakingState = receivedData.is_speaking;

                    if (newSpeakingState === false && prevSpeakingRef.current === true) {
                        setIsProcessing(true);
                        isProcessingRef.current = true;
                        console.log("일해라 꿈틀아");
                    }

                    setIsUserSpeaking(receivedData.is_speaking);
                    
                    prevSpeakingRef.current = newSpeakingState;
                }

                if (receivedData.type === 'no_speech_detected') {
                    console.log("음성이 감지되지 않았습니다. 녹음을 중지합니다.");
                    setIsUserSpeaking(false);
                    setIsProcessing(false);
                    isProcessingRef.current = false;
                }

            

                if (receivedData.type === 'chatbot_response') {
                    
                    if (receivedData.audio_data) {
                        console.log("TTS 오디오 재생 중...");
                        playAudioFromBase64(receivedData.audio_data,);
                    }
                    setChatHistory(prev => [...prev, {
                        role: "user",
                        parts: receivedData.request_text,
                        clientId: clientId
                    }]);
                    setChatHistory(prev => [...prev, {
                        role: "model",
                        parts: receivedData.text,
                        service: receivedData.service,
                        to: receivedData.to
                    }]);
                setClientId(receivedData.clientId || clientId);
                    
                }

                if (receivedData.type === 'tts_error') {
                    playErrorSound();
                   
                }
                
               


               
            });

          
            sendMessage('start_session');
            startRecordingAndStreaming();
        };

        stompClient.onStompError = (frame) => {
            console.error("🔥 STOMP 프로토콜 오류:", frame.headers['message']);
            setIsConnected(false);
            playErrorSound();
        };

        stompClient.onWebSocketError = (error) => {
            console.error("🔥 WebSocket 연결 오류:", error);
            setIsConnected(false);
            playErrorSound();
        };

        stompClient.onWebSocketClose = (event) => {
            console.error("🔥 WebSocket 연결 종료:", event);
            setIsConnected(false);
            if (!hasplayedErrorSoundRef.current && !selfclosed.current) {
                hasplayedErrorSoundRef.current = true;
                setIsNotconnected(true);
                playErrorSound();
            }
           
        };



        
        
        clientRef.current.stompClient = stompClient;
        stompClient.activate();

        
        return () => {
            console.log("컴포넌트 언마운트.");
            window.removeEventListener('beforeunload', handleBeforeUnload);
           
            handleClose(true); 
        };
    
    }, []); 

    const handleClose = (isUnmounting = false) => {
        selfclosed.current = true;
        try {
            stopRecording();
            if (responseAudioRef.current) {
                responseAudioRef.current.pause();
                responseAudioRef.current = null;
            }
            
            if (clientRef.current.stompClient?.active) {
                console.log("세션 종료 메시지를 전송합니다.");
                try {
                    sendMessage('end_session'); 
                } catch (error) {
                    console.error("세션 종료 메시지 전송 실패:", error);
                    
                }
                
                setTimeout(() => {
                    try {
                        const currentStompClient = clientRef.current.stompClient;
                        if (currentStompClient && currentStompClient.active) {
                            console.log("STOMP 연결을 비활성화합니다.");
                            currentStompClient.deactivate();
                        }
                    } catch (error) {
                        console.error("STOMP 연결 비활성화 실패:", error);
                    }
                    clientRef.current.stompClient = null;
                }, isUnmounting ? 0 : 500);
            } else {
                clientRef.current.stompClient = null;
            }
        } catch (error) {
            console.error("handleClose 중 오류 발생:", error);
            clientRef.current.stompClient = null;
        } finally {
            
            if (!isUnmounting) {
                onClose();
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
            <div className="bg-[#fdfcfb] rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">음성 대화</h3>
                    <button onClick={() => handleClose(false)} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                <img src={`${ isGumtleSpeaking ? '/gumtle_talking.gif' : isProcessingRef.current ? '/gumtle_walking.gif' :  (isMicrophoneActive || isUserSpeaking) ?  "/gumtle_hearing.gif" : '/gumtle_standing.jpg'}`} className="w-50 mx-auto" alt="gumtle"/>
                
            
                {isConnected && isRecording ? (
                    <div className="mb-3 mt-10 flex justify-center">
                        <div className="px-3 sm:px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow">
                            <div className="flex items-center space-x-1">
                                <div className={`w-4 h-4 rounded-full bg-green-500 ${isMicrophoneActive || isUserSpeaking ? 'animate-bounce' : ''}`}></div>
                                <div className={`w-4 h-4 rounded-full bg-green-500 ${isMicrophoneActive || isUserSpeaking ? 'animate-bounce' : ''}`} style={{animationDelay: '0.15s'}}></div>
                                <div className={`w-4 h-4     rounded-full bg-green-500 ${isMicrophoneActive || isUserSpeaking ? 'animate-bounce' : ''}`} style={{animationDelay: '0.3s'}}></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-3 mt-10 flex justify-center">
                        <div className="px-3 sm:px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow">
                            {IsNotconnected ? (
                                <p className="text-sm text-red-500">연결이 끊어졌습니다. 다시 시도해주세요.</p>
                            ) : (
                                <p className="text-sm text-gray-500">연결 중...</p>
                            )} 
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceWebSocketComponent;