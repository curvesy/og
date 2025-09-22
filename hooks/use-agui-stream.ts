'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { AGUIEventPayload, AGUIEventType } from '@/lib/socket-client';

interface UseAguiStreamOptions {
  runId?: string;
}

interface UseAguiStreamReturn {
  isConnected: boolean;
  events: AGUIEventPayload[];
}

export function useAguiStream(
  options: UseAguiStreamOptions = {}
): UseAguiStreamReturn {
  const { runId } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<AGUIEventPayload[]>([]);
  
  const socketRef = useRef<Socket | null>(null);

  const handleEvent = useCallback((event: AGUIEventPayload) => {
    // Only process events for the specified runId if provided
    if (runId && event.runId !== runId) {
      return;
    }
    setEvents(prevEvents => [...prevEvents, event].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
  }, [runId]);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('AG-UI Stream connected');
      // Join a general room for all AG-UI events
      socket.emit('join-agui-room');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('AG-UI Stream disconnected');
    });

    // Register listeners for all AG-UI event types
    Object.values(AGUIEventType).forEach(eventType => {
      socket.on(eventType, handleEvent);
    });

    return () => {
      if (socket) {
        Object.values(AGUIEventType).forEach(eventType => {
          socket.off(eventType, handleEvent);
        });
        socket.disconnect();
      }
    };
  }, [handleEvent]);

  return {
    isConnected,
    events,
  };
}
