const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt.util');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('AUTH_NO_TOKEN'));
    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('AUTH_INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);
    console.log(`Socket connected: ${socket.user.id} (${socket.user.role})`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.id}`);
    });
  });

  return io;
}

module.exports = initSocket;