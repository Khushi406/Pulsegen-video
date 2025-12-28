require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const uploadRouter = require('./routes/upload');
const videosRouter = require('./routes/videos');
const streamRouter = require('./routes/stream');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const io = new Server(server, { cors: { origin: '*' } });
const jwt = require('jsonwebtoken');

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Expect clients to emit 'join' with either a tenantId string or a JWT token.
  socket.on('join', (tokenOrTenant) => {
    try {
      let tenantId = null;
      if (!tokenOrTenant) {
        console.warn('Join called without payload from', socket.id);
        return;
      }

      // If it's a JWT-like string (contains two dots), try to verify it
      if (typeof tokenOrTenant === 'string' && tokenOrTenant.split('.').length === 3) {
        const secret = process.env.JWT_SECRET || 'change_this_secret';
        const payload = jwt.verify(tokenOrTenant, secret);
        tenantId = payload.tenantId || payload.tenant || payload.org;
      } else if (typeof tokenOrTenant === 'string') {
        tenantId = tokenOrTenant;
      } else if (tokenOrTenant && tokenOrTenant.tenantId) {
        tenantId = tokenOrTenant.tenantId;
      }

      if (tenantId) {
        socket.join(tenantId);
        console.log(`Socket ${socket.id} joined tenant room: ${tenantId}`);
        socket.emit('joined', { tenantId });
      } else {
        console.warn('Could not determine tenantId for socket', socket.id);
      }
    } catch (e) {
      console.warn('Failed to join tenant room:', e.message);
      socket.emit('error', { message: 'Failed to join tenant room' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, reason);
  });
});

// Mount auth routes (signup/login)
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Mount the upload router with injected `io` to avoid circular require
app.use('/api/upload', uploadRouter(io));

// Mount videos listing route
app.use('/api/videos', videosRouter);

// Mount streaming route
app.use('/api/stream', streamRouter);

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
