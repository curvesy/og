import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AgentService } from '@/lib/agent-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await db.agent.findUnique({
      where: { id: params.id },
      include: {
        mcpServers: {
          include: {
            server: true
          }
        }
      }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { input, workflowId } = body

    // Create execution record
    const execution = await db.agentExecution.create({
      data: {
        agentId: params.id,
        workflowId,
        input: input || {},
        status: 'PENDING'
      }
    })

    // Execute agent using AgentService
    const agentService = AgentService.getInstance()
    
    // Execute asynchronously (fire and forget for now, but could be enhanced with webhooks)
    agentService.executeAgent({
      agentId: params.id,
      input: input || {},
      workflowId,
      executionId: execution.id,
      mcpServers: agent.mcpServers
    }).catch(error => {
      console.error('Agent execution failed:', error)
    })

    return NextResponse.json({ 
      executionId: execution.id,
      status: 'STARTED',
      message: 'Agent execution initiated',
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        model: agent.model
      }
    })
  } catch (error) {
    console.error('Error executing agent:', error)
    return NextResponse.json(
      { error: 'Failed to execute agent' },
      { status: 500 }
    )
  }
}