import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Add connection event listeners
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

export default socket;