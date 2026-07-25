import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (workspaceId, onEvent) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) return;

    // Target socket server (localhost:5000 in dev, window.location.origin in prod)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
      (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_workspace', workspaceId);
    });

    if (onEvent) {
      const handleChatMessage = (data) => onEvent('chat_message', data);
      const handleChatReaction = (data) => onEvent('chat_reaction', data);
      const handleTaskUpdated = (data) => onEvent('task_updated', data);
      const handleTaskCreated = (data) => onEvent('task_created', data);

      socket.on('chat_message', handleChatMessage);
      socket.on('chat_reaction', handleChatReaction);
      socket.on('task_updated', handleTaskUpdated);
      socket.on('task_created', handleTaskCreated);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_workspace', workspaceId);
        socketRef.current.disconnect();
      }
    };
  }, [workspaceId]);

  return socketRef.current;
};
