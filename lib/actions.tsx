// src/lib/actions.ts
import React from 'react';
import {
  Home,
  BrainCircuit,
  FileText,
  ShieldCheck,
  Server,
  Play,
  Moon,
  Sun,
} from 'lucide-react';

export interface CommandAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  execute: () => void;
  category: 'Navigation' | 'Agents' | 'Theme';
}

// This is a placeholder for a dynamic action system.
// In a real app, you might fetch agents from an API here.
export const getRegisteredActions = (
  router: any, 
  theme: string | undefined, 
  setTheme: (theme: string) => void
): CommandAction[] => {
  const actions: CommandAction[] = [
    // Navigation Actions
    {
      id: 'nav-dashboard',
      name: 'Go to Dashboard',
      description: 'Navigate to the main AI agent dashboard',
      icon: <Home className="h-4 w-4" />,
      execute: () => router.push('/'),
      category: 'Navigation',
    },
    {
      id: 'nav-mcp',
      name: 'Go to MCP Console',
      description: 'Manage and monitor MCP servers',
      icon: <Server className="h-4 w-4" />,
      execute: () => router.push('/mcp'),
      category: 'Navigation',
    },
    {
      id: 'nav-governance',
      name: 'Go to Governance',
      description: 'Review causal model governance',
      icon: <ShieldCheck className="h-4 w-4" />,
      execute: () => router.push('/governance/causal'),
      category: 'Navigation',
    },
    // Agent Actions
    {
      id: 'agent-run-procurement',
      name: 'Run Procurement Negotiator',
      description: 'Execute the procurement negotiation agent',
      icon: <Play className="h-4 w-4" />,
      execute: () => console.log('Executing Procurement Negotiator...'), // Placeholder
      category: 'Agents',
    },
    {
      id: 'agent-run-risk',
      name: 'Run Risk Analyzer',
      description: 'Execute the risk analysis agent',
      icon: <Play className="h-4 w-4" />,
      execute: () => console.log('Executing Risk Analyzer...'), // Placeholder
      category: 'Agents',
    },
    // Theme Actions
    {
      id: 'theme-toggle',
      name: 'Toggle Theme',
      description: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
      icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      execute: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      category: 'Theme',
    },
  ];

  return actions;
};
