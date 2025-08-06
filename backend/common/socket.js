import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const userSocketMap = {};

export function getRecieverSocketId(userId) {
  const socketId = userSocketMap[userId];
  console.log(
    `getRecieverSocketId: userId=${userId}, socketId=${socketId || 'not found'}`
  );
  return socketId;
}

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User connecting: userId=${userId}, socketId=${socket.id}`);

  if (userId && userId !== 'undefined') {
    userSocketMap[userId] = socket.id;
    console.log(`Mapped ${userId} → ${socket.id}`);
    console.log(
      'Current userSocketMap:',
      JSON.stringify(userSocketMap, null, 2)
    );
  } else {
    console.warn(`Invalid or missing userId for socket ${socket.id}`);
  }

  socket.on('disconnect', (reason) => {
    console.log(
      `User disconnected: socketId=${socket.id}, userId=${userId}, Reason: ${reason}`
    );
    if (userId && userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
      console.log(`Removed ${userId} from userSocketMap`);
      console.log(
        'Updated userSocketMap:',
        JSON.stringify(userSocketMap, null, 2)
      );
    }
  });
});

export { io, app, server };
