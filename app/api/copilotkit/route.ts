/*
import { toUIMessageStream } from '@ai-sdk/langchain';
import { langGraphAgent } from '@/lib/langgraph-agent';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: langGraphAgent,
    messages: messages.map((msg: any) =>
      msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    ),
  });

  return toUIMessageStream(result);
}
*/
