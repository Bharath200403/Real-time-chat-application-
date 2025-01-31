const socket = io();
let username = '';

function joinChat() {
    username = document.getElementById('usernameInput').value.trim();
    if (username) {
        document.getElementById('loginOverlay').style.display = 'none';
        socket.emit('new-user', username);
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('send-message', message);
        messageInput.value = '';
    }
}

function handleTyping() {
    socket.emit('typing');
}

// Socket listeners
socket.on('receive-message', (msg) => {
    const messagesDiv = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <strong>${msg.user}</strong> 
        <span class="time">${msg.time}</span>
        <p>${msg.text}</p>
    `;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('user-connected', (username) => {
    addSystemMessage(`${username} joined the chat`);
});

socket.on('user-disconnected', (username) => {
    addSystemMessage(`${username} left the chat`);
});

socket.on('update-users', (users) => {
    const userList = document.getElementById('userList');
    userList.innerHTML = users.map(user => `<li>${user}</li>`).join('');
});

socket.on('user-typing', (username) => {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.textContent = `${username} is typing...`;
    setTimeout(() => {
        typingIndicator.textContent = '';
    }, 3000);
});

socket.on('previous-messages', (messages) => {
    const messagesDiv = document.getElementById('chatMessages');
    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <strong>${msg.user}</strong> 
            <span class="time">${msg.time}</span>
            <p>${msg.text}</p>
        `;
        messagesDiv.appendChild(messageElement);
    });
});

function addSystemMessage(text) {
    const messagesDiv = document.getElementById('chatMessages');
    const systemMessage = document.createElement('div');
    systemMessage.className = 'system-message';
    systemMessage.textContent = text;
    messagesDiv.appendChild(systemMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle Enter key
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
