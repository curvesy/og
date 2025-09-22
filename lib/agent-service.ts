import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import { Server } from 'socket.io'
import { AGUIEventPayload, AGUIEventType } from './socket-client';
import axios from 'axios';
import { createHash } from 'crypto';
import { mockLLMService } from './mock-llm-service';

const REASONING_SERVICE_URL = process.env.REASONING_SERVICE_URL || 'http://localhost:8000';


export interface AgentExecutionContext {
  agentId: string
  input: any
  workflowId?: string
  executionId: string
  mcpServers?: any[]
}

export interface AgentExecutionResult {
  success: boolean
  result?: any
  error?: string
  metadata?: {
    model: string
    tokensUsed?: number
    executionTime: number
    mcpCalls?: any[]
  }
}

export class AgentService {
  private static instance: AgentService
  private io: Server

  private constructor(io: Server) {
    this.io = io
  }

  static getInstance(io: Server): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService(io)
    }
    return AgentService.instance
  }

  async executeAgent(context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const { agentId, executionId, input } = context;

    try {
        console.log(`Executing agent ${agentId} with mock LLM service`);

        // Try MAX Engine first, fallback to mock service
        let response;
        try {
            const requestPayload = {
                model: "modularai/Llama-3.1-8B-Instruct-GGUF",
                messages: [
                    { role: "system", content: "You are a helpful assistant specialized in contract analysis and mathematical modeling." },
                    { role: "user", content: input.prompt || input.query || JSON.stringify(input) }
                ]
            };

            response = await axios.post(`${REASONING_SERVICE_URL}/v1/chat/completions`, requestPayload, {
                timeout: 5000 // 5 second timeout
            });
        } catch (maxEngineError) {
            console.log('MAX Engine not available, using mock LLM service');
            
            // Use mock service as fallback
            response = {
                data: await mockLLMService.chatCompletion({
                    model: "mock-llm-service",
                    messages: [
                        { role: "system", content: "You are a helpful assistant specialized in contract analysis and mathematical modeling." },
                        { role: "user", content: input.prompt || input.query || JSON.stringify(input) }
                    ]
                })
            };
        }

        const result = response.data.choices[0].message.content;
        const model = response.data.model;

        this.io.to('agui-events').emit('agui-event', {
            type: AGUIEventType.TEXT_MESSAGE_CONTENT,
            timestamp: new Date().toISOString(),
            runId: executionId,
            agentId: agentId,
            content: result,
        });

        const endTime = Date.now();
        return {
            success: true,
            result: result,
            metadata: {
                model: model,
                executionTime: endTime - startTime,
            },
        };
    } catch (error: any) {
        console.error('Error executing agent:', error);
        const endTime = Date.now();
        return {
            success: false,
            error: error.message || 'An unknown error occurred',
            metadata: {
                model: 'error',
                executionTime: endTime - startTime,
            },
        };
    }
  }
}