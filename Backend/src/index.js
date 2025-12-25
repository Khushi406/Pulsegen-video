require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const uploadRouter = require('./routes/upload');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/upload', uploadRouter);

const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
});

// Mount the upload router with injected `io` to avoid circular require
app.use('/api/upload', uploadRouter(io));

const PORT = process.env.PORT || 4000;

async function start() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/pulsegen';
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.warn('Starting server without DB connection (degraded mode). Update MONGO_URI or MONGO_URL in .env');
  }

  server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

start();

module.exports = { app, io };
