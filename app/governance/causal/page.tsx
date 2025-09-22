'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Define the shape of a causal relation for the frontend
interface CausalRelation {
  id: string;
  from: string;
  to: string;
  direction: 'positive' | 'negative';
  confidence: number;
  enabled: boolean; // UI state
}

export default function CausalGovernancePage() {
  const [relations, setRelations] = useState<CausalRelation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, the data and query would be dynamic.
        // For now, we send a placeholder to get the graph.
        const response = await fetch('/api/governance/causal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            data: [], // Placeholder
            query: "get_full_graph" // Placeholder
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch causal model from the server.');
        }

        const result = await response.json();
        const relationsWithState = result.relations.map((r: any) => ({ ...r, enabled: true }));
        setRelations(relationsWithState);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  const handleToggle = (relationId: string) => {
    setRelations(prevRelations =>
      prevRelations.map(r =>
        r.id === relationId ? { ...r, enabled: !r.enabled } : r
      )
    )
    // In a real app, this would call another API endpoint to persist the change.
    console.log(`Toggled relation ${relationId}.`)
  }

  if (loading) {
    return <div className="p-4">Loading Causal Model...</div>
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Causal Model Governance</CardTitle>
          <CardDescription>
            Review and manage the causal relationships discovered by the AI. 
            Disabling an edge will prevent the agent from using it in its reasoning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Variable</TableHead>
                <TableHead>Target Variable</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relations.map((relation) => (
                <TableRow key={relation.id}>
                  <TableCell>{relation.from}</TableCell>
                  <TableCell>{relation.to}</TableCell>
                  <TableCell>
                    <Badge variant={relation.direction === 'positive' ? 'default' : 'secondary'}>
                      {relation.direction.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{(relation.confidence * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={relation.enabled}
                        onCheckedChange={() => handleToggle(relation.id)}
                        id={`switch-${relation.id}`}
                      />
                      <label htmlFor={`switch-${relation.id}`}>
                        {relation.enabled ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}