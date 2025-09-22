'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'

interface LangSmithPanelProps {
  runId: string
}

// Mock data generation
const generateMockData = (runId: string) => {
    const seed = runId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return {
        latency: (seed % 500) + 50, // 50-550ms
        tokens: (seed % 1000) + 200, // 200-1200 tokens
        cost: ((seed % 100) / 10000).toFixed(5), // $0.0000 - $0.0100
        evalScore: (seed % 4) / 10 + 0.6, // 0.6 - 0.9
    }
}

export function LangSmithPanel({ runId }: LangSmithPanelProps) {
  const mockData = generateMockData(runId)

  return (
    <Card className="my-2 bg-gray-50/50">
      <CardHeader className="p-2">
        <CardTitle className="text-xs font-medium flex justify-between items-center">
          <span>LangSmith Trace</span>
          <a href="#" className="flex items-center text-blue-500 hover:underline">
            Open in Studio <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex justify-around text-xs">
        <div className="text-center">
          <p className="font-semibold">{mockData.latency}ms</p>
          <p className="text-gray-500">Latency</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{mockData.tokens}</p>
          <p className="text-gray-500">Tokens</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">${mockData.cost}</p>
          <p className="text-gray-500">Cost</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{mockData.evalScore}</p>
          <p className="text-gray-500">Eval Score</p>
        </div>
      </CardContent>
    </Card>
  )
}
