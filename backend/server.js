const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const trackingRoutes = require("./routes/tracking.routes");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://smart-sos-platform-waip.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/tracking", trackingRoutes);
// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
app.use('/api/recordings', require('./routes/recordingRoutes'));

// Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('send-location', (data) => {
    socket.broadcast.emit('receive-location', data);
  });

  socket.on('sos-triggered', (data) => {
    socket.broadcast.emit('sos-alert', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => res.send('Smart SOS API Running 🚨'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
module.exports = { io };