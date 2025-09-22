'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { 
  AgentStatusUpdate, 
  ExecutionUpdate, 
  MCPUpdate 
} from '@/lib/socket-client'

interface UseAgentSocketOptions {
  agentId?: string
  enableSystemUpdates?: boolean
}

interface UseAgentSocketReturn {
  socket: Socket | null
  isConnected: boolean
  agentStatus: AgentStatusUpdate | null
  executionUpdates: ExecutionUpdate[]
  mcpUpdates: MCPUpdate[]
  workflowUpdates: any[]
  knowledgeGraphUpdates: any[]
  joinAgentRoom: (agentId: string) => void
  leaveAgentRoom: (agentId: string) => void
  joinSystemRoom: () => void
}

export function useAgentSocket(
  options: UseAgentSocketOptions = {}
): UseAgentSocketReturn {
  const { agentId: initialAgentId, enableSystemUpdates = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const [agentStatus, setAgentStatus] = useState<AgentStatusUpdate | null>(null)
  const [executionUpdates, setExecutionUpdates] = useState<ExecutionUpdate[]>([])
  const [mcpUpdates, setMcpUpdates] = useState<MCPUpdate[]>([])
  const [workflowUpdates, setWorkflowUpdates] = useState<any[]>([])
  const [knowledgeGraphUpdates, setKnowledgeGraphUpdates] = useState<any[]>([])
  
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Socket connected')
      
      // Join rooms based on options
      if (initialAgentId) {
        socket.emit('join-agent-room', initialAgentId)
      }
      
      if (enableSystemUpdates) {
        socket.emit('join-system-room')
      }
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Socket disconnected')
    })

    // Agent status updates
    socket.on('agent-status-update', (update: AgentStatusUpdate) => {
      setAgentStatus(update)
      console.log('Agent status update received:', update)
    })

    // Execution updates
    socket.on('execution-update', (update: ExecutionUpdate) => {
      setExecutionUpdates(prev => {
        // Keep only the last 50 updates
        const newUpdates = [update, ...prev].slice(0, 50)
        return newUpdates
      })
      console.log('Execution update received:', update)
    })

    // MCP server updates
    socket.on('mcp-update', (update: MCPUpdate) => {
      setMcpUpdates(prev => {
        // Update existing or add new
        const existingIndex = prev.findIndex(u => u.serverId === update.serverId)
        if (existingIndex >= 0) {
          const newUpdates = [...prev]
          newUpdates[existingIndex] = update
          return newUpdates
        }
        return [update, ...prev].slice(0, 20) // Keep last 20
      })
      console.log('MCP update received:', update)
    })

    // Workflow updates
    socket.on('workflow-update', (update: any) => {
      setWorkflowUpdates(prev => {
        // Keep only the last 20 updates
        const newUpdates = [update, ...prev].slice(0, 20)
        return newUpdates
      })
      console.log('Workflow update received:', update)
    })

    // Knowledge graph updates
    socket.on('knowledge-graph-update', (update: any) => {
      setKnowledgeGraphUpdates(prev => {
        // Keep only the last 20 updates
        const newUpdates = [update, ...prev].slice(0, 20)
        return newUpdates
      })
      console.log('Knowledge graph update received:', update)
    })

    // System status
    socket.on('system-status', (status: any) => {
      console.log('System status:', status)
    })

    // Welcome message
    socket.on('message', (msg: any) => {
      console.log('Socket message:', msg)
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [initialAgentId, enableSystemUpdates])

  const joinAgentRoom = (agentId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-agent-room', agentId)
    }
  }

  const leaveAgentRoom = (agentId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-agent-room', agentId)
    }
  }

  const joinSystemRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('join-system-room')
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    agentStatus,
    executionUpdates,
    mcpUpdates,
    workflowUpdates,
    knowledgeGraphUpdates,
    joinAgentRoom,
    leaveAgentRoom,
    joinSystemRoom
  }
}