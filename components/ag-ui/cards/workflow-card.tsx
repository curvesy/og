// Workflow Card with Mathematical Validation Visualization

"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  GitBranch, 
  Play, 
  Pause, 
  Square, 
  CheckCircle,
  Clock,
  AlertCircle,
  Network,
  Zap
} from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'

interface WorkflowCardProps {
  workflow: {
    id: string
    name: string
    type: string
    status: string
    nodes: Array<any>
    edges: Array<any>
    currentNode: string | null
    progress: number
    position: { x: number; y: number }
    expanded: boolean
  }
  selected: boolean
  onSelect: (id: string) => void
}

export function WorkflowCard({ workflow, selected, onSelect }: WorkflowCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: workflow.id
  })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'border-blue-500 bg-blue-50'
      case 'completed': return 'border-green-500 bg-green-50'
      case 'failed': return 'border-red-500 bg-red-50'
      case 'paused': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }
  
  const getStatusIcon = () => {
    switch (workflow.status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }
  
  const getWorkflowTypeIcon = (type: string) => {
    switch (type) {
      case 'contract-analysis':
        return <Network className="h-4 w-4 text-blue-600" />
      case 'approval-chain':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'compliance-check':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'risk-assessment':
        return <Zap className="h-4 w-4 text-purple-600" />
      default:
        return <GitBranch className="h-4 w-4 text-gray-600" />
    }
  }
  
  const completedNodes = workflow.nodes.filter(node => node.status === 'completed').length
  const totalNodes = workflow.nodes.length
  
  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: workflow.position.x,
        top: workflow.position.y,
        width: 320,
        height: 'auto'
      }}
      className={`cursor-move ${isDragging ? 'z-50' : 'z-10'}`}
      animate={{ 
        scale: isDragging ? 1.05 : selected ? 1.02 : 1,
        boxShadow: selected ? '0 10px 25px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)'
      }}
      transition={{ duration: 0.2 }}
      {...listeners}
      {...attributes}
    >
      <Card 
        className={`border-2 transition-all duration-200 ${getStatusColor(workflow.status)} ${
          selected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => onSelect(workflow.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate flex items-center gap-2">
                {getWorkflowTypeIcon(workflow.type)}
                {workflow.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {workflow.type.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge 
                  variant={workflow.status === 'completed' ? 'default' : 'secondary'} 
                  className="text-xs flex items-center gap-1"
                >
                  {getStatusIcon()}
                  {workflow.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Progress Overview */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Progress</span>
              <span className="text-xs font-bold">
                {completedNodes}/{totalNodes} nodes
              </span>
            </div>
            <Progress value={workflow.progress} className="h-2" />
          </div>
          
          {/* Current Node */}
          {workflow.currentNode && (
            <div className="mb-3 p-2 bg-blue-50 rounded border">
              <div className="text-xs text-gray-600 mb-1">Current Node:</div>
              <div className="text-xs font-medium">
                {workflow.nodes.find(n => n.id === workflow.currentNode)?.type || workflow.currentNode}
              </div>
            </div>
          )}
          
          {/* Workflow Graph Preview */}
          <div className="mb-3">
            <h4 className="text-xs font-medium mb-2">Workflow Graph</h4>
            <div className="relative h-16 bg-gray-50 rounded border overflow-hidden">
              {/* Mini workflow visualization */}
              <svg className="w-full h-full">
                {workflow.edges.map((edge, i) => {
                  const sourceNode = workflow.nodes.find(n => n.id === edge.source)
                  const targetNode = workflow.nodes.find(n => n.id === edge.target)
                  
                  if (!sourceNode || !targetNode) return null
                  
                  const sourceX = (workflow.nodes.indexOf(sourceNode) / (workflow.nodes.length - 1)) * 280 + 20
                  const targetX = (workflow.nodes.indexOf(targetNode) / (workflow.nodes.length - 1)) * 280 + 20
                  
                  return (
                    <line
                      key={i}
                      x1={sourceX}
                      y1={30}
                      x2={targetX}
                      y2={30}
                      stroke="#64748b"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
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
                {workflow.nodes.map((node, i) => {
                  const x = (i / (workflow.nodes.length - 1)) * 280 + 20
                  const isCurrent = node.id === workflow.currentNode
                  const isCompleted = node.status === 'completed'
                  
                  return (
                    <g key={node.id}>
                      <circle
                        cx={x}
                        cy={30}
                        r="8"
                        fill={isCompleted ? '#10b981' : isCurrent ? '#3b82f6' : '#e5e7eb'}
                        stroke={isCurrent ? '#1d4ed8' : '#9ca3af'}
                        strokeWidth={isCurrent ? '2' : '1'}
                      />
                      <text
                        x={x}
                        y={50}
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                      >
                        {node.type.slice(0, 3)}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
          
          {/* Node Status Summary */}
          <div className="mb-3">
            <h4 className="text-xs font-medium mb-2">Node Status</h4>
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div className="text-center">
                <div className="font-bold text-green-600">
                  {workflow.nodes.filter(n => n.status === 'completed').length}
                </div>
                <div className="text-gray-600">Done</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">
                  {workflow.nodes.filter(n => n.status === 'running').length}
                </div>
                <div className="text-gray-600">Running</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">
                  {workflow.nodes.filter(n => n.status === 'pending').length}
                </div>
                <div className="text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">
                  {workflow.nodes.filter(n => n.status === 'failed').length}
                </div>
                <div className="text-gray-600">Failed</div>
              </div>
            </div>
          </div>
          
          {/* Mathematical Validation Status */}
          <div className="mb-3 p-2 bg-purple-50 rounded border">
            <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Mathematical Validation
            </h4>
            <div className="text-xs text-gray-600">
              {workflow.status === 'running' ? 'Validating with TDA + Sheaf consensus...' :
               workflow.status === 'completed' ? 'Mathematical validation passed' :
               'Waiting for validation'}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 pt-3 border-t">
            {workflow.status === 'draft' && (
              <Button variant="outline" size="sm" className="text-xs flex-1">
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
            {workflow.status === 'running' && (
              <>
                <Button variant="outline" size="sm" className="text-xs">
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              </>
            )}
            {workflow.status === 'paused' && (
              <Button variant="outline" size="sm" className="text-xs flex-1">
                <Play className="h-3 w-3 mr-1" />
                Resume
              </Button>
            )}
            <Button variant="outline" size="sm" className="text-xs">
              <GitBranch className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}