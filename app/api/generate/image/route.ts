import { NextRequest, NextResponse } from 'next/server'
import { AgentService } from '@/lib/agent-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, size = '1024x1024' } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const agentService = AgentService.getInstance()
    const base64Image = await agentService.generateImage(prompt, size)

    return NextResponse.json({
      success: true,
      imageData: base64Image,
      prompt,
      size
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}