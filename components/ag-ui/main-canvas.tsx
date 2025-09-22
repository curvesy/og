// Main AG-UI Canvas Component - September 20, 2025
// Implements CopilotKit bidirectional pattern + your mathematical advantages

"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCanvasStore, useAGUICanvasSync } from '@/lib/ag-ui-canvas-state'
import { ContractCard } from './cards/contract-card'
import { AgentCard } from './cards/agent-card'
import { WorkflowCard } from './cards/workflow-card'
import { KnowledgeGraphPanel } from './panels/knowledge-graph-panel'
import { CanvasToolbar } from './toolbar/canvas-toolbar'
import { StateInspector } from './debug/state-inspector'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { CopilotChat } from '@copilotkit/react-ui'
import { io } from 'socket.io-client'
import { enhancedContractAgent } from '@/lib/enhanced-ai-service'
import { MathematicalServices } from '@/lib/effect-mathematical-services'

export function AGUIMainCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const {
    contracts,
    agents,
    workflows,
    knowledge,
    canvas,
    processing
  } = useCanvasStore()
  
  // Enable AG-UI bidirectional sync
  useAGUICanvasSync()
  
  // Canvas interaction state
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Real-time updates via Socket.IO + Enhanced Mathematical Services
  useEffect(() => {
    const socket = io('ws://localhost:3000')
    
    // Listen for mathematical analysis progress
    socket.on('contract:analysis:progress', (data) => {
      useCanvasStore.setState((state) => ({
        contracts: {
          ...state.contracts,
          [data.contractId]: {
            ...state.contracts[data.contractId],
            status: 'analyzing'
          }
        },
        processing: {
          ...state.processing,
          activeTasks: state.processing.activeTasks.map(task =>
            task.id === data.contractId 
              ? { ...task, progress: data.progress }
              : task
          )
        }
      }))
    })
    
    // Listen for TDA analysis completion
    socket.on('contract:tda:complete', (data) => {
      useCanvasStore.setState((state) => ({
        contracts: {
          ...state.contracts,
          [data.contractId]: {
            ...state.contracts[data.contractId],
            topologySignature: data.topologySignature,
            riskScore: data.riskScore
          }
        }
      }))
    })
    
    // Listen for Sheaf consensus completion
    socket.on('contract:sheaf:complete', (data) => {
      useCanvasStore.setState((state) => ({
        contracts: {
          ...state.contracts,
          [data.contractId]: {
            ...state.contracts[data.contractId],
            sheafConsensus: data.sheafConsensus
          }
        }
      }))
    })
    
    // Listen for Causal analysis completion
    socket.on('contract:causal:complete', (data) => {
      useCanvasStore.setState((state) => ({
        contracts: {
          ...state.contracts,
          [data.contractId]: {
            ...state.contracts[data.contractId],
            causalAnalysis: data.causalAnalysis
          }
        }
      }))
    })
    
    // Listen for workflow progress
    socket.on('workflow:node:complete', (data) => {
      useCanvasStore.setState((state) => ({
        workflows: {
          ...state.workflows,
          [data.workflowId]: {
            ...state.workflows[data.workflowId],
            currentNode: data.nextNode,
            progress: data.progress,
            nodes: state.workflows[data.workflowId].nodes.map(node =>
              node.id === data.nodeId
                ? { ...node, status: 'completed' }
                : node
            )
          }
        }
      }))
    })
    
    return () => socket.disconnect()
  }, [])
  
  // Handle canvas panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle click or Ctrl+click
      setIsPanning(true)
      setDragStart({ x: e.clientX - canvas.pan.x, y: e.clientY - canvas.pan.y })
    }
  }, [canvas.pan])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      useCanvasStore.setState((state) => ({
        canvas: {
          ...state.canvas,
          pan: {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
          }
        }
      }))
    }
  }, [isPanning, dragStart])
  
  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])
  
  // Handle drag and drop
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event
    const itemId = active.id as string
    
    // Update position based on item type
    if (itemId.startsWith('contract_')) {
      useCanvasStore.setState((state) => ({
        contracts: {
          ...state.contracts,
          [itemId]: {
            ...state.contracts[itemId],
            position: {
              x: state.contracts[itemId].position.x + delta.x,
              y: state.contracts[itemId].position.y + delta.y
            }
          }
        }
      }))
    } else if (itemId.startsWith('agent_')) {
      useCanvasStore.setState((state) => ({
        agents: {
          ...state.agents,
          [itemId]: {
            ...state.agents[itemId],
            position: {
              x: state.agents[itemId].position.x + delta.x,
              y: state.agents[itemId].position.y + delta.y
            }
          }
        }
      }))
    } else if (itemId.startsWith('workflow_')) {
      useCanvasStore.setState((state) => ({
        workflows: {
          ...state.workflows,
          [itemId]: {
            ...state.workflows[itemId],
            position: {
              x: state.workflows[itemId].position.x + delta.x,
              y: state.workflows[itemId].position.y + delta.y
            }
          }
        }
      }))
    }
  }, [])
  
  return (
    <div className="relative w-full h-screen bg-slate-50 overflow-hidden">
      {/* Canvas Toolbar */}
      <CanvasToolbar />
      
      {/* Main Canvas Area */}
      <DndContext onDragEnd={handleDragEnd}>
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(${canvas.pan.x}px, ${canvas.pan.y}px) scale(${canvas.zoom})`,
            backgroundImage: canvas.showGrid ? `
              linear-gradient(to right, rgb(241 245 249) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(241 245 249) 1px, transparent 1px)
            ` : 'none',
            backgroundSize: canvas.showGrid ? `${canvas.gridSize}px ${canvas.gridSize}px` : 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Contract Cards */}
          <AnimatePresence>
            {Object.values(contracts).map((contract) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <ContractCard
                  contract={contract}
                  selected={canvas.selectedItems.includes(contract.id)}
                  onSelect={(id) => selectCanvasItem(id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Agent Cards */}
          <AnimatePresence>
            {Object.values(agents).map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <AgentCard
                  agent={agent}
                  selected={canvas.selectedItems.includes(agent.id)}
                  onSelect={(id) => selectCanvasItem(id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Workflow Cards */}
          <AnimatePresence>
            {Object.values(workflows).map((workflow) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.3 }}
              >
                <WorkflowCard
                  workflow={workflow}
                  selected={canvas.selectedItems.includes(workflow.id)}
                  onSelect={(id) => selectCanvasItem(id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Connection Lines between related items */}
          <svg className="absolute inset-0 pointer-events-none">
            {/* Render connections between agents and contracts */}
            {Object.values(agents).map(agent =>
              agent.connections.map(connectionId => {
                const targetContract = contracts[connectionId]
                if (!targetContract) return null
                
                return (
                  <motion.line
                    key={`${agent.id}-${connectionId}`}
                    x1={agent.position.x + 160}
                    y1={agent.position.y + 80}
                    x2={targetContract.position.x + 160}
                    y2={targetContract.position.y + 100}
                    stroke="rgb(59 130 246)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                  />
                )
              })
            )}
          </svg>
        </div>
      </DndContext>
      
      {/* Knowledge Graph Panel */}
      <KnowledgeGraphPanel 
        knowledge={knowledge}
        onEntitySelect={(entityIds) => selectKnowledgeEntities(entityIds)}
        onFilterChange={(filters) => updateKnowledgeFilters(filters)}
      />
      
      {/* Processing Status Panel */}
      {processing.activeTasks.length > 0 && (
        <div className="fixed top-4 right-4 w-80 bg-white border shadow-lg rounded-lg p-4">
          <h3 className="font-semibold mb-2">Active Analysis</h3>
          {processing.activeTasks.map(task => (
            <div key={task.id} className="mb-2">
              <div className="flex justify-between text-sm">
                <span>{task.type}</span>
                <span>{Math.round(task.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* State Inspector (Debug) */}
      <StateInspector />
      
      {/* CopilotKit Chat with Mathematical Context */}
      <CopilotChat
        className="fixed bottom-4 right-4 w-96 h-[600px]"
        instructions={`
          You are an expert AI assistant for contract analysis with advanced mathematical capabilities.
          
          You can:
          - Create contract cards on the canvas for analysis
          - Run TDA (Topological Data Analysis) for mathematical risk assessment
          - Create agents for specialized analysis tasks
          - Build approval workflows with mathematical validation
          - Query the knowledge graph for legal precedents and relationships
          - Organize canvas layout automatically
          
          Your mathematical superpowers include:
          - TDA for contract relationship analysis (H0, H1, H2 homology)
          - Sheaf consensus for multi-agent decision making
          - Causal reasoning for impact analysis
          - Topological failure detection for risk assessment
          
          Current canvas state:
          - Contracts: ${Object.keys(contracts).length}
          - Agents: ${Object.keys(agents).length}  
          - Workflows: ${Object.keys(workflows).length}
          - Active Tasks: ${processing.activeTasks.length}
          
          Always provide specific, actionable insights based on mathematical analysis.
          Explain complex mathematical concepts in simple terms when helping users.
        `}
      />
    </div>
  )
}

// Helper functions
function selectCanvasItem(itemId: string) {
  useCanvasStore.setState((state) => ({
    canvas: {
      ...state.canvas,
      selectedItems: [itemId]
    }
  }))
}

function selectKnowledgeEntities(entityIds: string[]) {
  useCanvasStore.setState((state) => ({
    knowledge: {
      ...state.knowledge,
      selectedEntities: entityIds
    }
  }))
}

function updateKnowledgeFilters(filters: any) {
  useCanvasStore.setState((state) => ({
    knowledge: {
      ...state.knowledge,
      filters: { ...state.knowledge.filters, ...filters }
    }
  }))
}