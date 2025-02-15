import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import documentsRoutes from './routes/documents.js';
import Document from './models/Document.js';
import feedbackRoutes from './routes/feedback.routes.js';
import './config/nodemailer.js';
import templateRoutes from './routes/template.routes.js';

dotenv.config();

const app = express();

// Set COOP header to allow popups and window.postMessage between same-origin popups
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Add these at the top level of your server file
const activeUsers = new Map();
const userColors = [
  '#1A73E8', // Google Blue
  '#FF5733', // Coral
  '#27AE60', // Emerald
  '#9B59B6', // Amethyst
  '#E67E22', // Carrot
  '#16A085', // Green Sea
  '#E84393', // Pink
  '#2980B9', // Belize Hole
  '#C0392B', // Pomegranate
  '#8E44AD'  // Wisteria
];

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Create HTTP server once
const server = http.createServer(app);

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Allow both development ports
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  allowEIO3: true // Enable compatibility mode
});

// Store document data for each document
const documents = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on('join-document', async ({ documentId, user }) => {
    socket.join(documentId);
    
    // Initialize document's user list
    if (!activeUsers.has(documentId)) {
      activeUsers.set(documentId, new Map());
    }
    
    const documentUsers = activeUsers.get(documentId);
    const userColor = userColors[documentUsers.size % userColors.length];

    // Add user to active users
    documentUsers.set(user._id, {
      id: user._id,
      name: user.name,
      color: userColor,
      socketId: socket.id,
      lastActive: Date.now()
    });

    // Load document and emit to all users
    try {
      const document = await Document.findOne({ documentId: documentId });
      if (document) {
        // Send document content to joining user
        socket.emit('load-document', document.data);
        
        // Broadcast updated user list to all users in the document
        io.to(documentId).emit('users-update', 
          Array.from(documentUsers.values())
        );
      }
    } catch (error) {
      console.error('Error loading document:', error);
    }
  });

  socket.on('send-changes', ({ documentId, content }) => {
    const documentUsers = activeUsers.get(documentId);
    if (!documentUsers) return;

    const user = Array.from(documentUsers.values())
      .find(u => u.socketId === socket.id);

    if (user) {
      socket.to(documentId).emit('receive-changes', {
        content,
        userId: user.id
      });
    }
  });

  socket.on('cursor-move', ({ documentId, position, userId, selection }) => {
    const documentUsers = activeUsers.get(documentId);
    if (!documentUsers || !documentUsers.has(userId)) return;

    const user = documentUsers.get(userId);
    user.position = position;
    user.selection = selection;
    user.lastActive = Date.now();

    socket.to(documentId).emit('cursor-update', {
      userId,
      position,
      selection,
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
          io.to(documentId).emit('users-update', 
            Array.from(documentUsers.values())
          );
        }
      });
    });
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/templates', templateRoutes);


// Connect to MongoDB using your Atlas URI
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start server only after MongoDB connection is established
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Add error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Add periodic cleanup of inactive users
setInterval(() => {
  const now = Date.now();
  activeUsers.forEach((documentUsers, documentId) => {
    documentUsers.forEach((user, userId) => {
      if (now - user.lastActive > 30000) { // 30 seconds timeout
        documentUsers.delete(userId);
        io.to(documentId).emit('user-left', userId);
      }
    });
  });
}, 10000);

export default app;