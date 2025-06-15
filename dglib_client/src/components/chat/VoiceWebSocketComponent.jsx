import React, { useState, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@stomp/stompjs';
import { API_SERVER_HOST, API_ENDPOINTS } from '../../api/config';


const sockJsUrl = `${API_SERVER_HOST}${API_ENDPOINTS.chatbot}/voice`;

const VoiceWebSocketComponent = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [serverMessages, setServerMessages] = useState([]);
    const clientRef = useRef({ 
        stompClient: null,
        clientId: uuidv4(),
    });

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
            const destination = `/topic/response/${clientRef.current.clientId}`;
            setIsConnected(true);
            setServerMessages(prev => [...prev, { type: 'info', text: '서버에 성공적으로 연결되었습니다.' }]);

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
            }
        };
    }, []); 

    const sendTestMessage = () => {
        if (!clientRef.current.stompClient || !isConnected) {
            alert("서버에 연결되어 있지 않습니다.");
            return;
        }

        const message = {
            command: 'start',
            clientId: clientRef.current.clientId,
        };


        clientRef.current.stompClient.publish({
            destination: '/app/start',
            body: JSON.stringify(message),
        });

        console.log("🚀 서버로 메시지 전송:", message);
        setServerMessages(prev => [...prev, { type: 'client', data: message }]);
    };
    
    
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
            <h1>WebSocket 통신 테스트 (STOMP)</h1>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button 
                    onClick={sendTestMessage}
                    disabled={!isConnected}
                    style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
                >
                    'start' 메시지 전송
                </button>
                <strong>
                    서버 상태:
                    <span style={{ color: isConnected ? 'green' : 'red', marginLeft: '5px' }}>
                        {isConnected ? '연결됨' : '연결 끊김'}
                    </span>
                </strong>
            </div>
            <div style={{ 
                border: '1px solid #ccc', 
                padding: '15px', 
                minHeight: '300px', 
                backgroundColor: '#f9f9f9',
                borderRadius: '5px',
                overflowY: 'auto',
                maxHeight: '500px'
            }}>
                <h3>통신 기록:</h3>
                {serverMessages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '10px', padding: '5px', borderRadius: '3px',
                        backgroundColor: msg.type === 'server' ? '#e1f5fe' : msg.type === 'client' ? '#e8f5e9' : (msg.type === 'info' ? '#fff9c4' : '#ffebee') }}>
                        {msg.type === 'server' && <span><strong>[서버 응답]:</strong> {JSON.stringify(msg.data)}</span>}
                        {msg.type === 'client' && <span><strong>[클라이언트 요청]:</strong> {JSON.stringify(msg.data)}</span>}
                        {msg.type === 'info' && <span style={{color: '#333'}}><strong>[정보]:</strong> {msg.text}</span>}
                        {msg.type === 'error' && <span style={{color: 'red'}}><strong>[오류]:</strong> {msg.text}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoiceWebSocketComponent;