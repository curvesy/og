import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { agentId, input } = await req.json();

    if (!agentId || !input) {
      return NextResponse.json({ error: 'agentId and input are required' }, { status: 400 });
    }

    const execution = await db.agentExecution.create({
      data: {
        agentId,
        status: 'PENDING',
        input,
      },
    });

    return NextResponse.json({ executionId: execution.id });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
