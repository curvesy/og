'use client'

import { DataTable } from '@/components/ui/data-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

type Policy = {
  id: string
  name: string
  server: string
  scopes: string[]
  status: 'Active' | 'Inactive'
}

const policies: Policy[] = [
    { id: 'pol-001', name: 'Default Web Search Policy', server: 'srv-001', scopes: ['execute:tool:web_search'], status: 'Active' },
    { id: 'pol-002', name: 'Causal Reasoning Access', server: 'srv-002', scopes: ['execute:causal-reasoning'], status: 'Active' },
    { id: 'pol-003', name: 'Document Processing (Read-Only)', server: 'srv-003', scopes: ['read:doc'], status: 'Inactive' },
    { id: 'pol-004', name: 'Knowledge Graph Access', server: 'srv-004', scopes: ['read:graph'], status: 'Active' },
]

const columns: ColumnDef<Policy>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'server',
    header: 'Server',
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
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.original.status
        const variant = status === 'Active' ? 'default' : 'secondary'
        return <Badge variant={variant}>{status}</Badge>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm">
          Edit <Pencil className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]

export default function McpPoliciesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Policies</CardTitle>
        <CardDescription>
          Manage scope rules and safety gates for MCP servers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={policies} />
      </CardContent>
    </Card>
  )
}
