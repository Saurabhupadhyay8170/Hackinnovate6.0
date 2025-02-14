import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import documentsRoutes from './routes/documents.js';
import Document from './models/Document.js';
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
