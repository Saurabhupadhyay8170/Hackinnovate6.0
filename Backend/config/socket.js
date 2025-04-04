import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const activeUsers = new Map();
  const userColors = [
    '#1A73E8', '#FF5733', '#27AE60', '#9B59B6', '#E67E22',
    '#16A085', '#E84393', '#2980B9', '#C0392B', '#8E44AD'
  ];

  // For collaborative story writer
  let storyContent = '<p>Start writing your story here...</p>';
  let typingUsers = new Set();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Collaborative story writer handlers
    socket.emit('init-content', storyContent);

    // Update user count when a new user connects
    io.emit('user-count', io.engine.clientsCount);

    // Handle content changes
    socket.on('content-change', (newContent) => {
      storyContent = newContent;
      socket.broadcast.emit('content-update', newContent);
    });

    // Handle typing status
    socket.on('typing', () => {
      typingUsers.add(socket.id);
      socket.broadcast.emit('user-typing');
    });

    socket.on('stop-typing', () => {
      typingUsers.delete(socket.id);
      if (typingUsers.size === 0) {
        socket.broadcast.emit('user-stop-typing');
      }
    });

    socket.on('join-document', async ({ documentId, user }) => {
      socket.join(documentId);

      if (!activeUsers.has(documentId)) {
        activeUsers.set(documentId, new Map());
      }

      const documentUsers = activeUsers.get(documentId);
      const userColor = userColors[Math.floor(Math.random() * userColors.length)];

      documentUsers.set(user._id, {
        id: user._id,
        name: user.name,
        color: userColor,
        socketId: socket.id
      });

      // Broadcast to all clients in the room
      io.to(documentId).emit('active-users-update', {
        users: Array.from(documentUsers.values())
      });
    });

    socket.on('cursor-move', (data) => {
      const documentUsers = activeUsers.get(data.documentId);
      if (!documentUsers || !documentUsers.has(data.userId)) return;

      const user = documentUsers.get(data.userId);
      socket.to(data.documentId).emit('cursor-update', {
        ...data,
        color: user.color,
        name: user.name
      });
    });

    // Handle document sharing
    socket.on('document-shared', ({ documentId, sharedWith, accessLevel }) => {
      io.emit('share-update', {
        documentId,
        sharedWith,
        accessLevel
      });
    });

    socket.on('disconnect', () => {
      // Clean up typing users for the collaborative story writer
      typingUsers.delete(socket.id);
      if (typingUsers.size === 0) {
        io.emit('user-stop-typing');
      }

      // Update user count when a user disconnects
      io.emit('user-count', io.engine.clientsCount);

      // Clean up document users
      activeUsers.forEach((documentUsers, documentId) => {
        documentUsers.forEach((user, userId) => {
          if (user.socketId === socket.id) {
            documentUsers.delete(userId);
            io.to(documentId).emit('user-left', userId);
          }
        });
        if (documentUsers.size === 0) {
          activeUsers.delete(documentId);
        }
      });
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};