import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    console.log('Creating socket connection...');

    socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  return socket;
};
