const express = require('express');
const app = express();
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const {connectDB} = require('./config/db');


app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, 
});
app.use(limiter);

app.use(express.json());

// Pass 'io' to all requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Map to store online users (userId -> socketId)
const userSocketMap = {};
console.log("userSocketMap",userSocketMap);
// Socket connection
io.on('connection', (socket) => {
  console.log("Socket connected", socket.id);
  const userId = socket.handshake.query.userId;
  if(userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);
  }
console.log("userSocketMap",userSocketMap);
  // To send online users list to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if(userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  // Listener for direct messages
  socket.on('sendMessage', (data) => {
    const { senderId, receiverId, message } = data;
    console.log("data",data);
    
    const receiverSocketId = userSocketMap[receiverId];
    if(receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', {
        sender: senderId,
        message,
        createdAt: new Date().toISOString()
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running with Socket.io on port ${PORT}`);
});

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route');
const notificationRoute = require('./routes/notification.route');
const chatRoute = require('./routes/chat.route');

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/notification', notificationRoute);
app.use('/api/chat', chatRoute);