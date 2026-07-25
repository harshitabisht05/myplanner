import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (workspaceId, onEvent) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) return;

    // Connect to backend socket server
    const socket = io(window.location.origin.replace(/^http/, 'ws'), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_workspace', workspaceId);
    });

    if (onEvent) {
      socket.on('chat_message', (data) => onEvent('chat_message', data));
      socket.on('chat_reaction', (data) => onEvent('chat_reaction', data));
      socket.on('task_updated', (data) => onEvent('task_updated', data));
      socket.on('task_created', (data) => onEvent('task_created', data));
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
