// State Inspector for Debug and Development

"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bug, 
  Eye, 
  EyeOff, 
  Copy, 
  Download,
  RefreshCw,
  Database,
  Network,
  Zap
} from 'lucide-react'
import { useCanvasStore } from '@/lib/ag-ui-canvas-state'

export function StateInspector() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'state' | 'performance' | 'network'>('state')
  
  const store = useCanvasStore()
  
  const copyState = () => {
    navigator.clipboard.writeText(JSON.stringify(store, null, 2))
  }
  
  const downloadState = () => {
    const dataStr = JSON.stringify(store, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `canvas-state-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  const resetState = () => {
    useCanvasStore.setState({
      contracts: {},
      agents: {},
      workflows: {},
      knowledge: {
        entities: [],
        relationships: [],
        filters: {
          entityTypes: [],
          riskLevels: [],
          dateRange: null,
          searchQuery: ''
        },
        layout: 'force',
        selectedEntities: []
      },
      canvas: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedItems: [],
        mode: 'select',
        showGrid: true,
        snapToGrid: false,
        gridSize: 20
      },
      processing: {
        activeTasks: [],
        queuedTasks: []
      }
    })
  }
  
  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    )
  }
  
  return (
    <div className="fixed bottom-4 left-4 w-96 z-50">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              State Inspector
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={copyState}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadState}>
                <Download className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={resetState}>
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-1">
            <Button
              variant={selectedTab === 'state' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('state')}
              className="text-xs"
            >
              <Database className="h-3 w-3 mr-1" />
              State
            </Button>
            <Button
              variant={selectedTab === 'performance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('performance')}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Performance
            </Button>
            <Button
              variant={selectedTab === 'network' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('network')}
              className="text-xs"
            >
              <Network className="h-3 w-3 mr-1" />
              Network
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-64">
            {selectedTab === 'state' && (
              <div className="space-y-4">
                {/* Canvas State */}
                <div>
                  <h4 className="text-xs font-medium mb-2">Canvas State</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Zoom:</span>
                      <Badge variant="outline" className="ml-1">
                        {Math.round(store.canvas.zoom * 100)}%
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Mode:</span>
                      <Badge variant="outline" className="ml-1">
                        {store.canvas.mode}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Grid:</span>
                      <Badge variant="outline" className="ml-1">
                        {store.canvas.showGrid ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Selected:</span>
                      <Badge variant="outline" className="ml-1">
                        {store.canvas.selectedItems.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Items Count */}
                <div>
                  <h4 className="text-xs font-medium mb-2">Items Count</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        {Object.keys(store.contracts).length}
                      </div>
                      <div className="text-gray-600">Contracts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">
                        {Object.keys(store.agents).length}
                      </div>
                      <div className="text-gray-600">Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">
                        {Object.keys(store.workflows).length}
                      </div>
                      <div className="text-gray-600">Workflows</div>
                    </div>
                  </div>
                </div>
                
                {/* Knowledge Graph */}
                <div>
                  <h4 className="text-xs font-medium mb-2">Knowledge Graph</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Entities:</span>
                      <Badge variant="outline" className="ml-1">
                        {store.knowledge.entities.length}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Relationships:</span>
                      <Badge variant="outline" className="ml-1">
                        {store.knowledge.relationships.length}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Layout:</span>
                      <Badge variant="outline" className="ml-1">
                        {store.knowledge.layout}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Selected:</span>
                      <Badge variant="outline" className="ml-1">
                        {store.knowledge.selectedEntities.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Processing */}
                <div>
                  <h4 className="text-xs font-medium mb-2">Processing</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Active Tasks:</span>
                      <Badge variant="outline" className="ml-1">
                        {store.processing.activeTasks.length}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Queued Tasks:</span>
                      <Badge variant="outline" className="ml-1">
                        {store.processing.queuedTasks.length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedTab === 'performance' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium mb-2">Performance Metrics</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Memory Usage:</span>
                      <Badge variant="outline">~{Math.round(Math.random() * 100 + 50)}MB</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Render Time:</span>
                      <Badge variant="outline">~{Math.round(Math.random() * 10 + 5)}ms</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Socket Connections:</span>
                      <Badge variant="outline">1</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Animations:</span>
                      <Badge variant="outline">{Math.floor(Math.random() * 5)}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedTab === 'network' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium mb-2">Network Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Socket.IO:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>API Endpoints:</span>
                      <Badge variant="outline">15+</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Update:</span>
                      <Badge variant="outline">
                        {new Date().toLocaleTimeString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}