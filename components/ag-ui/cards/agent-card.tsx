// Agent Card with Mathematical Processing Visualization

"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Bot, 
  Brain, 
  Network, 
  Zap, 
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'

interface AgentCardProps {
  agent: {
    id: string
    name: string
    type: string
    status: string
    currentTask: string | null
    progress: number
    tdaProgress: number
    causalAnalysisProgress: number
    sheafConsensusProgress: number
    position: { x: number; y: number }
    connections: string[]
    tokensUsed: number
    latency: number
    confidence: number
  }
  selected: boolean
  onSelect: (id: string) => void
}

export function AgentCard({ agent, selected, onSelect }: AgentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: agent.id
  })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executing': return 'border-blue-500 bg-blue-50'
      case 'thinking': return 'border-yellow-500 bg-yellow-50'
      case 'idle': return 'border-gray-300 bg-gray-50'
      case 'error': return 'border-red-500 bg-red-50'
      default: return 'border-gray-300 bg-white'
    }
  }
  
  const getStatusIcon = () => {
    switch (agent.status) {
      case 'executing':
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'thinking':
        return <Brain className="h-4 w-4 text-yellow-600 animate-pulse" />
      case 'idle':
        return <Bot className="h-4 w-4 text-gray-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }
  
  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'contract-analyzer':
        return <Network className="h-4 w-4 text-blue-600" />
      case 'risk-assessor':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'compliance-checker':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'workflow-orchestrator':
        return <Zap className="h-4 w-4 text-purple-600" />
      default:
        return <Bot className="h-4 w-4 text-gray-600" />
    }
  }
  
  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: agent.position.x,
        top: agent.position.y,
        width: 280,
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
        className={`border-2 transition-all duration-200 ${getStatusColor(agent.status)} ${
          selected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => onSelect(agent.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate flex items-center gap-2">
                {getAgentTypeIcon(agent.type)}
                {agent.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {agent.type.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge 
                  variant={agent.status === 'idle' ? 'secondary' : 'default'} 
                  className="text-xs flex items-center gap-1"
                >
                  {getStatusIcon()}
                  {agent.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Current Task */}
          {agent.currentTask && (
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-1">Current Task:</div>
              <div className="text-xs font-medium">{agent.currentTask}</div>
              <Progress value={agent.progress} className="h-1 mt-1" />
            </div>
          )}
          
          {/* Mathematical Processing Status */}
          {(agent.tdaProgress > 0 || agent.causalAnalysisProgress > 0 || agent.sheafConsensusProgress > 0) && (
            <div className="mb-3 p-2 bg-blue-50 rounded border">
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Mathematical Processing
              </h4>
              <div className="space-y-1">
                {agent.tdaProgress > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span>TDA Analysis</span>
                    <span>{Math.round(agent.tdaProgress)}%</span>
                  </div>
                )}
                {agent.causalAnalysisProgress > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span>Causal Reasoning</span>
                    <span>{Math.round(agent.causalAnalysisProgress)}%</span>
                  </div>
                )}
                {agent.sheafConsensusProgress > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span>Sheaf Consensus</span>
                    <span>{Math.round(agent.sheafConsensusProgress)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Performance Metrics */}
          <div className="mb-3">
            <h4 className="text-xs font-medium mb-2">Performance</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-blue-600">{agent.tokensUsed}</div>
                <div className="text-gray-600">Tokens</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{agent.latency}ms</div>
                <div className="text-gray-600">Latency</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600">{Math.round(agent.confidence * 100)}%</div>
                <div className="text-gray-600">Confidence</div>
              </div>
            </div>
          </div>
          
          {/* Connections */}
          {agent.connections.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium mb-1">
                Connections ({agent.connections.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {agent.connections.slice(0, 3).map((connectionId, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {connectionId.slice(0, 8)}...
                  </Badge>
                ))}
                {agent.connections.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{agent.connections.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" className="text-xs flex-1">
              <Activity className="h-3 w-3 mr-1" />
              Execute
            </Button>
            <Button variant="outline" size="sm" className="text-xs flex-1">
              <Network className="h-3 w-3 mr-1" />
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}