import { StreamingTextResponse, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // For now, we'll use a mock provider. 
  // In a real scenario, you would connect to your actual language model provider.
  const mockProvider = {
    chat: {
      completions: {
        create: async ({ messages }: { messages: any[] }) => {
          const userMessage = messages[messages.length - 1].content;
          const stream = new ReadableStream({
            start(controller) {
              const text = `The user said: "${userMessage}". I am a mock AI response.`;
              controller.enqueue(text);
              controller.close();
            }
          });
          return {
            choices: [{
              message: {
                content: await new Response(stream).text(),
                role: 'assistant'
              }
            }],
            stream: () => stream
          };
        }
      }
    }
  };

  const result = await streamText({
    model: mockProvider as any, // Use the mock provider
    messages,
  });

  return result.toAIStreamResponse();
}
