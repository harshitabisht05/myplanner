const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_workspace', (workspaceId) => {
      if (workspaceId) {
        socket.join(`workspace:${workspaceId}`);
      }
    });

    socket.on('leave_workspace', (workspaceId) => {
      if (workspaceId) {
        socket.leave(`workspace:${workspaceId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitWorkspaceEvent = (workspaceId, event, data) => {
  if (io && workspaceId) {
    io.to(`workspace:${workspaceId}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitWorkspaceEvent
};
