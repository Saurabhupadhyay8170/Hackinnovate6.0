import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import documentsRoutes from './routes/documents.js';
import Document from './models/Document.js';
import http from 'http';
import feedbackRoutes from './routes/feedback.routes.js'

dotenv.config();

const app = express();

// Set COOP header to allow popups and window.postMessage between same-origin popups
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Add these at the top level of your server file
const activeUsers = new Map(); // Store active users per document

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

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Match your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store document data for each document
const documents = new Map();

io.on("connection", (socket) => {
  console.log("Client connected");

  // Handle joining a specific document
  socket.on('join-document', (documentId) => {
    socket.join(documentId);
    
    // Initialize document users if needed
    if (!activeUsers.has(documentId)) {
      activeUsers.set(documentId, new Map());
    }
    
    // Load document content
    if (documents.has(documentId)) {
      socket.emit("load-document", documents.get(documentId));
    } else {
      documents.set(documentId, "");
      socket.emit("load-document", "");
    }

    // Broadcast updated user list
    const documentUsers = Array.from(activeUsers.get(documentId).values());
    io.to(documentId).emit('user-joined', documentUsers);
  });

  // Handle cursor movement
  socket.on('cursor-move', ({ documentId, position, user }) => {
    if (!activeUsers.has(documentId)) return;
    
    const documentUsers = activeUsers.get(documentId);
    const userData = {
      userId: user._id,
      name: user.name,
      position,
      color: getUserColor(user._id, documentId),
      socketId: socket.id,
      lastActive: Date.now()
    };
    
    documentUsers.set(user._id, userData);
    
    // Broadcast cursor position to other users
    socket.to(documentId).emit('cursor-update', { user, position, color: userData.color });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from all documents they were in
    activeUsers.forEach((users, documentId) => {
      users.forEach((userData, userId) => {
        if (socket.id === userData.socketId) {
          users.delete(userId);
          io.to(documentId).emit('user-left', userId);
        }
      });
    });
    console.log("Client disconnected");
  });

  // Handle text updates
  socket.on("send-changes", (text) => {
    // Get all rooms the socket is in (should be only one document room)
    const rooms = Array.from(socket.rooms);
    const documentId = rooms.find(room => room !== socket.id);
    
    if (documentId) {
      // Store the latest version
      documents.set(documentId, text);
      // Broadcast changes to others in the same document
      socket.to(documentId).emit("receive-changes", text);
    }
  });

  // Handle leaving a document
  socket.on('leave-document', (documentId) => {
    socket.leave(documentId);
  });

  // Add this to your socket.io connection handler
  socket.on('selection-change', ({ documentId, selection, user }) => {
    if (!activeUsers.has(documentId)) return;
    
    const documentUsers = activeUsers.get(documentId);
    const userData = documentUsers.get(user._id);
    
    if (userData) {
      userData.selection = selection;
      userData.lastActive = Date.now();
      
      // Broadcast selection to other users
      socket.to(documentId).emit('selection-update', { user, selection });
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/feedback', feedbackRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB using your Atlas URI
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-document", async ({ documentId }) => {
    socket.join(documentId);
    console.log(`User joined document: ${documentId}`);
    try {
      const document = await Document.findById(documentId);
      if (document) {
        socket.emit("load-document", document.data);
      }
    } catch (error) {
      console.error("Error loading document:", error);
    }
  });

  socket.on("send-changes", ({ documentId, content }) => {
    socket.to(documentId).emit("receive-changes", content);
  });

  socket.on("cursor-move", ({ documentId, cursorPosition, userId }) => {
    socket.to(documentId).emit("cursor-update", { cursorPosition, userId });
  });

  socket.on("save-document", async ({ documentId, content }) => {
    try {
      await Document.findByIdAndUpdate(documentId, { data: content });
      console.log("Document saved:", documentId);
    } catch (error) {
      console.error("Error saving document:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Use server.listen instead of app.listen
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Add this function to consistently assign colors to users
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

function getUserColor(userId, documentId) {
  const documentUsers = activeUsers.get(documentId);
  if (!documentUsers) return userColors[0];
  
  const userIndex = Array.from(documentUsers.keys()).indexOf(userId);
  return userColors[userIndex % userColors.length];
}

// Add periodic cleanup of inactive users
setInterval(() => {
  const now = Date.now();
  activeUsers.forEach((users, documentId) => {
    users.forEach((userData, userId) => {
      if (now - userData.lastActive > 30000) { // 30 seconds timeout
        users.delete(userId);
        io.to(documentId).emit('user-left', userId);
      }
    });
  });
}, 10000); // Check every 10 seconds

export default app;