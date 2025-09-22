import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const execution = await db.agentExecution.findUnique({
      where: { id: params.id },
      include: {
        agent: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true }
            },
            mcpServers: {
              include: {
                server: true
              }
            }
          }
        },
        workflow: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(execution)
  } catch (error) {
    console.error('Error fetching execution:', error)
    return NextResponse.json(
      { error: 'Failed to fetch execution' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.agentExecution.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting execution:', error)
    return NextResponse.json(
      { error: 'Failed to delete execution' },
      { status: 500 }
    )
  }
}