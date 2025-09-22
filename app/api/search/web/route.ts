import { NextRequest, NextResponse } from 'next/server'
import { AgentService } from '@/lib/agent-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, num = 10 } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const agentService = AgentService.getInstance()
    const searchResults = await agentService.webSearch(query, num)

    return NextResponse.json({
      success: true,
      results: searchResults,
      query,
      count: searchResults.length
    })
  } catch (error) {
    console.error('Error performing web search:', error)
    return NextResponse.json(
      { error: 'Failed to perform web search' },
      { status: 500 }
    )
  }
}