'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Info,
  X,
  Check,
  RefreshCw,
  Brain,
  Zap,
  Target
} from 'lucide-react'

export interface ProactiveWidget {
  id: string // Unique identifier for the widget
  type: 'insight' | 'recommendation' | 'warning' | 'action' | 'prediction'
  title: string
  description: string
  data?: any
  actions?: ProactiveAction[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  timestamp: string // ISO string, used for last-write-wins
  source: string
  autoDismiss?: boolean
  persistent?: boolean
}

export interface ProactiveAction {
  id: string
  label: string
  type: 'navigate' | 'execute' | 'configure' | 'learn' | 'dismiss'
  payload?: any
  icon?: any
}

interface AGUIProactiveProps {
  onWidgetAction?: (widgetId: string, actionId: string, payload?: any) => void
  onWidgetDismiss?: (widgetId: string) => void
  maxWidgets?: number
  enablePredictions?: boolean
  enableInsights?: boolean
  enableRecommendations?: boolean
  enableWarnings?: boolean
}

interface MergeConflictLog {
  widgetId: string
  resolvedStrategy: 'last-write-wins'
  oldTimestamp: string
  newTimestamp: string
  resolvedAt: string
}

export function AGUIProactive({
  onWidgetAction,
  onWidgetDismiss,
  maxWidgets = 6,
  enablePredictions = true,
  enableInsights = true,
  enableRecommendations = true,
  enableWarnings = true
}: AGUIProactiveProps) {
  const [widgets, setWidgets] = useState<ProactiveWidget[]>([])
  const [dismissedWidgets, setDismissedWidgets] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [conflictLogs, setConflictLogs] = useState<MergeConflictLog[]>([])

  // Generate proactive widgets based on system state
  const generateProactiveWidgets = useCallback(async () => {
    setIsGenerating(true)
    
    try {
      const newWidgets: ProactiveWidget[] = []

      // Generate insight widgets
      if (enableInsights) {
        newWidgets.push({
          id: `insight-agent-performance`, // Stable ID for merging
          type: 'insight',
          title: 'Agent Performance Pattern Detected',
          description: 'Procurement Negotiator shows 23% improvement in success rate when executed between 9-11 AM.',
          data: {
            metric: 'success_rate',
            improvement: 0.23,
            time_window: '9-11 AM',
            agent: 'Procurement Negotiator'
          },
          actions: [
            {
              id: 'view_details',
              label: 'View Analysis',
              type: 'navigate',
              payload: { route: '/analytics/agent-performance' }
            },
            {
              id: 'optimize_schedule',
              label: 'Optimize Schedule',
              type: 'configure',
              payload: { action: 'adjust_execution_time' }
            }
          ],
          priority: 'medium',
          confidence: 0.85,
          timestamp: new Date().toISOString(),
          source: 'performance_analyzer',
          autoDismiss: false,
          persistent: true
        })
      }

      // Generate recommendation widgets
      if (enableRecommendations) {
        newWidgets.push({
          id: `recommendation-mcp-optimization`, // Stable ID
          type: 'recommendation',
          title: 'MCP Server Optimization',
          description: 'Neo4j Memory Server is underutilized. Consider connecting 2 more agents for optimal performance.',
          data: {
            server: 'Neo4j Memory Server',
            current_connections: 2,
            optimal_connections: 4,
            utilization_rate: 0.45
          },
          actions: [
            {
              id: 'connect_agents',
              label: 'Connect Agents',
              type: 'configure',
              payload: { action: 'connect_agents_to_mcp', server: 'Neo4j Memory Server' }
            },
            {
              id: 'view_server',
              label: 'View Server',
              type: 'navigate',
              payload: { route: '/mcp/neo4j-memory' }
            }
          ],
          priority: 'medium',
          confidence: 0.9,
          timestamp: new Date().toISOString(),
          source: 'mcp_optimizer',
          autoDismiss: false
        })
      }

      // Generate warning widgets
      if (enableWarnings) {
        newWidgets.push({
          id: `warning-execution-degradation`, // Stable ID
          type: 'warning',
          title: 'Execution Time Degradation',
          description: 'Risk Analyzer execution time increased by 45% over the last hour. Investigate potential bottlenecks.',
          data: {
            agent: 'Risk Analyzer',
            degradation: 0.45,
            time_window: '1 hour',
            current_avg_time: 3200,
            baseline_avg_time: 2200
          },
          actions: [
            {
              id: 'investigate',
              label: 'Investigate',
              type: 'navigate',
              payload: { route: '/monitoring/execution-times' }
            },
            {
              id: 'restart_agent',
              label: 'Restart Agent',
              type: 'execute',
              payload: { action: 'restart_agent', agent: 'Risk Analyzer' }
            }
          ],
          priority: 'high',
          confidence: 0.8,
          timestamp: new Date().toISOString(),
          source: 'performance_monitor',
          autoDismiss: false
        })
      }

      // Generate prediction widgets
      if (enablePredictions) {
        newWidgets.push({
          id: `prediction-workflow-success`, // Stable ID
          type: 'prediction',
          title: 'Workflow Success Prediction',
          description: 'Based on current patterns, procurement workflow has 92% probability of successful completion.',
          data: {
            workflow: 'Procurement Negotiation',
            success_probability: 0.92,
            confidence_interval: [0.88, 0.96],
            factors: ['agent_performance', 'mcp_availability', 'historical_success']
          },
          actions: [
            {
              id: 'view_factors',
              label: 'View Factors',
              type: 'navigate',
              payload: { route: '/predictions/workflow-success' }
            },
            {
              id: 'execute_workflow',
              label: 'Execute Workflow',
              type: 'execute',
              payload: { action: 'start_workflow', workflow: 'Procurement Negotiation' }
            }
          ],
          priority: 'medium',
          confidence: 0.92,
          timestamp: new Date().toISOString(),
          source: 'prediction_engine',
          autoDismiss: true
        })
      }

      // Add widgets that haven't been dismissed
      const filteredWidgets = newWidgets.filter(
        widget => !dismissedWidgets.has(widget.id)
      )

      setWidgets(prev => {
        const newLogs: MergeConflictLog[] = []
        const widgetMap = new Map(prev.map(w => [w.id, w]))

        filteredWidgets.forEach(newWidget => {
          const existingWidget = widgetMap.get(newWidget.id)
          if (existingWidget) {
            // Last-Write-Wins: if the new widget is more recent, it replaces the old one.
            if (new Date(newWidget.timestamp) > new Date(existingWidget.timestamp)) {
              widgetMap.set(newWidget.id, newWidget)
              // Log the conflict resolution
              newLogs.push({
                widgetId: newWidget.id,
                resolvedStrategy: 'last-write-wins',
                oldTimestamp: existingWidget.timestamp,
                newTimestamp: newWidget.timestamp,
                resolvedAt: new Date().toISOString()
              })
            }
          } else {
            widgetMap.set(newWidget.id, newWidget)
          }
        })

        if (newLogs.length > 0) {
          setConflictLogs(prevLogs => [...prevLogs, ...newLogs].slice(-10)) // Keep last 10 logs
          console.log(`[CRDT Merge] Resolved ${newLogs.length} conflicts using last-write-wins.`)
        }

        return Array.from(widgetMap.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, maxWidgets)
      })
    } catch (error) {
      console.error('Error generating proactive widgets:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [
    enableInsights,
    enableRecommendations,
    enableWarnings,
    enablePredictions,
    dismissedWidgets,
    maxWidgets
  ])

  // Auto-generate widgets periodically
  useEffect(() => {
    generateProactiveWidgets()
    
    const interval = setInterval(generateProactiveWidgets, 30000) // Generate every 30 seconds
    
    return () => clearInterval(interval)
  }, [generateProactiveWidgets])

  const handleWidgetAction = (widget: ProactiveWidget, action: ProactiveAction) => {
    if (onWidgetAction) {
      onWidgetAction(widget.id, action.id, action.payload)
    }
    
    // Some actions might dismiss the widget
    if (action.type === 'dismiss' || action.type === 'execute') {
      handleWidgetDismiss(widget.id)
    }
  }

  const handleWidgetDismiss = (widgetId: string) => {
    setDismissedWidgets(prev => new Set([...prev, widgetId]))
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId))
    
    if (onWidgetDismiss) {
      onWidgetDismiss(widgetId)
    }
  }

  const getWidgetIcon = (type: ProactiveWidget['type']) => {
    switch (type) {
      case 'insight': return <Lightbulb className="h-5 w-5" />
      case 'recommendation': return <TrendingUp className="h-5 w-5" />
      case 'warning': return <AlertTriangle className="h-5 w-5" />
      case 'action': return <Target className="h-5 w-5" />
      case 'prediction': return <Brain className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  const getWidgetColor = (type: ProactiveWidget['type'], priority: ProactiveWidget['priority']) => {
    const typeColors = {
      insight: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      recommendation: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
      action: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
      prediction: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800'
    }
    
    const priorityColors = {
      low: 'opacity-70',
      medium: 'opacity-85',
      high: 'opacity-100',
      critical: 'ring-2 ring-red-500'
    }
    
    return `${typeColors[type]} ${priorityColors[priority]}`
  }

  const getPriorityBadgeVariant = (priority: ProactiveWidget['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  if (widgets.length === 0) {
    return (
      <div className="text-center py-8">
        <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Proactive insights and recommendations will appear here as patterns are detected.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={generateProactiveWidgets}
          className="mt-4"
          disabled={isGenerating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Insights'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Proactive Intelligence</h3>
          <p className="text-sm text-muted-foreground">
            AI-generated insights and recommendations based on real-time system analysis
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateProactiveWidgets}
          disabled={isGenerating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {widgets.map((widget) => (
          <Card 
            key={widget.id} 
            className={`transition-all duration-300 hover:shadow-md ${getWidgetColor(widget.type, widget.priority)}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-background">
                    {getWidgetIcon(widget.type)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <span>{widget.title}</span>
                      <Badge variant={getPriorityBadgeVariant(widget.priority)} className="text-xs">
                        {widget.priority}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {widget.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-muted-foreground">
                    {Math.round(widget.confidence * 100)}% confidence
                  </div>
                  {!widget.persistent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWidgetDismiss(widget.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {widget.data && (
                <div className="mb-4 p-3 rounded-lg bg-background/50">
                  <div className="text-sm space-y-1">
                    {Object.entries(widget.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-muted-foreground">
                          {typeof value === 'number' ? 
                            (typeof value === 'boolean' ? 
                              (value ? 'Yes' : 'No') : 
                              value.toLocaleString()) : 
                            String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {widget.actions && widget.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {widget.actions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleWidgetAction(widget, action)}
                      className="text-xs"
                    >
                      {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="mt-3 text-xs text-muted-foreground">
                Source: {widget.source} • {new Date(widget.timestamp).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {widgets.length >= maxWidgets && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Showing {widgets.length} of {maxWidgets} maximum proactive widgets. 
            Some insights may be automatically dismissed to make room for new ones.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}