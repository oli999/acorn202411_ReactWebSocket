// src/hooks/useWebSocket.ts

import { useEffect, useRef, useState } from "react";

interface WebSocketOptions {
  onOpen?: (e: Event) => void;
  onMessage?: (e: MessageEvent) => void;
  onClose?: (e: CloseEvent) => void;
  onError?: (e: Event) => void;
  reconnectInterval?: number;
  protocols?: string | string[];
}

/*
    useWebSocket() hook 은 string type 과 WebSocketOptions 객체를 전달받는 함수이다
*/
export const useWebSocket = (
  url: string, // 웹소켓접속할 위치정보 "ws://localhost:9000/ws"
  options: WebSocketOptions = {}
) => {
  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectInterval = 3000,   //재 연결 시도 시간 서버끄고 키고..
    protocols
  } = options;

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = () => {
    const ws = new WebSocket(url, protocols);
    socketRef.current = ws;

    ws.onopen = (e) => {
      setConnected(true);
      onOpen?.(e);
    };

    ws.onmessage = (e) => {
      onMessage?.(e);
    };

    ws.onclose = (e) => {
      setConnected(false);
      onClose?.(e);
      reconnectTimer.current = setTimeout(() => {
        connect(); // 재연결 시도
      }, reconnectInterval);
    };

    ws.onerror = (e) => {
      onError?.(e);
    };
  };

  const sendMessage = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
    } else {
      console.warn("WebSocket is not open. Can't send message.");
    }
  };

  useEffect(() => {
    connect();
    return () => {
      reconnectTimer.current && clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };
  }, [url]);

  // useWebSocket() hook 은 object 를 리턴해준다. (아래 3개의 정보가 담겨 있다)
  return {
    sendMessage, //메세지를 전송할때 사용할 함수 
    connected, //서버에 연결되었는지 여부 
    socket: socketRef.current, //연결된 WebSocket 객체 
  };
};