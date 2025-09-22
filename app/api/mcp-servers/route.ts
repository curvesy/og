import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const mcpServers = await db.mCPServer.findMany({
      include: {
        agents: {
          include: {
            agent: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(mcpServers)
  } catch (error) {
    console.error('Error fetching MCP servers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MCP servers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      type,
      endpoint,
      config,
      isActive
    } = body

    const mcpServer = await db.mCPServer.create({
      data: {
        name,
        type,
        endpoint,
        config: config || {},
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        agents: {
          include: {
            agent: true
          }
        }
      }
    })

    return NextResponse.json(mcpServer, { status: 201 })
  } catch (error) {
    console.error('Error creating MCP server:', error)
    return NextResponse.json(
      { error: 'Failed to create MCP server' },
      { status: 500 }
    )
  }
}