const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store users and messages
let users = {};
let messages = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle new user
    socket.on('new-user', (username) => {
        users[socket.id] = username;
        io.emit('user-connected', username);
        io.emit('update-users', Object.values(users));
        socket.emit('previous-messages', messages);
    });

    // Handle chat messages
    socket.on('send-message', (message) => {
        const msg = {
            user: users[socket.id],
            text: message,
            time: new Date().toLocaleTimeString()
        };
        messages.push(msg);
        io.emit('receive-message', msg);
    });

    // Handle typing indicator
    socket.on('typing', () => {
        socket.broadcast.emit('user-typing', users[socket.id]);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const username = users[socket.id];
        delete users[socket.id];
        io.emit('user-disconnected', username);
        io.emit('update-users', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
