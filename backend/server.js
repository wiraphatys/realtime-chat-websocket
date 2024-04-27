const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

const chatRoom = 'globalChatRoom'; // ชื่อห้องแชทสำหรับทุกคน
const users = new Map();

io.on('connection', (socket) => {
    socket.on('setup', (userName) => {
        socket.join(chatRoom); // เข้าร่วมห้องแชทสำหรับทุกคน

        // Get all online users in the chat room
        const onlineUsers = Array.from(io.sockets.adapter.rooms.get(chatRoom) || [])
            .map((socketId) => users.get(socketId));

        // Broadcast the new user to other online users
        socket.broadcast.to(chatRoom).emit('user connected', userName);

        // Send the list of online users to the new user
        socket.emit('online users', onlineUsers);

        console.log(`${userName} online`);
    });

    socket.on('new message', (messageData) => {
        io.to(chatRoom).emit('message received', messageData); // ส่งข้อความไปยังห้องแชทสำหรับทุกคน
    });

    socket.on('disconnect', () => {
        // ลบข้อมูลผู้ใช้ออกจาก Map เมื่อผู้ใช้ออกจากห้องแชท
        users.delete(socket.id);
        console.log('USER DISCONNECTED');
        socket.leave(chatRoom);
    });
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});