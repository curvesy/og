'use client';

import { CopilotChat } from '@copilotkit/react-ui';
import { useCopilotContext } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';
import { useEffect, useState } from 'react';
import { AGUIEventType, RenderGenerativeUIEvent } from '@/lib/socket-client';
import { GenerativeUIRenderer } from './generative-ui-renderer';

// A custom hook to handle our generative UI events
const useGenerativeUI = () => {
  const [uiStream, setUiStream] = useState<ReadableStream | null>(null);
  const context = useCopilotContext();

  useEffect(() => {
    const handleGenerativeUI = (event: RenderGenerativeUIEvent) => {
      console.log('Received RENDER_GENERATIVE_UI event:', event);
      
      // Call our dedicated endpoint to get the UI stream
      const fetchUI = async () => {
        const response = await fetch('/api/generate-ui', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            componentName: event.componentName,
            props: event.props,
          }),
        });
        if (response.body) {
          setUiStream(response.body);
        }
      };

      fetchUI();
    };

    // Listen for our custom event
    context.socket?.on(AGUIEventType.RENDER_GENERATIVE_UI, handleGenerativeUI);

    return () => {
      context.socket?.off(AGUIEventType.RENDER_GENERATIVE_UI, handleGenerativeUI);
    };
  }, [context.socket]);

  return uiStream;
};

export const CopilotFeed = () => {
  const uiStream = useGenerativeUI();

  return (
    <div className="h-full w-full flex flex-col">
      <CopilotChat
        labels={{
          title: 'Live Intelligence Feed',
          initial: 'Welcome to the NOVIN AI Platform. How can I assist you?',
        }}
        socketUrl={process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3000/api/socketio'}
      />
      {uiStream && (
        <div className="p-4 border-t">
          <h3 className="text-lg font-semibold mb-2">Agent-Generated UI:</h3>
          <GenerativeUIRenderer stream={uiStream} />
        </div>
      )}
    </div>
  );
};