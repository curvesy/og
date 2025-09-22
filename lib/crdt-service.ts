import { EventEmitter } from 'events'

export interface CRDTDocument {
  id: string
  type: 'text' | 'json' | 'form' | 'code'
  content: any
  version: number
  createdAt: string
  updatedAt: string
  lastModifiedBy: string
}

export interface CRDTOperation {
  id: string
  documentId: string
  type: 'insert' | 'delete' | 'update' | 'move'
  position: any
  content: any
  author: string
  timestamp: string
  version: number
}

export interface MergeStrategy {
  type: 'last-write-wins' | 'merge-sets' | 'operational-transform' | 'three-way-merge'
  conflictResolution: 'auto' | 'manual' | 'priority-based'
  priority?: 'high' | 'medium' | 'low'
  fields: string[]
}

export interface ConflictResolution {
  operationId: string
  conflictType: 'concurrent-edit' | 'structure-change' | 'data-inconsistency'
  strategy: MergeStrategy
  resolution: any
  resolvedBy: string
  resolvedAt: string
  success: boolean
}

export interface CRDTConfig {
  mergeStrategies: Map<string, MergeStrategy>
  autoResolve: boolean
  conflictLogLevel: 'info' | 'warn' | 'error'
  maxOperationHistory: number
  syncInterval: number
}

export class YjsCRDTService extends EventEmitter {
  private static instance: YjsCRDTService
  private documents: Map<string, CRDTDocument> = new Map()
  private operations: Map<string, CRDTOperation[]> = new Map()
  private mergeStrategies: Map<string, MergeStrategy> = new Map()
  private conflicts: Map<string, ConflictResolution[]> = new Map()
  private config: CRDTConfig
  private isRunning: boolean = false

  static getInstance(): YjsCRDTService {
    if (!YjsCRDTService.instance) {
      YjsCRDTService.instance = new YjsCRDTService()
    }
    return YjsCRDTService.instance
  }

  constructor() {
    super()
    this.initializeCRDTService()
  }

  private async initializeCRDTService() {
    try {
      // Setup default merge strategies
      await this.setupDefaultMergeStrategies()
      
      // Setup configuration
      this.config = {
        mergeStrategies: this.mergeStrategies,
        autoResolve: true,
        conflictLogLevel: 'warn',
        maxOperationHistory: 1000,
        syncInterval: 5000 // 5 seconds
      }
      
      // Start periodic sync
      this.startPeriodicSync()
      
      this.isRunning = true
      console.log('Yjs CRDT service initialized successfully')
    } catch (error) {
      console.error('Error initializing Yjs CRDT service:', error)
    }
  }

  private async setupDefaultMergeStrategies() {
    const defaultStrategies: MergeStrategy[] = [
      {
        type: 'last-write-wins',
        conflictResolution: 'auto',
        priority: 'medium',
        fields: ['timestamp', 'updated_at', 'last_modified']
      },
      {
        type: 'merge-sets',
        conflictResolution: 'auto',
        priority: 'high',
        fields: ['tags', 'categories', 'permissions', 'agent_suggestions']
      },
      {
        type: 'operational-transform',
        conflictResolution: 'auto',
        priority: 'high',
        fields: ['code', 'form_data', 'workflow_configuration']
      },
      {
        type: 'three-way-merge',
        conflictResolution: 'manual',
        priority: 'medium',
        fields: ['description', 'content', 'documentation']
      }
    ]

    for (const strategy of defaultStrategies) {
      this.mergeStrategies.set(strategy.type, strategy)
    }
  }

  private startPeriodicSync() {
    setInterval(() => {
      this.syncDocuments()
    }, this.config.syncInterval)
  }

  public async createDocument(
    id: string,
    type: CRDTDocument['type'],
    content: any,
    author: string
  ): Promise<CRDTDocument> {
    const document: CRDTDocument = {
      id,
      type,
      content,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModifiedBy: author
    }

    this.documents.set(id, document)
    this.operations.set(id, [])

    this.emit('document-created', {
      document,
      timestamp: new Date().toISOString()
    })

    return document
  }

  public async applyOperation(
    documentId: string,
    operation: Omit<CRDTOperation, 'id' | 'timestamp' | 'version'>
  ): Promise<CRDTOperation> {
    const document = this.documents.get(documentId)
    if (!document) {
      throw new Error(`Document not found: ${documentId}`)
    }

    const docOperations = this.operations.get(documentId) || []
    
    // Create operation with metadata
    const crdtOperation: CRDTOperation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      version: document.version + 1
    }

    // Apply operation to document
    const updatedDocument = await this.applyOperationToDocument(document, crdtOperation)
    
    // Check for conflicts with concurrent operations
    const conflicts = await this.detectConflicts(documentId, crdtOperation)
    
    if (conflicts.length > 0) {
      // Resolve conflicts
      const resolutionResults = await this.resolveConflicts(documentId, conflicts)
      
      if (!resolutionResults.every(r => r.success)) {
        // Handle failed conflict resolution
        this.emit('conflict-resolution-failed', {
          documentId,
          operation: crdtOperation,
          conflicts: resolutionResults,
          timestamp: new Date().toISOString()
        })
        
        throw new Error('Conflict resolution failed')
      }
    }

    // Update document and operations
    this.documents.set(documentId, updatedDocument)
    docOperations.push(crdtOperation)
    this.operations.set(documentId, docOperations)

    // Trim operation history if needed
    if (docOperations.length > this.config.maxOperationHistory) {
      this.operations.set(documentId, docOperations.slice(-this.config.maxOperationHistory))
    }

    this.emit('operation-applied', {
      documentId,
      operation: crdtOperation,
      document: updatedDocument,
      timestamp: new Date().toISOString()
    })

    return crdtOperation
  }

  private async applyOperationToDocument(
    document: CRDTDocument,
    operation: CRDTOperation
  ): Promise<CRDTDocument> {
    const updatedDocument: CRDTDocument = {
      ...document,
      version: operation.version,
      updatedAt: operation.timestamp,
      lastModifiedBy: operation.author
    }

    switch (operation.type) {
      case 'insert':
        updatedDocument.content = this.applyInsertOperation(document.content, operation)
        break
      
      case 'delete':
        updatedDocument.content = this.applyDeleteOperation(document.content, operation)
        break
      
      case 'update':
        updatedDocument.content = this.applyUpdateOperation(document.content, operation)
        break
      
      case 'move':
        updatedDocument.content = this.applyMoveOperation(document.content, operation)
        break
    }

    return updatedDocument
  }

  private applyInsertOperation(content: any, operation: CRDTOperation): any {
    if (typeof content === 'string') {
      const position = operation.position || content.length
      return content.slice(0, position) + operation.content + content.slice(position)
    } else if (Array.isArray(content)) {
      const position = operation.position || content.length
      return [...content.slice(0, position), operation.content, ...content.slice(position)]
    } else if (typeof content === 'object' && content !== null) {
      const path = operation.position || []
      return this.insertAtObjectPath(content, path, operation.content)
    }
    
    return content
  }

  private applyDeleteOperation(content: any, operation: CRDTOperation): any {
    if (typeof content === 'string') {
      const position = operation.position || 0
      const length = operation.content || 1
      return content.slice(0, position) + content.slice(position + length)
    } else if (Array.isArray(content)) {
      const position = operation.position || 0
      const length = operation.content || 1
      return [...content.slice(0, position), ...content.slice(position + length)]
    } else if (typeof content === 'object' && content !== null) {
      const path = operation.position || []
      return this.deleteAtObjectPath(content, path)
    }
    
    return content
  }

  private applyUpdateOperation(content: any, operation: CRDTOperation): any {
    if (typeof content === 'object' && content !== null) {
      const path = operation.position || []
      return this.updateAtObjectPath(content, path, operation.content)
    }
    
    return operation.content
  }

  private applyMoveOperation(content: any, operation: CRDTOperation): any {
    if (Array.isArray(content)) {
      const from = operation.position?.from || 0
      const to = operation.position?.to || content.length - 1
      const [movedItem] = content.splice(from, 1)
      content.splice(to, 0, movedItem)
      return [...content]
    }
    
    return content
  }

  private insertAtObjectPath(obj: any, path: string[], value: any): any {
    if (path.length === 0) {
      return value
    }
    
    const [key, ...restPath] = path
    if (obj[key] === undefined || obj[key] === null) {
      obj[key] = restPath.length === 0 ? value : {}
    }
    
    if (restPath.length === 0) {
      obj[key] = value
    } else {
      obj[key] = this.insertAtObjectPath(obj[key], restPath, value)
    }
    
    return { ...obj }
  }

  private deleteAtObjectPath(obj: any, path: string[]): any {
    if (path.length === 0) {
      return {}
    }
    
    const [key, ...restPath] = path
    if (restPath.length === 0) {
      const { [key]: deleted, ...remaining } = obj
      return remaining
    } else {
      obj[key] = this.deleteAtObjectPath(obj[key], restPath)
      return { ...obj }
    }
  }

  private updateAtObjectPath(obj: any, path: string[], value: any): any {
    if (path.length === 0) {
      return value
    }
    
    const [key, ...restPath] = path
    if (restPath.length === 0) {
      obj[key] = value
    } else {
      obj[key] = this.updateAtObjectPath(obj[key], restPath, value)
    }
    
    return { ...obj }
  }

  private async detectConflicts(
    documentId: string,
    newOperation: CRDTOperation
  ): Promise<{ operation: CRDTOperation; strategy: MergeStrategy }[]> {
    const conflicts: { operation: CRDTOperation; strategy: MergeStrategy }[] = []
    const docOperations = this.operations.get(documentId) || []

    for (const existingOperation of docOperations) {
      const conflict = await this.checkOperationConflict(newOperation, existingOperation)
      if (conflict) {
        const strategy = this.getMergeStrategyForOperation(newOperation)
        conflicts.push({
          operation: existingOperation,
          strategy
        })
      }
    }

    return conflicts
  }

  private async checkOperationConflict(
    op1: CRDTOperation,
    op2: CRDTOperation
  ): Promise<boolean> {
    // Check if operations conflict based on type and position
    if (op1.type !== op2.type) {
      return false // Different operation types usually don't conflict
    }

    if (op1.documentId !== op2.documentId) {
      return false // Different documents
    }

    // Check for overlapping positions
    if (this.positionsOverlap(op1.position, op2.position)) {
      return true
    }

    // Check for conflicting field updates
    if (op1.type === 'update' && op2.type === 'update') {
      return this.fieldsConflict(op1.position, op2.position)
    }

    return false
  }

  private positionsOverlap(pos1: any, pos2: any): boolean {
    if (typeof pos1 === 'number' && typeof pos2 === 'number') {
      return pos1 === pos2
    }
    
    if (Array.isArray(pos1) && Array.isArray(pos2)) {
      return pos1.length === pos2.length && pos1.every((val, i) => val === pos2[i])
    }
    
    if (typeof pos1 === 'object' && typeof pos2 === 'object') {
      const keys1 = Object.keys(pos1)
      const keys2 = Object.keys(pos2)
      return keys1.length === keys2.length && keys1.every(key => pos1[key] === pos2[key])
    }
    
    return false
  }

  private fieldsConflict(field1: any, field2: any): boolean {
    if (typeof field1 === 'string' && typeof field2 === 'string') {
      return field1 === field2
    }
    
    if (Array.isArray(field1) && Array.isArray(field2)) {
      return field1.length === field2.length && field1.every((val, i) => val === field2[i])
    }
    
    return false
  }

  private getMergeStrategyForOperation(operation: CRDTOperation): MergeStrategy {
    // Determine merge strategy based on operation type and content
    const defaultStrategy = this.mergeStrategies.get('last-write-wins')!
    
    if (operation.type === 'update') {
      const field = this.getFieldFromPosition(operation.position)
      
      // Check for specialized strategies
      for (const [strategyType, strategy] of this.mergeStrategies) {
        if (strategy.fields.includes(field)) {
          return strategy
        }
      }
    }
    
    return defaultStrategy
  }

  private getFieldFromPosition(position: any): string {
    if (typeof position === 'string') {
      return position
    }
    
    if (Array.isArray(position) && position.length > 0) {
      return position[0]
    }
    
    if (typeof position === 'object' && position !== null) {
      const keys = Object.keys(position)
      return keys[0] || 'unknown'
    }
    
    return 'unknown'
  }

  private async resolveConflicts(
    documentId: string,
    conflicts: { operation: CRDTOperation; strategy: MergeStrategy }[]
  ): Promise<ConflictResolution[]> {
    const resolutionResults: ConflictResolution[] = []

    for (const conflict of conflicts) {
      const resolution = await this.resolveConflict(documentId, conflict.operation, conflict.strategy)
      resolutionResults.push(resolution)
    }

    // Store conflicts for tracking
    const existingConflicts = this.conflicts.get(documentId) || []
    existingConflicts.push(...resolutionResults)
    this.conflicts.set(documentId, existingConflicts)

    return resolutionResults
  }

  private async resolveConflict(
    documentId: string,
    conflictingOperation: CRDTOperation,
    strategy: MergeStrategy
  ): Promise<ConflictResolution> {
    const startTime = Date.now()

    try {
      let resolution: any
      let success = false

      switch (strategy.type) {
        case 'last-write-wins':
          resolution = await this.resolveLastWriteWins(documentId, conflictingOperation)
          success = true
          break
        
        case 'merge-sets':
          resolution = await this.resolveMergeSets(documentId, conflictingOperation)
          success = true
          break
        
        case 'operational-transform':
          resolution = await this.resolveOperationalTransform(documentId, conflictingOperation)
          success = true
          break
        
        case 'three-way-merge':
          resolution = await this.resolveThreeWayMerge(documentId, conflictingOperation)
          success = strategy.conflictResolution === 'auto'
          break
      }

      const conflictResolution: ConflictResolution = {
        operationId: conflictingOperation.id,
        conflictType: 'concurrent-edit',
        strategy,
        resolution,
        resolvedBy: strategy.conflictResolution === 'auto' ? 'system' : 'user',
        resolvedAt: new Date().toISOString(),
        success
      }

      this.emit('conflict-resolved', {
        documentId,
        conflictResolution,
        timestamp: new Date().toISOString()
      })

      return conflictResolution
    } catch (error) {
      const conflictResolution: ConflictResolution = {
        operationId: conflictingOperation.id,
        conflictType: 'concurrent-edit',
        strategy,
        resolution: { error: error instanceof Error ? error.message : 'Unknown error' },
        resolvedBy: 'system',
        resolvedAt: new Date().toISOString(),
        success: false
      }

      return conflictResolution
    }
  }

  private async resolveLastWriteWins(
    documentId: string,
    conflictingOperation: CRDTOperation
  ): Promise<any> {
    // Last-write-wins: keep the operation with the latest timestamp
    const document = this.documents.get(documentId)!
    const operations = this.operations.get(documentId) || []
    
    // Find the latest operation affecting the same position
    const latestOperation = operations
      .filter(op => this.positionsOverlap(op.position, conflictingOperation.position))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

    if (latestOperation && new Date(latestOperation.timestamp) > new Date(conflictingOperation.timestamp)) {
      // Keep the latest operation, discard the conflicting one
      return {
        action: 'keep',
        operation: latestOperation,
        discarded: conflictingOperation
      }
    } else {
      // Keep the conflicting operation
      return {
        action: 'keep',
        operation: conflictingOperation,
        discarded: latestOperation
      }
    }
  }

  private async resolveMergeSets(
    documentId: string,
    conflictingOperation: CRDTOperation
  ): Promise<any> {
    // Merge-sets: combine values from both operations
    const document = this.documents.get(documentId)!
    
    if (Array.isArray(document.content) && Array.isArray(conflictingOperation.content)) {
      // Merge arrays, removing duplicates
      const merged = [...new Set([...document.content, ...conflictingOperation.content])]
      return {
        action: 'merge',
        result: merged,
        operations: [conflictingOperation]
      }
    } else if (typeof document.content === 'object' && typeof conflictingOperation.content === 'object') {
      // Merge objects, combining properties
      const merged = { ...document.content, ...conflictingOperation.content }
      return {
        action: 'merge',
        result: merged,
        operations: [conflictingOperation]
      }
    }
    
    // Fallback to last-write-wins
    return this.resolveLastWriteWins(documentId, conflictingOperation)
  }

  private async resolveOperationalTransform(
    documentId: string,
    conflictingOperation: CRDTOperation
  ): Promise<any> {
    // Operational transform: transform operations to be compatible
    // This is a simplified implementation
    const document = this.documents.get(documentId)!
    
    // For text operations, transform based on relative positions
    if (typeof document.content === 'string' && typeof conflictingOperation.content === 'string') {
      const baseContent = document.content
      const newContent = conflictingOperation.content
      
      // Simple transformation: concatenate if no overlap
      return {
        action: 'transform',
        result: baseContent + newContent,
        operations: [conflictingOperation]
      }
    }
    
    // Fallback to last-write-wins
    return this.resolveLastWriteWins(documentId, conflictingOperation)
  }

  private async resolveThreeWayMerge(
    documentId: string,
    conflictingOperation: CRDTOperation
  ): Promise<any> {
    // Three-way merge: requires manual resolution for complex conflicts
    return {
      action: 'manual',
      conflict: {
        documentId,
        operation: conflictingOperation,
        message: 'Manual resolution required for complex conflict',
        suggestions: [
          'Keep original value',
          'Apply new value',
          'Merge both values',
          'Custom resolution'
        ]
      },
      resolved: false
    }
  }

  private syncDocuments(): void {
    // Simulate document synchronization
    this.emit('documents-synced', {
      documentCount: this.documents.size,
      operationCount: Array.from(this.operations.values()).reduce((sum, ops) => sum + ops.length, 0),
      timestamp: new Date().toISOString()
    })
  }

  // Public API methods
  public getDocument(documentId: string): CRDTDocument | undefined {
    return this.documents.get(documentId)
  }

  public getDocuments(): CRDTDocument[] {
    return Array.from(this.documents.values())
  }

  public getOperations(documentId: string): CRDTOperation[] {
    return this.operations.get(documentId) || []
  }

  public getConflicts(documentId: string): ConflictResolution[] {
    return this.conflicts.get(documentId) || []
  }

  public getMergeStrategies(): MergeStrategy[] {
    return Array.from(this.mergeStrategies.values())
  }

  public addMergeStrategy(strategy: MergeStrategy): void {
    this.mergeStrategies.set(strategy.type, strategy)
  }

  public removeMergeStrategy(strategyType: string): boolean {
    return this.mergeStrategies.delete(strategyType)
  }

  public async testConcurrentEdits(
    documentId: string,
    operations: Omit<CRDTOperation, 'id' | 'timestamp' | 'version'>[]
  ): Promise<{ success: boolean; conflicts: ConflictResolution[] }> {
    try {
      const results: ConflictResolution[] = []
      
      // Apply operations concurrently
      const operationPromises = operations.map(op => 
        this.applyOperation(documentId, op)
      )
      
      const appliedOperations = await Promise.allSettled(operationPromises)
      
      // Check for any conflicts that occurred
      const conflicts = this.getConflicts(documentId)
      
      return {
        success: appliedOperations.every(result => result.status === 'fulfilled'),
        conflicts
      }
    } catch (error) {
      return {
        success: false,
        conflicts: []
      }
    }
  }

  public stop(): void {
    this.isRunning = false
    this.removeAllListeners()
    console.log('Yjs CRDT service stopped')
  }
}