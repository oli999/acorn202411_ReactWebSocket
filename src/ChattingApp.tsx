// src/ChattingApp.tsx

import { useReducer, useRef, useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
// uuid 에서 v4 를 import 해서 uuid 라는 이름으로 사용하기 (메세지의 id 값으로 사용할 문자열을 얻어내는 함수)
import { v4 as uuid} from 'uuid';

// 대화 메세지 객체의 type 을 미리 정의하기
interface Message{
    id:string;
    content:string; //내용
    sender?:string; //user 가 보낸거라면 누가 보냈는지 
}

function ChattingApp() {
    //메세지 목록
    const [msgs, setMsgs] = useState<Message[]>([]);
    //대화방에 입장한 userName 도 상태값으로 관리
    const [userName, setUserName] = useState<string>();
    //대화방에 참여한 참여자 목록
    const [userList, setUserList] = useState<string[]>([]);

    // useWebSocket() hook 을 이용해서 웹소켓 연결하기
    const {sendMessage, connected} = useWebSocket("ws://192.168.0.107:9000/ws2", {
        onMessage:(event)=>{
            console.log(event);
            //event.data 에는 json 문자열이 들어 있다.
            const received = JSON.parse(event.data);
            if(received.type === "enter"){ //만일 어떤 사용자가 입장 했으면
                //입장한 userName
                const name = received.payload.userName;
                
                setIsEnter(true);
                
                //메세지 업데이트
                setMsgs(prev => {
                    const msg = name+" 님이 입장했습니다.";
                    return [...prev, {id:uuid(), content:msg}];
                });
                //참여자 목록 업데이트
                setUserList(received.payload.userList);
            }
        }
    });
    // 대화방에 입장했는지 여부
    const [isEnter, setIsEnter] = useState<boolean>(false);
    // userName input 요소의 참조값
    const inputUserRef = useRef<HTMLInputElement>(null);
    // 입장 버튼을 눌렀을때 실행할 함수
    const handleEnter = ()=>{
        //서버에 전송할 내용 구성
        const obj={
            path:"/chat/enter",
            data:{
                userName:inputUserRef.current!.value //입력한 대화명(로그인된 userName)
            }
        };
        //전송하기
        sendMessage(JSON.stringify(obj));
        //userName 을 상태값으로 넣어주기
        setUserName(inputUserRef.current!.value);
    };
    return <div className="container">
        <h1>WebSocket 테스트3</h1>
        <h2>WebSocket {connected ? "✅ 연결됨" : "❌ 끊김"} </h2>
        { isEnter ? 
            <div className="row">
                <div className="col-8">
                    <div>
                        {msgs.map(item=>(
                            <div key={item.id}>{item.content}</div>
                        ))}
                    </div>
                </div>
                <div className="col-4">
                    <h4>참여자 목록</h4>
                    <ul>
                        {userList.map((item, index)=>(
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div> 
            : 
            <>
                <input ref={inputUserRef} type="text" placeholder="userName 입력..."/>
                <button onClick={handleEnter}>입장</button>
            </>
        }
    </div>
   
}

export default ChattingApp;