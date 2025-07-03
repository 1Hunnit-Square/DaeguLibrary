import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { API_ENDPOINTS } from '../../api/config';
import { useRecoilState } from 'recoil';
import { chatHistoryState, clientIdState } from '../../atoms/chatState';
import { getCookie } from '../../util/cookieUtil';

const voiceWsUrl = `wss://${window.location.host}${API_ENDPOINTS.chatbot}/voice`;
const MESSAGE_TYPE_AUDIO_CHUNK = 1;

const VoiceWebSocketComponent = ({ onClose }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [IsNotconnected, setIsNotconnected] = useState(false);
    const [clientId, setClientId] = useRecoilState(clientIdState);
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [isGumtleSpeaking, setIsGumtleSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
    const [chatHistory, setChatHistory] = useRecoilState(chatHistoryState);
    const prevSpeakingRef = useRef(false);
    const microphoneTimeoutRef = useRef(null);
    const hasplayedErrorSoundRef = useRef(false);
    const selfclosed = useRef(false);
    const isProcessingRef = useRef(false);
    const wsRef = useRef(null);
    const uuidRef = useRef(uuidv4());
    const audioRef = useRef({ audioContext: null, stream: null, workletNode: null });
    const responseAudioRef = useRef(null);
    const [isMicEnabled, setIsMicEnabled] = useState(true);

    const playErrorSound = () => {
        const errorAudio = new Audio('/error.wav');
        responseAudioRef.current = errorAudio;
        errorAudio.onended = () => { setIsProcessing(false); isProcessingRef.current = false; setIsGumtleSpeaking(false); };
        errorAudio.onerror = () => { setIsProcessing(false); isProcessingRef.current = false; setIsGumtleSpeaking(false); };
        setIsGumtleSpeaking(true);
        errorAudio.play().catch(() => { setIsProcessing(false); isProcessingRef.current = false; setIsGumtleSpeaking(false); });
    };

    const playAudioFromBlob = (audioBlob) => {
        try {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            responseAudioRef.current = audio;
            audio.onended = () => { URL.revokeObjectURL(audioUrl); setIsProcessing(false); isProcessingRef.current = false; setIsGumtleSpeaking(false); };
            audio.onerror = () => { URL.revokeObjectURL(audioUrl); setIsProcessing(false); isProcessingRef.current = false; setIsGumtleSpeaking(false); };
            setIsGumtleSpeaking(true);
            audio.play().catch(() => { URL.revokeObjectURL(audioUrl); setIsProcessing(false); isProcessingRef.current = false; setIsGumtleSpeaking(false); });
        } catch (error) {
            console.error("오디오 Blob 재생 오류:", error);
            setIsProcessing(false); isProcessingRef.current = false;
        }
    };

    const stopRecording = () => {
        audioRef.current.stream?.getTracks().forEach(track => track.stop());
        audioRef.current.audioContext?.close().catch(e => console.error("AudioContext close error:", e));
        audioRef.current = { audioContext: null, stream: null, workletNode: null };
        if (microphoneTimeoutRef.current) clearTimeout(microphoneTimeoutRef.current);
        setIsRecording(false);
        setIsMicrophoneActive(false);
    };

    const sendTextMessage = (type, body = {}) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        const messagePayload = { type, uuid: uuidRef.current, clientId, ...body };
        if (type === 'start_session') {
            const memberInfo = getCookie("auth");
            if (memberInfo?.accessToken) messagePayload.token = memberInfo.accessToken;
        }
        wsRef.current.send(JSON.stringify(messagePayload));
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
                processorOptions: { sourceSampleRate: audioContext.sampleRate, targetSampleRate: 16000, bufferSize: 4096 }
            });
            audioRef.current.workletNode = workletNode;
            workletNode.port.onmessage = (event) => {
                if (isProcessingRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return;
                const pcm16Data = new Int16Array(event.data);
                if (pcm16Data.length > 0) {
                    const buffer = new ArrayBuffer(1 + pcm16Data.byteLength);
                    const view = new Uint8Array(buffer);
                    view[0] = MESSAGE_TYPE_AUDIO_CHUNK;
                    view.set(new Uint8Array(pcm16Data.buffer), 1);
                    wsRef.current.send(buffer);
                }
                const sum = pcm16Data.reduce((acc, val) => acc + Math.abs(val), 0);
                if (sum / pcm16Data.length > 1000) {
                    if (!isProcessingRef.current) setIsMicrophoneActive(true);
                    if (microphoneTimeoutRef.current) clearTimeout(microphoneTimeoutRef.current);
                    microphoneTimeoutRef.current = null;
                } else {
                    if (!microphoneTimeoutRef.current) {
                        microphoneTimeoutRef.current = setTimeout(() => { setIsMicrophoneActive(false); microphoneTimeoutRef.current = null; }, 1500);
                    }
                }
            };
            source.connect(workletNode).connect(audioContext.destination);
            setIsRecording(true);
        } catch (error) {
            alert("마이크 접근 권한이 필요하거나 오디오 장치에 문제가 있습니다.");
            handleClose();
        }
    };


    const toggleMicrophone = () => {
        setIsMicEnabled(prev => {
            const newState = !prev;
            
            if (audioRef.current.stream) {
                audioRef.current.stream.getAudioTracks().forEach(track => {
                    track.enabled = newState;
                });
            }
            
            if (!newState) {
                setIsMicrophoneActive(false);
                setIsUserSpeaking(false);
                if (microphoneTimeoutRef.current) {
                    clearTimeout(microphoneTimeoutRef.current);
                    microphoneTimeoutRef.current = null;
                }
            }
            
            return newState;
        });
    };

    useEffect(() => {
        if (wsRef.current) return;
        const ws = new WebSocket(voiceWsUrl);
        wsRef.current = ws;
        ws.binaryType = 'arraybuffer';
        
        let receiveBuffer = new Uint8Array(0);

        const processBuffer = () => {
            while (true) {
                // 최소 8바이트 필요 (JSON 길이 + 오디오 길이)
                if (receiveBuffer.length < 8) return;
                
                const dataView = new DataView(receiveBuffer.buffer, receiveBuffer.byteOffset, 8);
                const jsonLen = dataView.getUint32(0, false);    // JSON 길이
                const audioLen = dataView.getUint32(4, false);   // 오디오 길이
                
                console.log(`패킷 정보 - JSON 길이: ${jsonLen}, 오디오 길이: ${audioLen}`);
                
                const totalPacketSize = 8 + jsonLen + audioLen;
                
                // 전체 패킷이 도착했는지 확인
                if (receiveBuffer.length < totalPacketSize) {
                    console.log(`패킷 대기 중 - 필요: ${totalPacketSize}, 현재: ${receiveBuffer.length}`);
                    return;
                }
                
                // JSON 데이터 추출
                const jsonBytes = receiveBuffer.subarray(8, 8 + jsonLen);
                let receivedData;
                try {
                    const jsonString = new TextDecoder().decode(jsonBytes);
                    receivedData = JSON.parse(jsonString);
                    console.log('수신된 JSON:', receivedData);
                } catch (e) {
                    console.error("JSON 파싱 오류:", e);
                    receiveBuffer = new Uint8Array(0); // 버퍼 비우기
                    return;
                }
        
                // 오디오 데이터 추출
                let audioBytes = new Uint8Array(0);
                if (audioLen > 0) {
                    audioBytes = receiveBuffer.subarray(8 + jsonLen, 8 + jsonLen + audioLen);
                    console.log(`오디오 데이터 추출 완료: ${audioBytes.length} bytes`);
                }
                
                // 메시지 처리
                handleReceivedMessage(receivedData, audioBytes);
                
                // 처리된 패킷을 버퍼에서 제거
                receiveBuffer = receiveBuffer.subarray(totalPacketSize);
                console.log(`패킷 처리 완료. 남은 버퍼: ${receiveBuffer.length} bytes`);
            }
        };

        const handleReceivedMessage = (data, audio) => {
            console.log("메시지 처리 시작:", data.type);
            switch (data.type) {
                case 'chatbot_response':
                    console.log(`오디오 데이터: ${audio.length} bytes`);
                    if (audio.length > 0) {
                        playAudioFromBlob(new Blob([audio], { type: 'audio/wav' }));
                    }
                    setChatHistory(prev => [...prev, { role: "user", parts: data.request_text, clientId: clientId }]);
                    setChatHistory(prev => [...prev, { role: "model", parts: data.text, service: data.service, to: data.to }]);
                    setClientId(data.clientId || clientId);
                    break;
                case 'speaking_status':
                    setIsUserSpeaking(data.is_speaking);
                    if (data.is_speaking === false && prevSpeakingRef.current === true) {
                        setIsProcessing(true); 
                        isProcessingRef.current = true;
                    }
                    prevSpeakingRef.current = data.is_speaking;
                    break;
                case 'no_speech_detected':
                    setIsUserSpeaking(false); 
                    setIsProcessing(false); 
                    isProcessingRef.current = false;
                    break;
                case 'no_chatbot_response':
                    setIsProcessing(false); 
                    isProcessingRef.current = false;
                    break;
                case 'error':
                case 'tts_error':
                    playErrorSound();
                    break;
                default:
                    console.warn("알 수 없는 메시지 타입:", data.type);
            }
        };

        ws.onmessage = (event) => {
            const newChunk = new Uint8Array(event.data);
            console.log(`새 데이터 수신: ${newChunk.length} bytes`);
            
            const mergedBuffer = new Uint8Array(receiveBuffer.length + newChunk.length);
            mergedBuffer.set(receiveBuffer);
            mergedBuffer.set(newChunk, receiveBuffer.length);
            receiveBuffer = mergedBuffer;
            
            console.log(`총 버퍼 크기: ${receiveBuffer.length} bytes`);
            processBuffer();
        };

        ws.onopen = () => {
            console.log("WebSocket 연결 성공! 세션 시작 메시지를 전송합니다.");
            setIsConnected(true);
            sendTextMessage('start_session');
            startRecordingAndStreaming();
        };

        ws.onerror = (error) => {
            console.error("WebSocket 연결 오류:", error);
            setIsConnected(false);
            if (!hasplayedErrorSoundRef.current && !selfclosed.current) playErrorSound();
        };

        ws.onclose = (event) => {
            console.log("WebSocket 연결 종료:", event);
            setIsConnected(false);
            if (!hasplayedErrorSoundRef.current && !selfclosed.current) {
                hasplayedErrorSoundRef.current = true;
                setIsNotconnected(true);
                playErrorSound();
            }
        };

        return () => handleClose(true);
    }, []);

    const handleClose = (isUnmounting = false) => {
        selfclosed.current = true;
        stopRecording();
        if (responseAudioRef.current) {
            responseAudioRef.current.pause();
            responseAudioRef.current = null;
        }
        if (wsRef.current) {
            if (wsRef.current.readyState === WebSocket.OPEN) sendTextMessage('end_session');
            setTimeout(() => { wsRef.current?.close(); wsRef.current = null; }, isUnmounting ? 0 : 200);
        }
        if (!isUnmounting) onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
            <div className="bg-[#fdfcfb] rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">음성 대화</h3>
                    <button onClick={() => handleClose(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <img src={`${ isGumtleSpeaking ? '/gumtle_talking.gif' : isProcessingRef.current ? '/gumtle_walking.gif' : (isMicrophoneActive || isUserSpeaking) ? "/gumtle_hearing.gif" : '/gumtle_standing.jpg'}`} className="w-50 mx-auto" alt="gumtle"/>
                <div className="flex justify-center mt-4 mb-2">
                    <button
                        onClick={toggleMicrophone}
                        className={`p-3 rounded-full transition-colors duration-200 ${
                            !isConnected || !isRecording 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : isMicEnabled 
                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                        disabled={!isConnected || !isRecording}
                    >
                        {isMicEnabled ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.75a3.25 3.25 0 013.25 3.25v6a3.25 3.25 0 01-6.5 0v-6A3.25 3.25 0 0112 1.75z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10.75v.5a7 7 0 0014 0v-.5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.75V21" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15" />
                            </svg>
                        )}
                    </button>
                </div>
                
                
                {isConnected && isRecording ? (
                    <div className="mb-3 mt-10 flex justify-center items-center min-h-[36px]">
                        <div className="px-3 sm:px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow">
                            <div className="flex items-center space-x-1">
                                <div className={`w-4 h-4 rounded-full bg-green-500 ${isMicrophoneActive || isUserSpeaking ? 'animate-bounce' : ''}`}></div>
                                <div className={`w-4 h-4 rounded-full bg-green-500 ${isMicrophoneActive || isUserSpeaking ? 'animate-bounce' : ''}`} style={{animationDelay: '0.15s'}}></div>
                                <div className={`w-4 h-4 rounded-full bg-green-500 ${isMicrophoneActive || isUserSpeaking ? 'animate-bounce' : ''}`} style={{animationDelay: '0.3s'}}></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-3 mt-10 flex justify-center">
                        <div className="px-3 sm:px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow">
                            {IsNotconnected ? (<p className="text-sm text-red-500">연결이 끊어졌습니다. 다시 시도해주세요.</p>) : (<p className="text-sm text-gray-500">연결 중...</p>)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceWebSocketComponent;