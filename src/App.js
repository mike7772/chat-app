import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://chat.com");
// const socket = io("http://localhost:5000");


export default function ChatComponent() {
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [chat, setChat] = useState([]);
  const [error, setError] = useState(false);
  const [errormsg, setErrorMsg] = useState("");

  const sendMessage = () => {
    if (room === "" || name === "") {
      setError(true);
      setErrorMsg("Please join a room first!")
    } else {
      socket.emit("send_message", { message, room, name });
      setMessage(""); // Clear the input after sending
    }
  };

  const joinRoom = () => {
    if (room !== "" && name !== "") {
      socket.emit("join_room", {room, name});
      setError(false);
    } else {
      setErrorMsg("room and name must not be empty!")
      setError(true);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
  
      setChat((prev) => {
        // Check if the message with the same id already exists
        const messageExists = prev.some((msg) => msg.id === data.id);
  
        // If the message with the same id exists, do not add it again
        if (!messageExists) {
          return [
            ...prev,
            { text: data.message, fromSelf: data.name === name, id: data.id },
          ];
        }
  
        // Return the previous state if the message already exists
        return prev;
      });
    });
  
    // Clean up the socket listener on component unmount
    return () => {
      socket.off("receive_message");
    };
  }, [name]);
  

  return (
    <div className=" lg:w-[60%] w-[100%] flex flex-col h-screen bg-gray-100 p-4 lg:ml-[20%] ml-0 mt-2">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="border rounded p-2 mr-2"
          required
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-2 mr-2"
          required
        />
        <button
          onClick={joinRoom}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Join Room
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{errormsg}</p>}
      <div className="flex-grow overflow-y-auto mb-4 bg-white rounded shadow p-4">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              msg.fromSelf
                ? "bg-blue-100 text-blue-800 ml-auto"
                : "bg-gray-100 text-gray-800"
            } max-w-xs`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow border rounded-l p-2"
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
}
