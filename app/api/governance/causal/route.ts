// src/app/api/governance/causal/route.ts
import { NextResponse } from 'next/server';
import { CausalReasoningService } from '@/lib/causal-reasoning-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, query } = body;

    if (!data || !query) {
      return NextResponse.json({ error: 'Missing data or query' }, { status: 400 });
    }

    const service = new CausalReasoningService();
    const result = await service.performCausalQuery(data, query);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in causal reasoning API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to perform causal reasoning', details: errorMessage }, { status: 500 });
  }
}
