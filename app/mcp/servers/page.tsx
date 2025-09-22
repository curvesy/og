'use client'

import { DataTable } from '@/components/ui/data-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

type Server = {
  id: string
  name: string
  status: 'Online' | 'Offline' | 'Connecting'
  version: string
  scopes: string[]
  transport: 'HTTP+SSE' | 'STDIO'
}

const servers: Server[] = [
    { id: 'srv-001', name: 'Primary Inference Server', status: 'Online', version: '1.2.3', scopes: ['read:tools', 'execute:tool:web_search'], transport: 'HTTP+SSE' },
    { id: 'srv-002', name: 'Causal Reasoning Engine', status: 'Online', version: '0.9.8', scopes: ['read:tools', 'execute:causal-reasoning'], transport: 'HTTP+SSE' },
    { id: 'srv-003', name: 'Legacy Document Processor', status: 'Connecting', version: '0.5.1', scopes: ['execute:doc-proc'], transport: 'STDIO' },
    { id: 'srv-004', name: 'External Knowledge Graph', status: 'Offline', version: '2.0.0', scopes: ['read:graph'], transport: 'HTTP+SSE' },
]

const columns: ColumnDef<Server>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.original.status
        const variant = status === 'Online' ? 'default' : status === 'Connecting' ? 'secondary' : 'destructive'
        return <Badge variant={variant}>{status}</Badge>
    }
  },
  {
    accessorKey: 'version',
    header: 'Version',
  },
  {
    accessorKey: 'transport',
    header: 'Transport',
  },
  {
    accessorKey: 'scopes',
    header: 'Scopes',
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
          Manage <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]

export default function McpServersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Servers</CardTitle>
        <CardDescription>
          Discover, connect, and manage MCP (Mission Critical Protocol) servers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={servers} />
      </CardContent>
    </Card>
  )
}
