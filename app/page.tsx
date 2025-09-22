'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Bot, 
  Brain, 
  Network, 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Database,
  Play,
  FileText,
  Users,
  BarChart3,
  BookOpen,
  Settings,
  Plug,
  Calculator,
  Target,
  Award,
  Globe,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { WorkflowVisualization } from '@/components/workflow-visualization'
import { CopilotFeed } from '@/components/copilot-feed'
import { MetricsDashboard } from '@/components/metrics-dashboard'
import { DocumentExplorer } from '@/components/document-explorer'
import { AGUIMainCanvas } from '@/components/ag-ui/main-canvas'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';

interface Agent {
  id: string
  name: string
  type: string
  status: string
  model: string
}

interface MCPServer {
  id: string
  name: string
  type: string
  isActive: boolean
}

// Fetcher function for agents
const fetchAgents = async (): Promise<Agent[]> => {
  const { data } = await axios.get('/api/agents');
  return data;
};

// Mutation function for executing an agent
const executeAgent = async (variables: { agentId: string, input: any, executionId: string }) => {
  const { data } = await axios.post('/api/agents/executions', {
    agentId: variables.agentId,
    input: variables.input,
    executionId: variables.executionId,
  });
  // After creating the execution, trigger the execution itself
  await axios.post('/api/agents/execute', {
    agentId: variables.agentId,
    input: variables.input,
    executionId: variables.executionId,
  });
  return data;
};

export default function AIAgentDashboard() {
  const { toast } = useToast()
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading: agentsLoading, error: agentsError } = useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  });

  const executionMutation = useMutation({
    mutationFn: executeAgent,
    onSuccess: () => {
      toast({
        title: "Execution Started",
        description: "The agent is now running. See the Live Intelligence Feed for updates.",
      });
      queryClient.invalidateQueries({ queryKey: ['agentExecutions'] }); // Assuming you have a query for executions
    },
    onError: (error) => {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExecuteAgent = (agentId: string) => {
    const executionId = uuidv4();
    const input = {
      // This is a sample input. In a real app, you'd get this from a form.
      query: `Negotiate a procurement deal for 10,000 units of 'Quantum-Resistant Encryption Chips'. Key terms: price below $50/unit, delivery within 60 days, 5-year warranty.`,
    };
    executionMutation.mutate({ agentId, input, executionId });
  };

  const [mcpServers, setMcpServers] = useState<MCPServer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate initial data loading
    const loadData = async () => {
      setLoading(true)
      const mockMcpServers: MCPServer[] = [
        { id: '1', name: 'Neo4j Cypher Server', type: 'NEO4J_CYPHER', isActive: true },
      ]
      setMcpServers(mockMcpServers)
      setLoading(false)
    }
    loadData()
  }, [])

  const getStatusColor = (status: string) => (status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500')
  const getStatusIcon = (status: string) => (status === 'ACTIVE' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Activity className="h-4 w-4 text-gray-500" />)

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-lg font-medium">Initializing AI Agent Platform...</p>
        </div>
      </div>
    )
  }

  if (agentsError) {
    toast({
      title: "Error",
      description: "Failed to load AI agents. Please try again later.",
      variant: "destructive",
    });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-lg font-medium">Could not connect to the AI core.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Enterprise Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-enterprise-gradient rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">OSIRIS</h1>
                  <p className="text-sm text-muted-foreground">Enterprise AI Document Intelligence</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Trust Indicators */}
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="px-3 py-1 border-green-200 text-green-700">
                  <Shield className="h-3 w-3 mr-1" />SOC 2 Compliant
                </Badge>
                <Badge variant="outline" className="px-3 py-1 border-blue-200 text-blue-700">
                  <Target className="h-3 w-3 mr-1" />99.7% Accuracy
                </Badge>
                <Badge variant="outline" className="px-3 py-1 border-purple-200 text-purple-700">
                  <Sparkles className="h-3 w-3 mr-1" />Enterprise AI
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="enterprise-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-mathematical/10 rounded-lg flex items-center justify-center">
                <Calculator className="h-6 w-6 text-mathematical" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">$2.3M</h3>
                <p className="text-sm text-muted-foreground">Risk Prevention Value</p>
                <Badge variant="outline" className="mt-1 text-xs">Mathematical Confidence: 97.3%</Badge>
              </div>
            </div>
          </div>
          
          <div className="enterprise-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-confidence/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-confidence" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">340 Hours</h3>
                <p className="text-sm text-muted-foreground">Time Saved Monthly</p>
                <Badge variant="outline" className="mt-1 text-xs">GPU Accelerated</Badge>
              </div>
            </div>
          </div>
          
          <div className="enterprise-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-enterprise-gradient rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">15,429</h3>
                <p className="text-sm text-muted-foreground">Knowledge Connections</p>
                <Badge variant="outline" className="mt-1 text-xs">Cognee AI Memory</Badge>
              </div>
            </div>
          </div>
        </div>

        <MetricsDashboard />

        <Tabs defaultValue="canvas" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="canvas" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Document Studio</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>AI Specialists</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Business Intelligence</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Knowledge Hub</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Enterprise Control</span>
            </TabsTrigger>
            <TabsTrigger value="mcp-console" className="flex items-center space-x-2">
              <Plug className="h-4 w-4" />
              <span>System Integration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="canvas" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">Document Analysis Studio</h3>
                      <p className="text-sm text-muted-foreground">Upload and analyze documents with advanced mathematical AI</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-mathematical text-mathematical">
                        <Calculator className="h-3 w-3 mr-1" />TDA Active
                      </Badge>
                      <Badge variant="outline" className="border-confidence text-confidence">
                        <Brain className="h-3 w-3 mr-1" />AI Ready
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border-2 border-dashed border-border">
                    <AGUIMainCanvas />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Brain className="h-4 w-4 mr-2" />
                      Start Analysis
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Analysis Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Document Processing</span>
                      <Badge variant="outline" className="text-xs">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mathematical Analysis</span>
                      <Badge variant="outline" className="text-xs border-mathematical text-mathematical">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Assessment</span>
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">AI Confidence</h4>
                  <div className="confidence-indicator">
                    <span className="text-sm">97.3%</span>
                  </div>
                  <div className="confidence-bar mt-2">
                    <div className="confidence-fill" style={{ width: '97.3%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Based on mathematical models and historical accuracy</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">AI Intelligence Center</h3>
                      <p className="text-sm text-muted-foreground">Real-time interaction with enterprise AI specialists</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />Live
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        <Users className="h-3 w-3 mr-1" />15 Agents
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border border-border">
                    <div style={{ height: '500px' }}>
                      <CopilotFeed />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Available AI Specialists</h4>
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={getStatusColor(agent.status)}>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.model}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(agent.status)}
                          <Button
                            onClick={() => handleExecuteAgent(agent.id)}
                            disabled={executionMutation.isPending}
                            size="sm"
                            variant="outline"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Agent Performance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium text-mathematical">98.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="text-sm font-medium text-confidence">1.2s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tasks Completed</span>
                      <span className="text-sm font-medium">1,247</span>
                    </div>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Quick Deploy</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Contract Analysis
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calculator className="h-4 w-4 mr-2" />
                      Risk Assessment
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Business Intelligence
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">Business Intelligence Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Advanced workflow visualization and analytics</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-mathematical text-mathematical">
                        <BarChart3 className="h-3 w-3 mr-1" />Real-time
                      </Badge>
                      <Badge variant="outline" className="border-confidence text-confidence">
                        <TrendingUp className="h-3 w-3 mr-1" />Analytics
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <WorkflowVisualization 
                      workflow={{ id: 'procurement-negotiation', name: 'Procurement Negotiation Workflow' }}
                      onNodeClick={(node) => toast({ title: "Node Selected", description: `Selected node: ${node.name}` })}
                      onExecutionControl={(action) => toast({ title: "Execution Control", description: `${action} action initiated` })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Workflow Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Workflows</span>
                      <Badge variant="outline" className="text-xs">12</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-sm font-medium text-mathematical">94.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Duration</span>
                      <span className="text-sm font-medium text-confidence">2.3h</span>
                    </div>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Play className="h-4 w-4 mr-2" />
                      Start New Workflow
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Monitor Activity
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Contract Analysis</span>
                      <span className="text-xs text-muted-foreground">2m ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Risk Assessment</span>
                      <span className="text-xs text-muted-foreground">15m ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Compliance Check</span>
                      <span className="text-xs text-muted-foreground">1h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">Knowledge Management Hub</h3>
                      <p className="text-sm text-muted-foreground">Centralized document repository with AI-powered insights</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-mathematical text-mathematical">
                        <BookOpen className="h-3 w-3 mr-1" />15,429 Docs
                      </Badge>
                      <Badge variant="outline" className="border-confidence text-confidence">
                        <Brain className="h-3 w-3 mr-1" />AI Indexed
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border border-border">
                    <DocumentExplorer />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Knowledge Stats</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Documents</span>
                      <span className="text-sm font-medium">15,429</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Processed</span>
                      <span className="text-sm font-medium text-mathematical">98.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Knowledge Graph</span>
                      <span className="text-sm font-medium text-confidence">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Brain className="h-4 w-4 mr-2" />
                      AI Analysis
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Network className="h-4 w-4 mr-2" />
                      Knowledge Graph
                    </Button>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Recent Additions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Q4 Contract Review</span>
                      <span className="text-xs text-muted-foreground">1h ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Compliance Guide</span>
                      <span className="text-xs text-muted-foreground">3h ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Risk Assessment</span>
                      <span className="text-xs text-muted-foreground">5h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">Enterprise Control Center</h3>
                      <p className="text-sm text-muted-foreground">Comprehensive governance, compliance, and model management</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        <Shield className="h-3 w-3 mr-1" />SOC 2
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        <CheckCircle className="h-3 w-3 mr-1" />Compliant
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="enterprise-card p-4">
                      <h4 className="font-medium mb-3">Model Governance</h4>
                      <p className="text-sm text-muted-foreground mb-4">Review and manage AI model behavior and performance</p>
                      <Button asChild className="w-full">
                        <a href="/governance/causal">
                          <Shield className="h-4 w-4 mr-2" />
                          Causal Model Governance
                        </a>
                      </Button>
                    </div>
                    
                    <div className="enterprise-card p-4">
                      <h4 className="font-medium mb-3">Compliance Center</h4>
                      <p className="text-sm text-muted-foreground mb-4">Monitor compliance status and generate reports</p>
                      <Button variant="outline" className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        View Compliance Status
                      </Button>
                    </div>
                    
                    <div className="enterprise-card p-4">
                      <h4 className="font-medium mb-3">Audit Trail</h4>
                      <p className="text-sm text-muted-foreground mb-4">Complete audit logs and activity monitoring</p>
                      <Button variant="outline" className="w-full">
                        <Activity className="h-4 w-4 mr-2" />
                        View Audit Logs
                      </Button>
                    </div>
                    
                    <div className="enterprise-card p-4">
                      <h4 className="font-medium mb-3">Security Settings</h4>
                      <p className="text-sm text-muted-foreground mb-4">Manage security policies and access controls</p>
                      <Button variant="outline" className="w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Security Configuration
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Compliance Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SOC 2 Type II</span>
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700">Compliant</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">GDPR</span>
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700">Compliant</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">HIPAA</span>
                      <Badge variant="outline" className="text-xs border-yellow-200 text-yellow-700">In Progress</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Security Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security Score</span>
                      <span className="text-sm font-medium text-mathematical">98.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Threats Blocked</span>
                      <span className="text-sm font-medium">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Audit</span>
                      <span className="text-sm font-medium text-confidence">2 days ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Policies
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mcp-console" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">System Integration Hub</h3>
                      <p className="text-sm text-muted-foreground">Manage Model Context Protocol servers and system integrations</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        <Plug className="h-3 w-3 mr-1" />Connected
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        <Activity className="h-3 w-3 mr-1" />Active
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="enterprise-card p-4">
                      <h4 className="font-medium mb-3">MCP Server Management</h4>
                      <p className="text-sm text-muted-foreground mb-4">Configure and monitor Model Context Protocol servers</p>
                      <Button asChild className="w-full">
                        <a href="/mcp">
                          <Plug className="h-4 w-4 mr-2" />
                          MCP Console
                        </a>
                      </Button>
                    </div>
                    
                    <div className="enterprise-card p-4">
                      <h4 className="font-medium mb-3">API Integration</h4>
                      <p className="text-sm text-muted-foreground mb-4">Manage external API connections and webhooks</p>
                      <Button variant="outline" className="w-full">
                        <Globe className="h-4 w-4 mr-2" />
                        API Configuration
                      </Button>
                    </div>
                    
                    <div className="enterprise-card p-4">
                      <h4 className="font-medium mb-3">Database Connections</h4>
                      <p className="text-sm text-muted-foreground mb-4">Configure database integrations and data sources</p>
                      <Button variant="outline" className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        Database Settings
                      </Button>
                    </div>
                    
                    <div className="enterprise-card p-4">
                      <h4 className="font-medium mb-3">Service Health</h4>
                      <p className="text-sm text-muted-foreground mb-4">Monitor service status and performance metrics</p>
                      <Button variant="outline" className="w-full">
                        <Activity className="h-4 w-4 mr-2" />
                        Service Monitor
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Active Connections</h4>
                  <div className="space-y-3">
                    {mcpServers.map((server) => (
                      <div key={server.id} className="flex items-center justify-between">
                        <span className="text-sm">{server.name}</span>
                        <Badge variant="outline" className={`text-xs ${server.isActive ? 'border-green-200 text-green-700' : 'border-gray-200 text-gray-700'}`}>
                          {server.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">System Health</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Response Time</span>
                      <span className="text-sm font-medium text-mathematical">45ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Latency</span>
                      <span className="text-sm font-medium text-confidence">12ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium">99.9%</span>
                    </div>
                  </div>
                </div>
                
                <div className="enterprise-card p-4">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Plug className="h-4 w-4 mr-2" />
                      Add New Server
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Test Connections
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}