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

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pulsegen');
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

module.exports = { app, io };
