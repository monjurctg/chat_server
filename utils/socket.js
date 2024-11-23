const Message = require("../models/Message");

const connectedUsers = new Map(); // Store connected users by socket ID
let socketio
const initializeSocket = (io) => {
  socketio = io; // Store socket.io instance for later use

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Store user ID when they join
    socket.on('join', (userId) => {
      connectedUsers.set(socket.id, userId);
      console.log(`User ${userId} connected`);
    });

    // Handle private messages
    socket.on('privateMessage', async (data) => {
      const { content, senderId, receiverId } = data;

      // Save message to database
      const message = await Message.create({ content, senderId, receiverId });

      // Emit to specific user if they're online
      const targetSocket = [...connectedUsers.entries()].find(([, id]) => id === receiverId)?.[0];
      if (targetSocket) {
        io.to(targetSocket).emit('receiveMessage', message);
      }
    });

    // Handle group messages
    socket.on('groupMessage', async (data) => {
      const { content, senderId, groupId } = data;

      // Save message to database
      const message = await Message.create({ content, senderId, groupId });

      // Emit to all users in the group
      io.emit(`group_${groupId}`, message);
    });


    socket.on('markRead', async ({ messageId }) => {
        await Message.update({ readStatus: true }, { where: { id: messageId } });
        io.emit('messageRead', messageId);
      });

      socket.on('typing', ({ chatId, userId }) => {
        io.emit(`typing_${chatId}`, { userId });
      });

      socket.on('stopTyping', ({ chatId, userId }) => {
        io.emit(`stopTyping_${chatId}`, { userId });
      });


    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      connectedUsers.delete(socket.id);
    });
  });
};
const getIOInstance = () => {
  if (!socketio) {
    throw new Error("Socket.IO has not been initialized!");
  }
  return socketio;
};

module.exports = { initializeSocket ,getIOInstance};
