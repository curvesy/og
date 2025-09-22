import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const workflows = await db.workflow.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        agents: true,
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(workflows)
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      type,
      graphConfig,
      isActive,
      createdById,
      agentIds
    } = body

    const workflow = await db.workflow.create({
      data: {
        name,
        description,
        type,
        graphConfig: graphConfig || {},
        isActive: isActive !== undefined ? isActive : true,
        createdById,
        agents: agentIds ? {
          connect: agentIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        agents: true,
        executions: true
      }
    })

    return NextResponse.json(workflow, { status: 201 })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    )
  }
}