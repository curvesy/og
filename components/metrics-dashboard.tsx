'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gauge, Clock, ShieldCheck, BarChart } from 'lucide-react'

interface RealtimeMetrics {
  streamLag: number // in seconds
  lastCheckpoint: string // ISO timestamp
  schemaValidationRate: number // percentage
  patchSuccessRate: number // percentage
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    streamLag: 0,
    lastCheckpoint: new Date().toISOString(),
    schemaValidationRate: 100,
    patchSuccessRate: 100,
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics({
        streamLag: parseFloat((Math.random() * 5).toFixed(2)), // 0-5 seconds lag
        lastCheckpoint: new Date().toISOString(),
        schemaValidationRate: parseFloat((98 + Math.random() * 2).toFixed(2)), // 98-100%
        patchSuccessRate: parseFloat((99 + Math.random()).toFixed(2)), // 99-100%
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
       <h3 className="text-xl font-semibold">Real-Time System Health</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stream Lag</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.streamLag}s</div>
            <p className="text-xs text-muted-foreground">Kafka consumer group lag</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Checkpoint</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(metrics.lastCheckpoint).toLocaleTimeString()}</div>
            <p className="text-xs text-muted-foreground">Flink savepoint health</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schema Validation</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.schemaValidationRate}%</div>
            <p className="text-xs text-muted-foreground">Records passing validation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patch Success Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.patchSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">Self-reflection dry-run pass rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
