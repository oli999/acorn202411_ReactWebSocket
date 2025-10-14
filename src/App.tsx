// src/App.tsx

import { useEffect, useRef, useState } from "react"

function App() {

  //WebSocket 객체의 참조값을 보관하기 위한 hook
  const socketRef = useRef<WebSocket|null>(null);

  //서버로 부터 도착한 메세지를 상태값으로 관리 
  const [msgs, setMsgs] = useState<string[]>([]);

  useEffect(()=>{
    //컴포넌트가 활성화 되는 시점에 웹소켓 접속하기
    const socket=new WebSocket("ws://192.168.0.107:9000/ws");
    //생성된 WebSocket 객체의 참조값을 socketRef 에 저장해두기
    socketRef.current = socket;
    socket.onopen = ()=>{};
    socket.onmessage = (event)=>{
      setMsgs(prev =>{
        return [...prev, event.data];
      });
    };

    // useEffect 함수 안에서 리턴한 함수는 컴포넌트가 비활성화 되는 시점에 호출된다.
    return ()=>{
      //소켓 연결 해제 
      socket.close();
    }; 
  }, []);

  // input 요소의 참조값을 관리하기 위한 hook 
  const inputRef = useRef<HTMLInputElement>(null);
  //전송 버튼을 눌렀을때 실행할 함수
  const handleSend = ()=>{
    //입력한 문자열을 읽어와서
    const msg=inputRef.current!.value;
    //WebSocket 객체를 이용해서 전송한다
    socketRef.current!.send(msg);
    //입력창 지우기
    inputRef.current!.value="";
  };
  return <>
    <h1>WebSocket 테스트</h1>
    <input type="text" ref={inputRef}/>
    <button onClick={handleSend}>전송</button>
    <div>
      {msgs.map((item, index) => <div key={index}>{item}</div>)}
    </div>
  </>
}

export default App
