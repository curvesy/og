import { NextRequest } from 'next/server'

// AG-UI Event Types (subset for this prototype)
type AGUIEvent =
  | { type: 'RUN_STARTED'; data: { agentId: string; executionId: string } }
  | { type: 'TEXT_MESSAGE_CONTENT'; data: { text: string } }
  | { type: 'TOOL_CALL_START'; data: { toolName: string; toolInput: any } }
  | { type: 'TOOL_CALL_END'; data: { toolName: string; toolOutput: any } }
  | { type: 'STATE_DELTA'; data: { widget: any } }
  | { type: 'RUN_ENDED'; data: { result: any } }

function createEvent(event: AGUIEvent): string {
  return `data: ${JSON.stringify(event)}

`
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const agentId = params.id
  const executionId = `exec-${Date.now()}`

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Announce the run has started
      controller.enqueue(createEvent({
        type: 'RUN_STARTED',
        data: { agentId, executionId }
      }))

      // 2. Simulate agent thinking (text message)
      await new Promise(res => setTimeout(res, 1000))
      controller.enqueue(createEvent({
        type: 'TEXT_MESSAGE_CONTENT',
        data: { text: 'Analyzing the contract amendment...' }
      }))

      // 3. Simulate a tool call (e.g., to the causal reasoning service)
      await new Promise(res => setTimeout(res, 1500))
      controller.enqueue(createEvent({
        type: 'TOOL_CALL_START',
        data: { toolName: 'CausalReasoningService', toolInput: { query: 'impact of amendment' } }
      }))
      await new Promise(res => setTimeout(res, 2000))
      controller.enqueue(createEvent({
        type: 'TOOL_CALL_END',
        data: { toolName: 'CausalReasoningService', toolOutput: { impact: 'high', confidence: 0.88 } }
      }))

      // 4. Simulate pushing a proactive widget (state delta)
      await new Promise(res => setTimeout(res, 1000))
      controller.enqueue(createEvent({
        type: 'STATE_DELTA',
        data: {
          widget: {
            id: `warning-causal-impact-${Date.now()}`,
            type: 'warning',
            title: 'High Causal Impact Detected',
            description: `The contract amendment is predicted to have a high impact on 'approval_probability'.`,
            priority: 'high',
            confidence: 0.88,
            timestamp: new Date().toISOString(),
            source: 'causal_reasoning_service'
          }
        }
      }))

      // 5. Announce the run has ended
      await new Promise(res => setTimeout(res, 500))
      controller.enqueue(createEvent({
        type: 'RUN_ENDED',
        data: { result: 'Analysis complete. Proactive insight generated.' }
      }))

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
