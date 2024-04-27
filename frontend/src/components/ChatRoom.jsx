"use client"

import React, { useEffect, useState } from 'react';
import { socket } from '@/utils/socket';
import styles from './ChatRoom.module.css';

const ChatRoom = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isSettingUserName, setIsSettingUserName] = useState(true);

    useEffect(() => {
        socket.on('user connected', (connectedUser) => {
            setOnlineUsers((users) => [...users, connectedUser]);
        });

        socket.on('message received', (newMessageReceived) => {
            setMessages((messages) => [...messages, newMessageReceived]);
        });

        socket.on('online users', (onlineUsers) => {
            setOnlineUsers(onlineUsers);
        });

        return () => {
            socket.off('user connected');
            socket.off('message received');
            socket.off('online users');
        };
    }, []);

    const sendMessage = () => {
        if (newMessage.trim() === '') return;

        const messageData = {
            sender: userName,
            content: newMessage,
        };

        socket.emit('new message', messageData);
        setNewMessage('');
    };

    const handleUserNameSubmit = (e) => {
        e.preventDefault();
        if (userName.trim() === '') return;
        setIsSettingUserName(false);
        socket.emit('setup', userName);
    };

    return (
        <div className={styles.container}>
            {isSettingUserName ? (
                <div className={styles.userNameContainer}>
                    <h2>Enter your name:</h2>
                    <form onSubmit={handleUserNameSubmit}>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Your name..."
                            className={styles.userNameInput}
                        />
                        <button type="submit" className={styles.userNameButton}>
                            Enter
                        </button>
                    </form>
                </div>
            ) : (
                <>
                    <div className={styles.chatHeader}>
                        <h2>Chat Room</h2>
                        <div className={styles.onlineUsers}>
                            <h3>Online Users:</h3>
                            <ul>
                                {onlineUsers.map((user, index) => (
                                    <li key={index}>{user}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={styles.messagesContainer}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`${styles.message} ${message.sender === userName ? styles.ownMessage : styles.otherMessage
                                    }`}
                            >
                                <span className={styles.messageSender}>{message.sender}:</span>
                                <span className={styles.messageContent}>{message.content}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className={styles.messageInput}
                        />
                        <button onClick={sendMessage} className={styles.sendButton}>
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatRoom;