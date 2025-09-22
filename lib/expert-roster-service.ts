// src/lib/expert-roster-service.ts
import { Expert } from './expert-types';

// This is our initial roster of specialized experts.
// In a production system, this could be loaded from a database or a configuration file.
const EXPERT_ROSTER: Expert[] = [
  {
    id: 'deepseek-r1-math-specialist',
    name: 'DeepSeek Math Specialist',
    description: 'An expert in algebraic and calculus-based reasoning.',
    skillProfile: { algebra: 0.95, calculus: 0.9, logic: 0.7, code: 0.5 },
  },
  {
    id: 'claude-3.7-legal-analyzer',
    name: 'Claude 3.7 Legal Analyzer',
    description: 'An expert in analyzing legal documents and precedents.',
    skillProfile: { legal: 0.98, logic: 0.8, summarization: 0.7 },
  },
  {
    id: 'gemini-2.5-code-generator',
    name: 'Gemini 2.5 Code Generator',
    description: 'An expert in generating and explaining code in multiple languages.',
    skillProfile: { code: 0.99, logic: 0.85, algebra: 0.6 },
  },
  {
    id: 'o3-mini-synthesizer',
    name: 'o3-mini Synthesizer',
    description: 'A generalist expert for summarizing and synthesizing information.',
    skillProfile: { summarization: 0.9, logic: 0.7, creative: 0.6 },
  },
];

/**
 * The ExpertRosterService is a simple registry that provides access to the
 * list of available specialized experts in our Symbolic-MoE architecture.
 */
export class ExpertRosterService {
  /**
   * Returns the complete list of available experts.
   */
  listExperts(): Expert[] {
    return EXPERT_ROSTER;
  }

  /**
   * Finds a specific expert by its unique ID.
   * @param id The ID of the expert to find.
   * @returns The expert object, or undefined if not found.
   */
  getExpertById(id: string): Expert | undefined {
    return EXPERT_ROSTER.find((expert) => expert.id === id);
  }
}

export const expertRosterService = new ExpertRosterService();
