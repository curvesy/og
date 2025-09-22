import { NextRequest, NextResponse } from 'next/server';
import { getAgentService } from '@/lib/server-instance';

export async function POST(req: NextRequest) {
  try {
    const { agentId, input, executionId } = await req.json();
    const agentService = getAgentService();

    if (!agentId || !input || !executionId) {
      return NextResponse.json({ error: 'agentId, input, and executionId are required' }, { status: 400 });
    }

    if (!agentService) {
      return NextResponse.json({ error: 'Agent service is not initialized' }, { status: 500 });
    }

    const result = await agentService.executeAgent({
      agentId,
      input,
      executionId,
    });

    return NextResponse.json({ executionId, result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[EXECUTE] Error: ${errorMessage}`);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
