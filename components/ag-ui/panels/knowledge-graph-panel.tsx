// Knowledge Graph Panel with Mathematical Relationships

"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Network, 
  Search, 
  Filter, 
  Brain, 
  Zap,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface KnowledgeGraphPanelProps {
  knowledge: {
    entities: Array<{
      id: string
      label: string
      type: string
      properties: Record<string, any>
      position: { x: number; y: number }
      size: number
      color: string
    }>
    relationships: Array<{
      id: string
      source: string
      target: string
      type: string
      strength: number
      properties: Record<string, any>
    }>
    filters: {
      entityTypes: string[]
      riskLevels: string[]
      dateRange: [Date, Date] | null
      searchQuery: string
    }
    layout: string
    selectedEntities: string[]
  }
  onEntitySelect: (entityIds: string[]) => void
  onFilterChange: (filters: any) => void
}

export function KnowledgeGraphPanel({ 
  knowledge, 
  onEntitySelect, 
  onFilterChange 
}: KnowledgeGraphPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  
  const entityTypes = ['legal_entity', 'contract', 'clause', 'risk', 'regulation']
  
  const filteredEntities = knowledge.entities.filter(entity => {
    const matchesSearch = entity.label.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || entity.type === selectedType
    return matchesSearch && matchesType
  })
  
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'legal_entity':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'contract':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'clause':
        return <FileText className="h-4 w-4 text-yellow-600" />
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'regulation':
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      default:
        return <Network className="h-4 w-4 text-gray-600" />
    }
  }
  
  const getEntityColor = (type: string) => {
    switch (type) {
      case 'legal_entity':
        return 'bg-blue-100 border-blue-300'
      case 'contract':
        return 'bg-green-100 border-green-300'
      case 'clause':
        return 'bg-yellow-100 border-yellow-300'
      case 'risk':
        return 'bg-red-100 border-red-300'
      case 'regulation':
        return 'bg-purple-100 border-purple-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }
  
  return (
    <div className="fixed top-4 right-4 w-80 z-40">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="h-4 w-4" />
            Knowledge Graph
            <Badge variant="outline" className="ml-auto">
              {filteredEntities.length} entities
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-1 flex-wrap">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
                className="text-xs"
              >
                All
              </Button>
              {entityTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="text-xs"
                >
                  {type.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Mathematical Analysis Summary */}
          <div className="p-3 bg-blue-50 rounded-lg border">
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Mathematical Analysis
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-blue-600">
                  {knowledge.relationships.length}
                </div>
                <div className="text-gray-600">Relationships</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">
                  {Math.round(knowledge.relationships.reduce((acc, rel) => acc + rel.strength, 0) / knowledge.relationships.length * 100) || 0}%
                </div>
                <div className="text-gray-600">Avg Strength</div>
              </div>
            </div>
          </div>
          
          {/* Entity List */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredEntities.map(entity => (
                <div
                  key={entity.id}
                  className={`p-2 rounded border cursor-pointer transition-all hover:shadow-md ${
                    getEntityColor(entity.type)
                  } ${
                    knowledge.selectedEntities.includes(entity.id) 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  }`}
                  onClick={() => {
                    const newSelection = knowledge.selectedEntities.includes(entity.id)
                      ? knowledge.selectedEntities.filter(id => id !== entity.id)
                      : [...knowledge.selectedEntities, entity.id]
                    onEntitySelect(newSelection)
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getEntityIcon(entity.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {entity.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {entity.type.replace('_', ' ')}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {entity.size}
                    </Badge>
                  </div>
                  
                  {/* Entity Properties */}
                  {Object.keys(entity.properties).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(entity.properties).slice(0, 3).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {String(value).slice(0, 10)}...
                        </Badge>
                      ))}
                      {Object.keys(entity.properties).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.keys(entity.properties).length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {filteredEntities.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  No entities found matching your criteria
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Quick Actions */}
          <div className="flex gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" className="text-xs flex-1">
              <Brain className="h-3 w-3 mr-1" />
              TDA Analysis
            </Button>
            <Button variant="outline" size="sm" className="text-xs flex-1">
              <Zap className="h-3 w-3 mr-1" />
              Causal Query
            </Button>
          </div>
          
          {/* Layout Controls */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs flex-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Force Layout
            </Button>
            <Button variant="outline" size="sm" className="text-xs flex-1">
              <Network className="h-3 w-3 mr-1" />
              Hierarchy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}