import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for now
    const agents = [
      {
        id: 'cmfd393ga0002cz8px1n6xqwc',
        name: 'Procurement Negotiator',
        type: 'PROCUREMENT_NEGOTIATOR',
        status: 'CREATED',
        model: 'gpt-4o-2024',
        systemPrompt: null,
        config: {},
        mcpEnabled: false,
        streaming: true,
        checkpointing: true,
        createdAt: '2025-09-09T21:54:28.666Z',
        updatedAt: '2025-09-09T21:54:28.666Z',
        createdById: 'cmfd393g60000cz8pwx6qvqo5'
      },
      {
        id: 'cmfd393gc0004cz8px8dpxnmx',
        name: 'Risk Analyzer',
        type: 'RISK_ANALYZER',
        status: 'CREATED',
        model: 'claude-3.5-sonnet',
        systemPrompt: null,
        config: {},
        mcpEnabled: false,
        streaming: true,
        checkpointing: true,
        createdAt: '2025-09-09T21:54:28.669Z',
        updatedAt: '2025-09-09T21:54:28.669Z',
        createdById: 'cmfd393g60000cz8pwx6qvqo5'
      }
    ];
    return NextResponse.json(agents);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
