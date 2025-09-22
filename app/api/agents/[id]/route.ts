import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await db.agent.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        workflows: true,
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
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

    return NextResponse.json(agent)
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      type,
      status,
      model,
      systemPrompt,
      config,
      mcpEnabled,
      streaming,
      checkpointing
    } = body

    const agent = await db.agent.update({
      where: { id: params.id },
      data: {
        name,
        type,
        status,
        model,
        systemPrompt,
        config: config || {},
        mcpEnabled,
        streaming,
        checkpointing
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        workflows: true,
        executions: true,
        mcpServers: {
          include: {
            server: true
          }
        }
      }
    })

    return NextResponse.json(agent)
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.agent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}