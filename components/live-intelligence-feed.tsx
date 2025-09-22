'use client'

import { useAguiStream } from '@/hooks/use-agui-stream';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, GitPullRequest, Check, X, Share2 } from 'lucide-react';
import { AGUIEventType } from '@/lib/socket-client';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EventIcon = ({ eventType }: { eventType: AGUIEventType }) => {
  switch (eventType) {
    case AGUIEventType.RUN_STARTED:
      return <GitPullRequest className="h-5 w-5 text-blue-500" />;
    case AGUIEventType.TEXT_MESSAGE_CONTENT:
      return <Bot className="h-5 w-5 text-gray-500" />;
    case AGUIEventType.GRAPH_INSIGHT:
      return <Share2 className="h-5 w-5 text-purple-500" />;
    case AGUIEventType.RUN_ENDED:
      return <Check className="h-5 w-5 text-green-500" />;
    default:
      return <Bot className="h-5 w-5 text-gray-400" />;
  }
};

const EventContent = ({ event }: { event: any }) => {
    switch (event.type) {
      case AGUIEventType.RUN_STARTED:
        return (
          <div>
            <p className="font-semibold">Run Started</p>
            <p className="text-xs text-gray-500">Input: {JSON.stringify(event.input)}</p>
          </div>
        );
      case AGUIEventType.TEXT_MESSAGE_CONTENT:
        return (
          <div>
            <p className="font-semibold">Message</p>
            <p className="text-sm">{event.content}</p>
          </div>
        );
      case AGUIEventType.GRAPH_INSIGHT:
        return (
          <div>
            <p className="font-semibold">Graph Insight</p>
            <p className="text-sm">{event.content}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {event.graphElements.map((el: any) => (
                <TooltipProvider key={el.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-pointer">
                        <Share2 className="h-3 w-3 mr-1" />
                        Used Graph Element
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ID: {el.id}</p>
                      <p>Label: {el.label}</p>
                      <p>Type: {el.type}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        );
      case AGUIEventType.RUN_ENDED:
        return (
          <div>
            <p className="font-semibold text-green-600">Run Ended</p>
            {event.error ? (
              <p className="text-xs text-red-500">Error: {event.error}</p>
            ) : (
              <p className="text-xs text-gray-500">Result: {JSON.stringify(event.result)}</p>
            )}
          </div>
        );
      default:
        return <p>Unsupported event type: {event.type}</p>;
    }
  };

export const LiveIntelligenceFeed = () => {
  const { events, isConnected } = useAguiStream();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Live Intelligence Feed
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription>
          This feed displays a real-time stream of AG-UI events from all agents.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <EventIcon eventType={event.type} />
              </div>
              <div className="flex-grow">
                <EventContent event={event} />
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(event.timestamp).toLocaleTimeString()} - Run ID: {event.runId}
                </p>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>Waiting for agent activity...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};