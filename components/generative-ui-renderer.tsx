'use client';

import { useStreamableValue } from '@ai-sdk/rsc';
import { useEffect } from 'react';

interface GenerativeUIRendererProps {
  stream: ReadableStream;
}

export const GenerativeUIRenderer = ({ stream }: GenerativeUIRendererProps) => {
  const [data, error, pending] = useStreamableValue(stream);

  useEffect(() => {
    if (error) {
      console.error('Error streaming UI:', error);
    }
  }, [error]);

  if (pending) {
    return <div>Loading UI...</div>;
  }

  return <>{data}</>;
};

