import { Server } from 'socket.io';
import { AgentStatusUpdate, ExecutionUpdate, MCPUpdate } from './socket-client';
import { AgentService } from './agent-service';

export const setupSocket = (io: Server, agentService: AgentService) => {

  // Agent rooms for different agent types
  const agentRooms = new Map<string, Set<string>>();
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join agent room for specific agent updates
    socket.on('join-agent-room', (agentId: string) => {
      socket.join(`agent-${agentId}`);
      if (!agentRooms.has(agentId)) {
        agentRooms.set(agentId, new Set());
      }
      agentRooms.get(agentId)!.add(socket.id);
      console.log(`Client ${socket.id} joined agent room: ${agentId}`);
    });

    // Leave agent room
    socket.on('leave-agent-room', (agentId: string) => {
      socket.leave(`agent-${agentId}`);
      if (agentRooms.has(agentId)) {
        agentRooms.get(agentId)!.delete(socket.id);
        if (agentRooms.get(agentId)!.size === 0) {
          agentRooms.delete(agentId);
        }
      }
      console.log(`Client ${socket.id} left agent room: ${agentId}`);
    });

    // Join system-wide updates room
    socket.on('join-system-room', () => {
      socket.join('system-updates');
      console.log(`Client ${socket.id} joined system updates room`);
    });

    // Join AG-UI events room
    socket.on('join-agui-room', () => {
      socket.join('agui-events');
      console.log(`Client ${socket.id} joined agui-events room`);
    });

    // Agent status updates
    socket.on('agent-status-update', (update: AgentStatusUpdate) => {
      // Broadcast to all clients in the agent room
      io.to(`agent-${update.agentId}`).emit('agent-status-update', update);
      
      // Also broadcast to system room for general monitoring
      io.to('system-updates').emit('agent-status-update', update);
      
      console.log(`Agent status update: ${update.agentId} - ${update.status}`);
    });

    // Execution updates
    socket.on('execution-update', (update: ExecutionUpdate) => {
      // Broadcast to all clients in the agent room
      io.to(`agent-${update.agentId}`).emit('execution-update', update);
      
      // Also broadcast to system room for execution monitoring
      io.to('system-updates').emit('execution-update', update);
      
      console.log(`Execution update: ${update.executionId} - ${update.status}`);
    });

    // MCP server updates
    socket.on('mcp-update', (update: MCPUpdate) => {
      // Broadcast to system room for MCP monitoring
      io.to('system-updates').emit('mcp-update', update);
      
      console.log(`MCP update: ${update.serverId} - ${update.status}`);
    });

    // Workflow updates
    socket.on('workflow-update', (update: any) => {
      // Broadcast to system room for workflow monitoring
      io.to('system-updates').emit('workflow-update', update);
      
      console.log(`Workflow update: ${update.workflowId} - ${update.status}`);
    });

    // Knowledge graph updates
    socket.on('knowledge-graph-update', (update: any) => {
      // Broadcast to system room for knowledge graph monitoring
      io.to('system-updates').emit('knowledge-graph-update', update);
      
      console.log('Knowledge graph update received');
    });

    // Handle messages (legacy support)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up agent rooms
      for (const [agentId, sockets] of agentRooms.entries()) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          agentRooms.delete(agentId);
        }
      }
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to NOVIN AI Platform WebSocket Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });

    // Send initial system status
    socket.emit('system-status', {
      status: 'operational',
      message: 'NOVIN AI Platform is running normally',
      timestamp: new Date().toISOString(),
    });
  });

  // Server-side methods to broadcast updates
  return {
    broadcastAgentStatus: (update: AgentStatusUpdate) => {
      io.to(`agent-${update.agentId}`).emit('agent-status-update', update);
      io.to('system-updates').emit('agent-status-update', update);
    },
    
    broadcastExecutionUpdate: (update: ExecutionUpdate) => {
      io.to(`agent-${update.agentId}`).emit('execution-update', update);
      io.to('system-updates').emit('execution-update', update);
    },
    
    broadcastMCPUpdate: (update: MCPUpdate) => {
      io.to('system-updates').emit('mcp-update', update);
    },
    
    broadcastWorkflowUpdate: (update: any) => {
      io.to('system-updates').emit('workflow-update', update);
    },
    
    broadcastKnowledgeGraphUpdate: (update: any) => {
      io.to('system-updates').emit('knowledge-graph-update', update);
    }
  };
};
