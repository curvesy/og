'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Settings, 
  Eye,
  Network,
  GitBranch,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react'

interface WorkflowNode {
  id: string
  name: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  position: { x: number; y: number }
  data?: any
  executionTime?: number
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  type: string
  condition?: string
}

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentNode: string
  progress: number
  startTime: string
  endTime?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  metadata?: any
}

interface WorkflowVisualizationProps {
  workflow: any
  onNodeClick?: (node: WorkflowNode) => void
  onExecutionControl?: (action: 'start' | 'pause' | 'stop' | 'reset') => void
}

export function WorkflowVisualization({ 
  workflow, 
  onNodeClick, 
  onExecutionControl 
}: WorkflowVisualizationProps) {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)

  useEffect(() => {
    // Initialize workflow visualization
    if (workflow) {
      const mockExecution: WorkflowExecution = {
        id: `exec-${Date.now()}`,
        workflowId: workflow.id,
        status: 'pending',
        currentNode: '',
        progress: 0,
        startTime: new Date().toISOString(),
        nodes: [
          {
            id: 'analyze',
            name: 'Analyze Contract',
            type: 'analysis',
            status: 'pending',
            position: { x: 100, y: 100 },
            data: { description: 'Analyze contract terms and conditions' }
          },
          {
            id: 'negotiate',
            name: 'Negotiate Terms',
            type: 'negotiation',
            status: 'pending',
            position: { x: 400, y: 100 },
            data: { description: 'Negotiate better terms and conditions' }
          },
          {
            id: 'approve',
            name: 'Human Approval',
            type: 'approval',
            status: 'pending',
            position: { x: 700, y: 100 },
            data: { description: 'Requires human approval' }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'analyze',
            target: 'negotiate',
            type: 'sequential'
          },
          {
            id: 'edge-2',
            source: 'negotiate',
            target: 'approve',
            type: 'sequential'
          }
        ]
      }
      setExecution(mockExecution)
    }
  }, [workflow])

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500 border-blue-600'
      case 'completed': return 'bg-green-500 border-green-600'
      case 'failed': return 'bg-red-500 border-red-600'
      case 'paused': return 'bg-yellow-500 border-yellow-600'
      default: return 'bg-gray-200 border-gray-300'
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <Eye className="h-4 w-4" />
      case 'negotiation': return <GitBranch className="h-4 w-4" />
      case 'approval': return <CheckCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-3 w-3 text-blue-500" />
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'failed': return <AlertCircle className="h-3 w-3 text-red-500" />
      case 'paused': return <Pause className="h-3 w-3 text-yellow-500" />
      default: return <Activity className="h-3 w-3 text-gray-500" />
    }
  }

  const simulateExecution = () => {
    if (!execution || isExecuting) return

    setIsExecuting(true)
    setExecution(prev => prev ? { ...prev, status: 'running' } : null)

    const nodes = [...execution.nodes]
    let currentNodeIndex = 0

    const executeNode = () => {
      if (currentNodeIndex >= nodes.length) {
        // Execution completed
        setExecution(prev => prev ? {
          ...prev,
          status: 'completed',
          progress: 100,
          endTime: new Date().toISOString()
        } : null)
        setIsExecuting(false)
        return
      }

      // Update current node status
      nodes[currentNodeIndex].status = 'running'
      setExecution(prev => prev ? {
        ...prev,
        nodes: [...nodes],
        currentNode: nodes[currentNodeIndex].id,
        progress: ((currentNodeIndex + 1) / nodes.length) * 100
      } : null)

      // Simulate node execution time
      setTimeout(() => {
        nodes[currentNodeIndex].status = 'completed'
        nodes[currentNodeIndex].executionTime = Math.floor(Math.random() * 3000) + 1000
        
        setExecution(prev => prev ? {
          ...prev,
          nodes: [...nodes]
        } : null)

        currentNodeIndex++
        executeNode()
      }, Math.floor(Math.random() * 2000) + 1000)
    }

    executeNode()
  }

  const handleControl = (action: 'start' | 'pause' | 'stop' | 'reset') => {
    if (onExecutionControl) {
      onExecutionControl(action)
    }

    switch (action) {
      case 'start':
        simulateExecution()
        break
      case 'pause':
        setIsExecuting(false)
        break
      case 'stop':
        setIsExecuting(false)
        setExecution(prev => prev ? { ...prev, status: 'failed' } : null)
        break
      case 'reset':
        setIsExecuting(false)
        if (execution) {
          const resetNodes = execution.nodes.map(node => ({
            ...node,
            status: 'pending' as const,
            executionTime: undefined
          }))
          setExecution(prev => prev ? {
            ...prev,
            status: 'pending',
            currentNode: '',
            progress: 0,
            nodes: resetNodes,
            endTime: undefined
          } : null)
        }
        break
    }
  }

  if (!execution) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No workflow execution data available. Please select a workflow to visualize.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Execution Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Workflow Execution</span>
              </CardTitle>
              <CardDescription>
                LangGraph v1.0 - Real-time workflow orchestration
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={execution.status === 'running' ? 'default' : 'secondary'}>
                {getStatusIcon(execution.status)}
                <span className="ml-1 capitalize">{execution.status}</span>
              </Badge>
              <Badge variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                Checkpointing
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleControl('start')}
                disabled={execution.status === 'running' || execution.status === 'completed'}
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleControl('pause')}
                disabled={execution.status !== 'running'}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleControl('stop')}
                disabled={execution.status !== 'running'}
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleControl('reset')}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Progress: {Math.round(execution.progress)}%</span>
              {execution.startTime && (
                <span>Started: {new Date(execution.startTime).toLocaleTimeString()}</span>
              )}
              {execution.endTime && (
                <span>Ended: {new Date(execution.endTime).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          
          <Progress value={execution.progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Workflow Visualization */}
      <Tabs defaultValue="visual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visual">Visual Flow</TabsTrigger>
          <TabsTrigger value="nodes">Node Details</TabsTrigger>
          <TabsTrigger value="execution">Execution Log</TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Graph</CardTitle>
              <CardDescription>
                Interactive visualization of agent workflow execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                {/* SVG-based workflow visualization */}
                <svg className="w-full h-full">
                  {/* Edges */}
                  {execution.edges.map((edge) => {
                    const sourceNode = execution.nodes.find(n => n.id === edge.source)
                    const targetNode = execution.nodes.find(n => n.id === edge.target)
                    
                    if (!sourceNode || !targetNode) return null
                    
                    return (
                      <g key={edge.id}>
                        <line
                          x1={sourceNode.position.x + 60}
                          y1={sourceNode.position.y + 30}
                          x2={targetNode.position.x}
                          y2={targetNode.position.y + 30}
                          stroke="#64748b"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                        {edge.condition && (
                          <text
                            x={(sourceNode.position.x + targetNode.position.x) / 2 + 30}
                            y={(sourceNode.position.y + targetNode.position.y) / 2 + 25}
                            className="text-xs fill-muted-foreground"
                          >
                            {edge.condition}
                          </text>
                        )}
                      </g>
                    )
                  })}
                  
                  {/* Arrow marker definition */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#64748b"
                      />
                    </marker>
                  </defs>

                  {/* Nodes */}
                  {execution.nodes.map((node) => (
                    <g key={node.id}>
                      <rect
                        x={node.position.x}
                        y={node.position.y}
                        width="120"
                        height="60"
                        rx="8"
                        className={`${getNodeColor(node.status)} cursor-pointer transition-all duration-200 hover:shadow-md`}
                        onClick={() => {
                          setSelectedNode(node)
                          if (onNodeClick) onNodeClick(node)
                        }}
                      />
                      <text
                        x={node.position.x + 60}
                        y={node.position.y + 25}
                        textAnchor="middle"
                        className="text-sm font-medium fill-white"
                      >
                        {node.name}
                      </text>
                      <text
                        x={node.position.x + 60}
                        y={node.position.y + 45}
                        textAnchor="middle"
                        className="text-xs fill-white/80"
                      >
                        {node.type}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nodes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {execution.nodes.map((node) => (
              <Card 
                key={node.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedNode(node)
                  if (onNodeClick) onNodeClick(node)
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getNodeIcon(node.type)}
                      <CardTitle className="text-sm">{node.name}</CardTitle>
                    </div>
                    {getStatusIcon(node.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{node.type}</Badge>
                    {node.executionTime && (
                      <div className="text-xs text-muted-foreground">
                        Executed in {node.executionTime}ms
                      </div>
                    )}
                    {node.data?.description && (
                      <p className="text-xs text-muted-foreground">
                        {node.data.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <CardTitle>Execution Log</CardTitle>
              <CardDescription>
                Real-time execution events and system logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Workflow initialized successfully</span>
                    <span className="text-muted-foreground ml-auto">
                      {new Date(execution.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {execution.nodes.map((node, index) => (
                    <div key={node.id} className="space-y-1">
                      {node.status === 'completed' && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Node "{node.name}" completed successfully</span>
                          {node.executionTime && (
                            <span className="text-muted-foreground">
                              ({node.executionTime}ms)
                            </span>
                          )}
                          <span className="text-muted-foreground ml-auto">
                            {new Date(Date.now() - (execution.nodes.length - index) * 2000).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      
                      {node.status === 'running' && (
                        <div className="flex items-center space-x-2 text-blue-600">
                          <Clock className="h-3 w-3 animate-pulse" />
                          <span>Node "{node.name}" is running...</span>
                          <span className="text-muted-foreground ml-auto">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {execution.status === 'completed' && (
                    <div className="flex items-center space-x-2 text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>Workflow execution completed successfully</span>
                      <span className="text-muted-foreground ml-auto">
                        {execution.endTime && new Date(execution.endTime).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}