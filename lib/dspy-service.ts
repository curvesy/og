// src/lib/dspy-service.ts
import { Effect } from 'effect';
import { exec } from 'child_process';
import path from 'path';

export class DSPyServiceError extends new Error('DSPyServiceError') {}

/**
 * The DSPyService provides an interface to the Python-based DSPy compiler.
 * It works by spawning a Python script and communicating with it via JSON
 * over stdin/stdout.
 */
export class DSPyService {
  private pythonScriptPath: string;

  constructor() {
    // It's important to resolve the path to the script to avoid execution errors.
    this.pythonScriptPath = path.resolve(process.cwd(), 'scripts/dspy_runner.py');
  }

  /**
   * Executes a DSPy program by calling the Python script.
   * @param systemPrompt The system prompt for the agent.
   * @param userRequest The user's request.
   * @returns An Effect that resolves to the JSON response from the DSPy program.
   */
  run(systemPrompt: string, userRequest: string): Effect.Effect<any, DSPyServiceError> {
    return Effect.tryPromise({
      try: () =>
        new Promise((resolve, reject) => {
          // We must escape the arguments to handle special characters.
          const command = `python3 ${this.pythonScriptPath} "${systemPrompt.replace(/"/g, '\\"')}" "${userRequest.replace(/"/g, '\\"')}"`;

          exec(command, (error, stdout, stderr) => {
            if (error) {
              reject(new DSPyServiceError(`DSPy execution failed: ${error.message}`));
              return;
            }
            if (stderr) {
              reject(new DSPyServiceError(`DSPy stderr: ${stderr}`));
              return;
            }
            try {
              const result = JSON.parse(stdout);
              resolve(result);
            } catch (parseError) {
              reject(new DSPyServiceError(`Failed to parse DSPy output: ${parseError}`));
            }
          });
        }),
      catch: (error) => new DSPyServiceError(`DSPy service error: ${error}`),
    });
  }
}