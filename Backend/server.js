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
  origin: ["http://localhost:5173", "http://localhost:3000"],
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
    try {
      if (!documentId || !user?._id) {
        throw new Error('Document ID and user ID are required');
      }

      socket.join(documentId);
      
      // Convert string ID to ObjectId if necessary
      const userId = mongoose.Types.ObjectId(user._id);

      // Find or create the document
      let document = await Document.findOne({ documentId });
      
      if (!document) {
        document = await Document.create({
          documentId,
          author: userId,
          title: 'Untitled Document',
          content: '',
          createdAt: new Date(),
          lastModified: new Date()
        });
      }

      // Send the document data to the client
      socket.emit('load-document', {
        content: document.content,
        title: document.title,
        documentId: document.documentId
      });

    } catch (error) {
      console.error('Error joining document:', error);
      socket.emit('error', {
        message: 'Error loading document',
        details: error.message
      });
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

  socket.on('save-document', async ({ documentId, content, title, userId }) => {
    try {
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      console.log('Saving document:', { documentId, contentLength: content?.length, title });

      // Create the document if it doesn't exist, otherwise update it
      const updatedDoc = await Document.findOneAndUpdate(
        { documentId },
        {
          $set: {
            title: title || 'Untitled Document',
            content: content || '',
            author: userId, // Make sure this is a valid MongoDB ObjectId
            lastModified: new Date()
          }
        },
        {
          new: true, // Return the updated document
          upsert: true, // Create if doesn't exist
          runValidators: true,
          setDefaultsOnInsert: true
        }
      ).exec(); // Add exec() to properly execute the query

      console.log('Document saved:', updatedDoc);

      // Broadcast the changes to all clients in the room
      socket.to(documentId).emit('receive-changes', {
        content: updatedDoc.content,
        title: updatedDoc.title
      });

      // Send save confirmation to the sender
      socket.emit('document-saved', {
        success: true,
        documentId: updatedDoc.documentId,
        content: updatedDoc.content,
        title: updatedDoc.title
      });

    } catch (error) {
      console.error('Error saving document:', error);
      socket.emit('document-saved', {
        success: false,
        error: error.message
      });
    }
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