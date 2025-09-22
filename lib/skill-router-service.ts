// src/lib/skill-router-service.ts
import { Effect } from 'effect';
import { Expert } from './expert-types';

const REASONING_SERVICE_URL = process.env.REASONING_SERVICE_URL || 'http://localhost:8000';

/**
 * The SkillRouterService is the client for the Python-based Knowledge & Reasoning Service.
 * It is responsible for calling the /route_expert endpoint to get the best
 * expert(s) for a given task.
 */
export class SkillRouterService {
  /**
   * The main entry point for the service. It takes a prompt and returns the
   * top-k experts selected by the Python service.
   * @param prompt The user's prompt.
   * @param k The number of experts to select.
   * @returns An Effect that resolves to the selected expert(s).
   */
  route(prompt: string, k: number = 1): Effect.Effect<Expert[], Error> {
    return Effect.tryPromise({
      try: async () => {
        console.log(`[SkillRouterClient] Calling reasoning service to route prompt: "${prompt}"`);
        const response = await fetch(`${REASONING_SERVICE_URL}/route_expert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, k }),
        });

        if (!response.ok) {
          throw new Error(`Reasoning service returned an error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.experts as Expert[];
      },
      catch: (e) => e as Error,
    });
  }
}

export const skillRouterService = new SkillRouterService();