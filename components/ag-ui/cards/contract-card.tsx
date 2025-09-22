// Contract Card with Mathematical Analysis Visualization

"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Network,
  Zap,
  Info
} from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'

interface ContractCardProps {
  contract: {
    id: string
    title: string
    type: string
    status: string
    riskScore: number
    topologySignature: {
      h0_features: number
      h1_features: number  
      h2_features: number
      torsion_features: number
    } | null
    
    sheafConsensus: {
      consensusScore: number
      cohomologyRank: number
      unanimity: boolean
    } | null
    
    causalAnalysis: {
      causalGraph: any
      causalEffects: Array<{
        cause: string
        effect: string
        strength: number
      }>
    } | null
    entities: Array<any>
    clauses: Array<any>
    position: { x: number; y: number }
    size: { width: number; height: number }
    expanded: boolean
    selected: boolean
  }
  selected: boolean
  onSelect: (id: string) => void
}

export function ContractCard({ contract, selected, onSelect }: ContractCardProps) {
  const [showMathDetails, setShowMathDetails] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: contract.id
  })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined
  
  const getRiskColor = (score: number) => {
    if (score > 0.7) return 'border-red-500 bg-red-50'
    if (score > 0.4) return 'border-yellow-500 bg-yellow-50'
    return 'border-green-500 bg-green-50'
  }
  
  const getStatusIcon = () => {
    switch (contract.status) {
      case 'uploading':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'parsing':
      case 'analyzing':
        return <Clock className="h-4 w-4 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }
  
  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: contract.position.x,
        top: contract.position.y,
        width: contract.size.width,
        height: contract.expanded ? 'auto' : contract.size.height
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
        className={`border-2 transition-all duration-200 ${getRiskColor(contract.riskScore)} ${
          selected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => onSelect(contract.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate flex items-center gap-2">
                {getStatusIcon()}
                {contract.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {contract.type.toUpperCase()}
                </Badge>
                <Badge 
                  variant={contract.status === 'completed' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {contract.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-1 ml-2">
              {contract.topologySignature && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMathDetails(!showMathDetails)
                  }}
                  title="Mathematical Analysis"
                >
                  <Network className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  // Toggle expanded state
                }}
                title="Expand/Collapse"
              >
                {contract.expanded ? '−' : '+'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Risk Score with Mathematical Indicator */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium flex items-center gap-1">
                Risk Score
                {contract.topologySignature && (
                  <Zap className="h-3 w-3 text-blue-600" title="Mathematical Analysis Available" />
                )}
              </span>
              <span className="text-xs font-bold">
                {Math.round(contract.riskScore * 100)}/100
              </span>
            </div>
            <Progress 
              value={contract.riskScore * 100} 
              className="h-2"
            />
          </div>
          
          {/* Analysis Progress */}
          {(contract.status === 'parsing' || contract.status === 'analyzing') && (
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-2">
                {contract.status === 'parsing' ? 'Parsing with Unstructured.io + LlamaParse...' : 
                 'Running TDA mathematical analysis...'}
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1 flex-1 bg-blue-200 rounded"
                    animate={{ backgroundColor: ['#dbeafe', '#3b82f6', '#dbeafe'] }}
                    transition={{ 
                      duration: 1.5, 
                      delay: i * 0.2, 
                      repeat: Infinity 
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Enhanced Mathematical Analysis Results */}
          {showMathDetails && (contract.topologySignature || contract.sheafConsensus || contract.causalAnalysis) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 space-y-3"
            >
              {/* TDA Analysis */}
              {contract.topologySignature && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                    <Network className="h-3 w-3" />
                    Topological Analysis (TDA)
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">H₀</div>
                      <div className="text-xs text-gray-600">Components</div>
                      <div className="font-medium">{contract.topologySignature.h0_features}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">H₁</div>
                      <div className="text-xs text-gray-600">Loops</div>
                      <div className="font-medium">{contract.topologySignature.h1_features}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">H₂</div>
                      <div className="text-xs text-gray-600">Voids</div>
                      <div className="font-medium">{contract.topologySignature.h2_features}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">T</div>
                      <div className="text-xs text-gray-600">Torsion</div>
                      <div className="font-medium">{contract.topologySignature.torsion_features}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Sheaf Consensus */}
              {contract.sheafConsensus && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Sheaf Consensus
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{Math.round(contract.sheafConsensus.consensusScore * 100)}%</div>
                      <div className="text-xs text-gray-600">Consensus</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{contract.sheafConsensus.cohomologyRank}</div>
                      <div className="text-xs text-gray-600">Rank</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{contract.sheafConsensus.unanimity ? 'Yes' : 'No'}</div>
                      <div className="text-xs text-gray-600">Unanimous</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Causal Analysis */}
              {contract.causalAnalysis && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Causal Analysis
                  </h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Graph Nodes:</span>
                      <span className="font-medium">{contract.causalAnalysis.causalGraph?.nodes?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Causal Effects:</span>
                      <span className="font-medium">{contract.causalAnalysis.causalEffects?.length || 0}</span>
                    </div>
                    {contract.causalAnalysis.causalEffects?.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-600">Top Effect:</div>
                        <div className="text-xs font-medium">
                          {contract.causalAnalysis.causalEffects[0].cause} → {contract.causalAnalysis.causalEffects[0].effect}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Entities Summary */}
          {contract.entities.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium mb-1">
                Entities ({contract.entities.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {contract.entities.slice(0, 4).map((entity, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {entity.type}: {entity.value.slice(0, 10)}...
                  </Badge>
                ))}
                {contract.entities.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{contract.entities.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* High-Risk Clauses */}
          {contract.clauses.filter(c => c.riskLevel > 0.7).length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-600" />
                High-Risk Clauses
              </h4>
              <div className="space-y-1">
                {contract.clauses
                  .filter(c => c.riskLevel > 0.7)
                  .slice(0, 2)
                  .map((clause, i) => (
                    <div key={i} className="text-xs p-2 bg-red-50 border-l-2 border-red-300 rounded">
                      <div className="font-medium">{clause.type}</div>
                      <div className="text-gray-600">
                        Risk: {Math.round(clause.riskLevel * 100)}%
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {/* Quick Actions */}
          {contract.status === 'completed' && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button variant="outline" size="sm" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Deep Analysis
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}