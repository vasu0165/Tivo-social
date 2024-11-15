import React, { useState, useEffect } from 'react';
import { database } from '../services/firebase';

const ChatBox = ({ partyId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const messagesRef = database.ref(`parties/${partyId}/messages`);
    messagesRef.on('child_added', snapshot => {
      setMessages(prevMessages => [...prevMessages, snapshot.val()]);
    });

    // Cleanup on unmount
    return () => {
      messagesRef.off();
    };
  }, [partyId]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const messagesRef = database.ref(`parties/${partyId}/messages`);
      const messageData = {
        user: 'User', // Replace with actual user data from Firebase Auth
        message: newMessage,
        timestamp: Date.now(),
      };
      messagesRef.push(messageData);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.user}: </strong>{msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
