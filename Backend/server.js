import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import documentsRoutes from './routes/documents.js';
import { nanoid } from 'nanoid';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB using the URI from your environment (or fallback to localhost)
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/collab-docs", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout if needed
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentsRoutes);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-document", async ({ documentId }) => {
    socket.join(documentId);
    console.log(`User joined document: ${documentId}`);

    // Fetch the existing document and send its content to the new user
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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
