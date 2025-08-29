const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const scheduleRoutes = require('./routes/schedules');
const trainingRoutes = require('./routes/training');
const testRoutes = require('./routes/tests');
const calendarRoutes = require('./routes/calendar');
const leaderboardRoutes = require('./routes/leaderboard');
const salesRoutes = require('./routes/sales');
const dashboardRoutes = require('./routes/dashboard');
const starsRoutes = require('./routes/stars');
const tenantRoutes = require('./routes/tenants');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stars', starsRoutes);
app.use('/api/tenants', tenantRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('new-message', data);
  });

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${socket.id} joined user room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export io for use in routes
module.exports.io = io;
