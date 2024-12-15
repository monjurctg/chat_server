const Message = require("../models/Message");

const connectedUsers = new Map();
let socketio


const initializeSocket = (io) => {
  socketio = io;

  io.on('connection', (socket) => {
    // Handle user joining
    socket.on('join', (userId) => {
      if (!connectedUsers.has(socket.id)) {
        connectedUsers.set(socket.id, userId);
        console.log(`User ${userId} connected`);
        io.emit('userStatus', { userId, status: 'online' });
      }
    });

    // User status update
    socket.on('userConnected', (userId) => {
      connectedUsers.set(userId, socket.id);
      broadcastUserStatus(userId, true);
    });

    // Handle joining chat rooms
    socket.on('chatjoin', ({ chatId }) => {
      socket.join(chatId);
    });

    // Handle private messages
    socket.on('privateMessage', ({ content, senderId, chatId }) => {
      const recipientSocketId = connectedUsers.get(chatId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receiveMessage', { content, senderId, timestamp: new Date() });
      }

      // const roomClients = io.sockets.adapter.rooms.get(chatId);
      // if (roomClients && roomClients.size > 0) {
      //   const newMessage = { content, senderId, timestamp: new Date() };
      //   io.to(chatId).emit('receiveMessage', newMessage);
      // }
    });

    // Handle typing
    socket.on('typing', ({ chatId, userId }) => {
      const recipientSocketId = connectedUsers.get(chatId);
      if (recipientSocketId) {
            io.to(recipientSocketId).emit('typing', { userId });
      }
      else{
        socket.to(chatId).emit('typing', { userId });

      }

      // console.log(`User ${userId} is typing in chat ${chatId}`);
      // socket.to(chatId).emit('typing', { userId });
    });

    socket.on('stopTyping', ({ chatId, userId }) => {
      const recipientSocketId = connectedUsers.get(chatId);
      if (recipientSocketId) {
            io.to(recipientSocketId).emit('stopTyping', { userId });
      }
      else{
        socket.to(chatId).emit(`stopTyping`, { userId  });

      }


    });

    // Handle fetching friends' statuses
    socket.on('getFriendsStatus', (friendIds) => {
      const statuses = friendIds.map((id) => ({
        userId: id,
        status: connectedUsers.has(id) ? 'online' : 'offline',
      }));
      socket.emit('friendsStatus', statuses);
    });

    // Handle group messages
    socket.on('groupMessage', async (data) => {
      const { content, senderId, groupId } = data;
      const message = await Message.create({ content, senderId, groupId });
      io.emit(`group_${groupId}`, message);
    });

    // Mark message as read
    socket.on('markRead', async ({ messageId }) => {
      await Message.update({ readStatus: true }, { where: { id: messageId } });
      io.emit('messageRead', messageId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userId = connectedUsers.get(socket.id);
      if (userId) {
        setTimeout(() => {
          if (!connectedUsers.has(socket.id)) {
            io.emit('userStatus', { userId, status: 'offline' });
          }
        }, 10 * 1000); // 10 seconds delay for user status
      }
    });
  });
};

function broadcastUserStatus(userId, isOnline) {
  socketio.emit('checkStatus', { userId, isOnline });
}
const getIOInstance = () => {
  if (!socketio) {
    throw new Error("Socket.IO has not been initialized!");
  }
  return socketio;
};

module.exports = { initializeSocket ,getIOInstance};
