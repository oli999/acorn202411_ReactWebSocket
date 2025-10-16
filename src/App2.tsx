// src/App2.tsx

import { useEffect, useRef, useState } from "react"

function App2() {

  //WebSocket 객체의 참조값을 보관하기 위한 hook
  const socketRef = useRef<WebSocket|null>(null);

  //서버로 부터 도착한 메세지를 상태값으로 관리 
  const [msgs, setMsgs] = useState<string[]>([]);

  useEffect(()=>{
    //컴포넌트가 활성화 되는 시점에 웹소켓 접속하기
    const socket=new WebSocket("ws://192.168.0.107:9000/ws2");
    //생성된 WebSocket 객체의 참조값을 socketRef 에 저장해두기
    socketRef.current = socket;
    //접속이 완료 되었을때 실행할 함수 등록
    socket.onopen = ()=>{
      setMsgs(prev=>[...prev, "웹소켓 접속이 되었습니다"]);
    };
    // 웹소켓으로 새로운 메세지가 도착했을때 실행할 함수 등록
    socket.onmessage = (event)=>{
      // event 는 object 인데 event.data 에는 도착한 메세지(문자열)이 들어 있다.
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
    // object 에 전송할 정보를 담는다
    const obj={
        path:"/chat/send",
        data:{
            text:msg
        }
    };
    //WebSocket 객체를 이용해서 object 에 담긴 내용을 json 문자열로 변경해서 전송한다.
    socketRef.current!.send(JSON.stringify(obj));
    //입력창 지우기
    inputRef.current!.value="";
  };

   const divStyle={
    height:"300px",
    width:"500px",
    backgroundColor:"#cecece",
    padding:"10px",
    overflowY:"auto",
    scrollBehavior:"smooth"
  };
  // style={} 에 적용할 객체의 type 은 React.CSSProperties 이다 
  const bubbleStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "8px 12px",
    marginBottom: "8px",
    display: "inline-block",
    maxWidth: "80%",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
  };

  const divRef=useRef<HTMLDivElement>(null);
  //자동 스크롤
  useEffect(()=>{
    divRef.current!.scrollTop = divRef.current!.scrollHeight;
  }, [msgs]);

  return <>
    <h1>WebSocket 테스트2</h1>
    <input type="text" ref={inputRef}/>
    <button onClick={handleSend}>전송</button>
    <div style={divStyle} ref={divRef}>
      {msgs.map((item, index) => 
        <div key={index}>
          <div style={bubbleStyle} >{item}</div>
        </div>
      )}
    </div>
  </>
}

export default App2
