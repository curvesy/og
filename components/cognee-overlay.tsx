'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrainCircuit } from 'lucide-react'

interface CogneeOverlayProps {
  provenance: string
  confidence: number
  triples: { subject: string; predicate: string; object: string }[]
}

export function CogneeOverlay({ provenance, confidence, triples }: CogneeOverlayProps) {
  return (
    <Card className="absolute top-2 right-2 w-64 bg-background/80 backdrop-blur-sm border-dashed">
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold flex items-center"><BrainCircuit className="mr-1 h-4 w-4" /> Cognee Insight</h4>
            <Badge variant={confidence > 0.9 ? 'default' : 'secondary'}>
                Conf: {confidence.toFixed(2)}
            </Badge>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          <strong>Provenance:</strong> {provenance}
        </p>
        <div>
          <p className="text-xs font-semibold mb-1">Triples:</p>
          <ul className="space-y-1">
            {triples.map((triple, index) => (
              <li key={index} className="text-xs">
                <Badge variant="outline">{triple.subject}</Badge>
                <span className="mx-1">-&gt;</span>
                <Badge variant="outline">{triple.predicate}</Badge>
                <span className="mx-1">-&gt;</span>
                <Badge variant="outline">{triple.object}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
