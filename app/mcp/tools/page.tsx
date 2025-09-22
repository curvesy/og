'use client'

import { DataTable } from '@/components/ui/data-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

type Tool = {
  id: string
  name: string
  server: string
  description: string
  scopes: string[]
}

const tools: Tool[] = [
    { id: 'tool-001', name: 'web_search', server: 'srv-001', description: 'Performs a web search using a search engine.', scopes: ['execute:tool:web_search'] },
    { id: 'tool-002', name: 'causal-reasoning', server: 'srv-002', description: 'Analyzes causal relationships in a dataset.', scopes: ['execute:causal-reasoning'] },
    { id: 'tool-003', name: 'doc-proc', server: 'srv-003', description: 'Processes a document to extract text and metadata.', scopes: ['execute:doc-proc'] },
    { id: 'tool-004', name: 'graph-query', server: 'srv-004', description: 'Queries the external knowledge graph.', scopes: ['read:graph'] },
    { id: 'tool-005', name: 'image-generation', server: 'srv-001', description: 'Generates an image from a text prompt.', scopes: ['execute:tool:image-generation'] },
]

const columns: ColumnDef<Tool>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'server',
    header: 'Server',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'scopes',
    header: 'Required Scopes',
    cell: ({ row }) => {
        const scopes = row.original.scopes
        return <div className="flex flex-wrap gap-1">{scopes.map(scope => <Badge key={scope} variant="outline">{scope}</Badge>)}</div>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm">
          Run <Play className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]

export default function McpToolsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Tools</CardTitle>
        <CardDescription>
          Explore and run available tools from connected MCP servers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={tools} />
      </CardContent>
    </Card>
  )
}
