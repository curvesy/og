'use client'

import { DataTable } from '@/components/ui/data-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

type Session = {
  id: string
  agent: string
  server: string
  status: 'Active' | 'Completed' | 'Failed'
  startTime: string
  duration: string
}

const sessions: Session[] = [
    { id: 'ses-001', agent: 'Procurement Negotiator', server: 'srv-001', status: 'Completed', startTime: '2025-09-10 10:00:00', duration: '5m 32s' },
    { id: 'ses-002', agent: 'Risk Analyzer', server: 'srv-002', status: 'Active', startTime: '2025-09-10 10:05:00', duration: '2m 10s' },
    { id: 'ses-003', agent: 'Document Processor', server: 'srv-003', status: 'Failed', startTime: '2025-09-10 10:06:00', duration: '1m 5s' },
    { id: 'ses-004', agent: 'Procurement Negotiator', server: 'srv-001', status: 'Completed', startTime: '2025-09-09 14:00:00', duration: '12m 3s' },
]

const columns: ColumnDef<Session>[] = [
  {
    accessorKey: 'id',
    header: 'Session ID',
  },
  {
    accessorKey: 'agent',
    header: 'Agent',
  },
  {
    accessorKey: 'server',
    header: 'Server',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.original.status
        const variant = status === 'Active' ? 'default' : status === 'Completed' ? 'secondary' : 'destructive'
        return <Badge variant={variant}>{status}</Badge>
    }
  },
  {
    accessorKey: 'startTime',
    header: 'Start Time',
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm">
          View <Eye className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]

export default function McpSessionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Sessions</CardTitle>
        <CardDescription>
          Review active and past MCP sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={sessions} />
      </CardContent>
    </Card>
  )
}
