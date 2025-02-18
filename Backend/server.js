import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import documentsRoutes from './routes/documents.js';
import feedbackRoutes from './routes/feedback.routes.js';
import templateRoutes from './routes/template.routes.js';
import Document from './models/Document.js';
import './config/nodemailer.js';
import { initSocket } from './config/socket.js';

dotenv.config();

const app = express();

// ✅ Set up proper CORS to allow frontend access
const corsOptions = {
  origin: ["https://storymosaic-nine.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// ✅ Fix COOP (Cross-Origin-Opener-Policy) for Google OAuth
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.json());

// In-memory storage for active users in documents
const activeUsers = new Map();
const userColors = [
  '#1A73E8', '#FF5733', '#27AE60', '#9B59B6', '#E67E22',
  '#16A085', '#E84393', '#2980B9', '#C0392B', '#8E44AD'
];

// Create HTTP and Socket.IO server
const server = http.createServer(app);
const io = initSocket(server);

// Make io available to routes
app.set('io', io);

// ✅ Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on('join-document', async ({ documentId, user }) => {
    socket.join(documentId);
    
    // Assign a random color to the user
    const userColor = userColors[Math.floor(Math.random() * userColors.length)];
    
    // Store user information
    if (!activeUsers.has(documentId)) {
      activeUsers.set(documentId, new Map());
    }
    
    const documentUsers = activeUsers.get(documentId);
    documentUsers.set(user._id, {
      id: user._id,
      name: user.name,
      color: userColor,
      socketId: socket.id,
      lastActive: Date.now()
    });
  
    // Load existing document
    const document = await Document.findOne({ documentId });
  
    // Send current document state and ALL active users to the newly joined user
    socket.emit('load-document', {
      content: document?.content || '',
      users: Array.from(documentUsers.values())
    });
  
    // Broadcast to all clients (including sender) in the room that a user joined
    io.to(documentId).emit('active-users-update', {
      users: Array.from(documentUsers.values())
    });
  });

  socket.on('send-changes', ({ documentId, content, userId }) => {
    // Broadcast changes to all clients in the room EXCEPT sender
    socket.to(documentId).emit('receive-changes', {
      content,
      userId
    });
    
    // Save changes to database
    Document.findOneAndUpdate(
      { documentId },
      { 
        $set: { 
          content,
          lastModified: new Date()
        }
      },
      { upsert: true }
    ).exec();
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

  socket.on('disconnect', () => {
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

  socket.on('document-shared', ({ documentId, sharedWith, accessLevel }) => {
    // Broadcast to all connected clients that a new user has been given access
    io.emit('share-update', {
      documentId,
      sharedWith,
      accessLevel
    });
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/templates', templateRoutes);

// ✅ Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// ✅ Global error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// ✅ Periodic cleanup of inactive users
setInterval(() => {
  const now = Date.now();
  activeUsers.forEach((documentUsers, documentId) => {
    documentUsers.forEach((user, userId) => {
      if (now - user.lastActive > 30000) { // 30 seconds inactivity
        documentUsers.delete(userId);
        io.to(documentId).emit('user-left', userId);
      }
    });
  });
}, 10000);

export default app;
