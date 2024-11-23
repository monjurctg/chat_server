const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const firendRoutes = require('./routes/friendshipRoutes');
const socketUtils = require('./utils/socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', firendRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO Setup
socketUtils.initializeSocket(io);

// Sync Database and Start Server
sequelize
  .sync({ force: false })  // Set to 'false' to avoid dropping tables on every restart.
  .then(() => {
    console.log('Database connected');
    server.listen(5000, () => {
      console.log('Server running on http://localhost:5000');
    });
  })
  .catch((err) => {
    console.error('Error syncing database: ', err);  // Catch and log any sync errors
  });
