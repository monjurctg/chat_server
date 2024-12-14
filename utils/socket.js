const Message = require("../models/Message");

const connectedUsers = new Map();
let socketio
const initializeSocket = (io) => {
  socketio = io;

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {

      const userIdInConnectUser = connectedUsers.get(socket.id);
      if(!userIdInConnectUser){
        connectedUsers.set(socket.id, userId);
        console.log(`User ${userId} connected`);
        io.emit('userStatus', { userId, status: 'online' });

      }

    });

    socket.on('userConnected', (userId) => {
      connectedUsers.set(userId, socket.id);
      broadcastUserStatus(userId, true)
    });



    // Handle private messages
    socket.on('privateMessage', async (data) => {
      const { content, senderId, receiverId } = data;
      const message = await Message.create({ content, senderId, receiverId });

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

      socket.on('checkStatus', ({id}) => {
        const userId = connectedUsers.get(socket.id);
        if(userId==id){
          io.emit('userStatus', { userId, status: 'online' });
        }
        else{
          io.emit('userStatus', { userId, status: 'offline' });
        }
      });



    // Handle disconnection
    socket.on('disconnect', () => {
      const userId = connectedUsers.get(socket.id);
      if (userId) {
        console.log(`User ${userId} disconnected`);
        connectedUsers.delete(socket.id);
        io.emit('userStatus', { userId, status: 'offline' });
      }
    });
  });
};
function broadcastUserStatus(userId, isOnline) {
  io.emit('checkStatus', { userId, isOnline });
}
const getIOInstance = () => {
  if (!socketio) {
    throw new Error("Socket.IO has not been initialized!");
  }
  return socketio;
};

module.exports = { initializeSocket ,getIOInstance};
