import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Simple test API called');
    return NextResponse.json({ 
      message: 'Simple test successful', 
      timestamp: new Date().toISOString(),
      agents: [
        { id: '1', name: 'Test Agent 1' },
        { id: '2', name: 'Test Agent 2' }
      ]
    });
  } catch (error) {
    console.error('Error in simple test route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}