// src/lib/server-instance.ts
import { Server } from 'socket.io';
import { AgentService } from './agent-service';

/**
 * In a development environment, Next.js's hot-reloading can re-execute modules,
 * leading to multiple instances of services. Using a global symbol ensures
 * that we always access the same singleton instance across reloads.
 */
const GLOBAL_KEY = Symbol.for('z.ai.server.instance');

interface ServerInstances {
  agentService: AgentService;
}

const globalWithInstances = global as typeof global & {
  [GLOBAL_KEY]?: ServerInstances;
};

/**
 * Initializes the AgentService and stores it globally.
 * If already initialized, it returns the existing instance.
 * @param io The Socket.IO server instance.
 * @returns The singleton AgentService instance.
 */
export function initializeAgentService(io: Server): AgentService {
  if (globalWithInstances[GLOBAL_KEY]?.agentService) {
    console.log('> AgentService already initialized. Re-using existing instance.');
    return globalWithInstances[GLOBAL__KEY].agentService;
  }

  console.log('> Initializing AgentService for the first time.');
  const agentService = new AgentService(io);

  globalWithInstances[GLOBAL_KEY] = {
    agentService,
  };

  return agentService;
}

/**
 * Retrieves the singleton AgentService instance.
 * This is used by API routes to ensure they get the live, initialized service.
 * @returns The AgentService instance, or undefined if it has not been initialized.
 */
export function getAgentService(): AgentService | undefined {
  return globalWithInstances[GLOBAL_KEY]?.agentService;
}

// Export a direct accessor for convenience in API routes.
export const agentService = getAgentService();