// Canvas Toolbar with Mathematical Analysis Controls

"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Move, 
  Plus, 
  Network, 
  Brain, 
  Zap,
  Settings,
  Download,
  Upload
} from 'lucide-react'
import { useCanvasStore } from '@/lib/ag-ui-canvas-state'

export function CanvasToolbar() {
  const { canvas } = useCanvasStore()
  
  const handleZoomIn = () => {
    useCanvasStore.setState((state) => ({
      canvas: {
        ...state.canvas,
        zoom: Math.min(state.canvas.zoom * 1.2, 3)
      }
    }))
  }
  
  const handleZoomOut = () => {
    useCanvasStore.setState((state) => ({
      canvas: {
        ...state.canvas,
        zoom: Math.max(state.canvas.zoom / 1.2, 0.1)
      }
    }))
  }
  
  const toggleGrid = () => {
    useCanvasStore.setState((state) => ({
      canvas: {
        ...state.canvas,
        showGrid: !state.canvas.showGrid
      }
    }))
  }
  
  const setMode = (mode: 'select' | 'pan' | 'create' | 'connect') => {
    useCanvasStore.setState((state) => ({
      canvas: {
        ...state.canvas,
        mode
      }
    }))
  }
  
  return (
    <div className="fixed top-4 left-4 z-50 bg-white border rounded-lg shadow-lg p-2">
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="px-2">
            {Math.round(canvas.zoom * 100)}%
          </Badge>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Mode Controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant={canvas.mode === 'select' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('select')}
          >
            <Move className="h-4 w-4" />
          </Button>
          <Button 
            variant={canvas.mode === 'pan' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('pan')}
          >
            <Move className="h-4 w-4" />
          </Button>
          <Button 
            variant={canvas.mode === 'create' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('create')}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant={canvas.mode === 'connect' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('connect')}
          >
            <Network className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Mathematical Analysis Controls */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" title="Run TDA Analysis">
            <Brain className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" title="Sheaf Consensus">
            <Zap className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* View Controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant={canvas.showGrid ? 'default' : 'outline'} 
            size="sm"
            onClick={toggleGrid}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Import/Export */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}