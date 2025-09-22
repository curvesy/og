// src/lib/expert-types.ts

/**
 * Represents a high-dimensional vector describing the capabilities of an expert
 * or the requirements of a task. The keys are specific, fine-grained skills.
 * The values are scores indicating proficiency or requirement level.
 */
export type SkillVector = Record<string, number>;

/**
 * Defines the contract for a specialized expert model in our Symbolic-MoE architecture.
 */
export interface Expert {
  id: string; // A unique identifier, often the model name, e.g., 'deepseek-r1-math-specialist'
  name: string; // A human-readable name, e.g., "DeepSeek Math Specialist"
  description: string; // A brief description of the expert's capabilities.
  skillProfile: SkillVector; // The vector describing this expert's strengths.
}

/**
 * The standardized input for any expert invocation.
 */
export interface ExpertInvocation {
  prompt: string;
  // In the future, this could include other context, e.g., knowledge graph snippets.
}

/**
 * The standardized output from any expert invocation.
 */
export interface ExpertResult {
  response: string;
  // In the future, this could include confidence scores, tool calls, etc.
}