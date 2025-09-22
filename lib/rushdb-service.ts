import { EventEmitter } from 'events'
import { z, ZodError } from 'zod'

// Define Zod schemas for validation
const AgentExecutionSchema = z.object({
  agentId: z.string().min(1),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']),
  model: z.string().optional(),
  duration: z.number().optional(),
  tokensUsed: z.number().optional(),
  mcpCalls: z.array(z.any()).optional()
})

const MCPServerSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  isActive: z.boolean(),
  connectedAgents: z.number().optional(),
  activeConnectedAgents: z.number().optional()
})

const WorkflowDataSchema = z.object({
  workflowId: z.string().min(1),
  name: z.string().min(1),
  type: z.string().optional(),
  isActive: z.boolean().optional(),
  totalExecutions: z.number().optional(),
  successfulExecutions: z.number().optional(),
  avgExecutionTime: z.number().optional()
})

const ProcurementDataSchema = z.object({
  contractId: z.string(),
  vendorId: z.string(),
  amendment: z.string(),
  amount: z.number(),
});

const RiskAssessmentSchema = z.object({
  level: z.enum(['low', 'medium', 'high']),
  score: z.number().min(0).max(1),
  factors: z.array(z.string()).optional(),
  mitigationStrategies: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
})

export interface IngestionConfig {
  source: string
  format: 'json' | 'csv' | 'xml' | 'auto'
  schema?: z.ZodSchema<any>
  validation?: boolean
  transform?: (data: any) => any
  target?: string
}

export interface IngestionResult {
  success: boolean
  recordsProcessed: number
  recordsQuarantined: number
  errors: string[]
  metadata?: any
  processingTime: number
}

export interface QuarantinedRecord {
  record: any
  source: string
  errors: string[]
  quarantinedAt: string
}

export class RushDBService extends EventEmitter {
  private static instance: RushDBService
  private ingestionConfigs: Map<string, IngestionConfig> = new Map()
  private dataSchemas: Map<string, any> = new Map()
  private isRunning: boolean = false
  private quarantineQueue: QuarantinedRecord[] = []

  static getInstance(): RushDBService {
    if (!RushDBService.instance) {
      RushDBService.instance = new RushDBService()
    }
    return RushDBService.instance
  }

  constructor() {
    super()
    this.initializeRushDB()
  }

  private async initializeRushDB() {
    console.log('Initializing RushDB zero-config ingestion service')
    
    // Setup default ingestion configurations
    await this.setupDefaultIngestionConfigs()
    
    // Start RushDB service
    this.startRushDB()
  }

  private async setupDefaultIngestionConfigs() {
    const defaultConfigs: IngestionConfig[] = [
      {
        source: 'agent_executions',
        format: 'json',
        validation: true,
        schema: AgentExecutionSchema,
        target: 'knowledge_graph'
      },
      {
        source: 'mcp_servers',
        format: 'json',
        validation: true,
        schema: MCPServerSchema,
        target: 'knowledge_graph'
      },
      {
        source: 'workflow_data',
        format: 'json',
        validation: true,
        schema: WorkflowDataSchema,
        target: 'knowledge_graph'
      },
      {
        source: 'procurement_data',
        format: 'json',
        validation: true,
        schema: ProcurementDataSchema,
        target: 'knowledge_graph'
      },
      {
        source: 'risk_assessments',
        format: 'json',
        validation: true,
        schema: RiskAssessmentSchema,
        target: 'knowledge_graph'
      }
    ]

    for (const config of defaultConfigs) {
      this.ingestionConfigs.set(config.source, config)
      this.setupIngestionPipeline(config)
    }
  }

  private async setupIngestionPipeline(config: IngestionConfig) {
    try {
      console.log(`Setting up ingestion pipeline for: ${config.source}`)
      
      // Create ingestion pipeline
      const pipeline = {
        source: config.source,
        format: config.format,
        validator: this.createValidator(config),
        transformer: config.transform || this.createTransformer(config),
        target: config.target || 'default',
        status: 'active'
      }

      // Emit pipeline setup event
      this.emit('pipeline-setup', {
        pipeline,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error(`Error setting up ingestion pipeline for ${config.source}:`, error)
    }
  }

  private createValidator(config: IngestionConfig) {
    return (data: any): { valid: boolean; errors: string[] } => {
      if (!config.validation || !config.schema) {
        return { valid: true, errors: [] }
      }

      const result = config.schema.safeParse(data)
      if (result.success) {
        return { valid: true, errors: [] }
      } else {
        const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        return { valid: false, errors }
      }
    }
  }

  private createTransformer(config: IngestionConfig) {
    return (data: any): any => {
      let transformed = { ...data }

      // Apply source-specific transformations
      switch (config.source) {
        case 'agent_executions':
          transformed = this.transformAgentExecutionData(transformed)
          break
        case 'mcp_servers':
          transformed = this.transformMCPData(transformed)
          break
        case 'workflow_data':
          transformed = this.transformWorkflowData(transformed)
          break
        case 'procurement_data':
          transformed = this.transformProcurementData(transformed)
          break
        case 'risk_assessments':
          transformed = this.transformRiskData(transformed)
          break
      }

      // Add metadata
      transformed._ingested_at = new Date().toISOString()
      transformed._source = config.source
      transformed._format = config.format

      return transformed
    }
  }

  private transformAgentExecutionData(data: any): any {
    return {
      ...data,
      // Normalize execution data
      execution_time: data.duration || 0,
      success: data.status === 'COMPLETED',
      agent_type: data.agentType || 'unknown',
      // Extract metadata
      metadata: {
        model: data.model,
        tokens_used: data.tokensUsed || 0,
        mcp_calls: data.mcpCalls || []
      }
    }
  }

  private transformMCPData(data: any): any {
    return {
      ...data,
      // Normalize MCP server data
      server_type: data.type,
      is_active: data.isActive,
      // Extract connection info
      connections: {
        total_agents: data.connectedAgents || 0,
        active_agents: data.activeConnectedAgents || 0
      }
    }
  }

  private transformWorkflowData(data: any): any {
    return {
      ...data,
      // Normalize workflow data
      workflow_type: data.type,
      is_active: data.isActive,
      // Extract execution stats
      execution_stats: {
        total: data.totalExecutions || 0,
        successful: data.successfulExecutions || 0,
        avg_time: data.avgExecutionTime || 0
      }
    }
  }

  private transformProcurementData(data: any): any {
    return {
      ...data,
      // Normalize procurement data
      procurement_type: data.type || 'standard',
      // Extract financial info
      financials: {
        amount: data.amount || 0,
        currency: data.currency || 'USD',
        terms: data.terms || {}
      },
      // Extract supplier info
      supplier: {
        name: data.supplierName || '',
        rating: data.supplierRating || 0
      }
    }
  }

  private transformRiskData(data: any): any {
    return {
      ...data,
      // Normalize risk data
      risk_level: data.level || 'medium',
      risk_score: data.score || 0.5,
      // Extract risk factors
      factors: data.factors || [],
      // Extract mitigation info
      mitigation: {
        strategies: data.mitigationStrategies || [],
        priority: data.priority || 'medium'
      }
    }
  }

  private startRushDB() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('RushDB service started')
    
    // Start ingestion monitoring
    this.startIngestionMonitoring()
  }

  private startIngestionMonitoring() {
    setInterval(() => {
      this.monitorIngestionPipelines()
    }, 5000) // Monitor every 5 seconds
  }

  private monitorIngestionPipelines() {
    for (const [source, config] of this.ingestionConfigs) {
      this.checkPipelineHealth(source, config)
    }
  }

  private checkPipelineHealth(source: string, config: IngestionConfig) {
    // Simulate pipeline health check
    const health = {
      source,
      status: 'healthy',
      throughput: Math.floor(Math.random() * 1000) + 100,
      error_rate: Math.random() * 0.05, // 0-5% error rate
      last_activity: new Date().toISOString()
    }

    this.emit('pipeline-health', health)
  }

  // Public API methods
  public async ingestData(
    source: string, 
    data: any | any[], 
    options: Partial<IngestionConfig> = {}
  ): Promise<IngestionResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let recordsProcessed = 0
    let recordsQuarantined = 0

    try {
      const config = this.ingestionConfigs.get(source)
      if (!config) {
        errors.push(`No ingestion configuration found for source: ${source}`)
        return {
          success: false,
          recordsProcessed: 0,
          recordsQuarantined: 0,
          errors,
          processingTime: Date.now() - startTime
        }
      }

      // Merge options with existing config
      const mergedConfig = { ...config, ...options }
      
      // Normalize data to array
      const dataArray = Array.isArray(data) ? data : [data]
      
      // Process each record
      const processedRecords: any[] = []
      
      for (const record of dataArray) {
        try {
          // Validate record
          const validator = this.createValidator(mergedConfig)
          const validation = validator(record)
          
          if (!validation.valid) {
            errors.push(...validation.errors.map(e => `Record validation failed: ${e}`))
            this.quarantineQueue.push({
              record,
              source,
              errors: validation.errors,
              quarantinedAt: new Date().toISOString()
            })
            recordsQuarantined++
            continue
          }
          
          // Transform record
          const transformer = this.createTransformer(mergedConfig)
          const transformed = transformer(record)
          
          // Add to processed records
          processedRecords.push(transformed)
          recordsProcessed++
          
        } catch (error) {
          const errorMessage = `Record processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMessage)
          this.quarantineQueue.push({
            record,
            source,
            errors: [errorMessage],
            quarantinedAt: new Date().toISOString()
          })
          recordsQuarantined++
        }
      }

      // Ingest processed data
      if (processedRecords.length > 0) {
        await this.ingestToTarget(processedRecords, mergedConfig.target || 'default')
      }

      const result: IngestionResult = {
        success: errors.length === 0 && recordsQuarantined === 0,
        recordsProcessed,
        recordsQuarantined,
        errors,
        processingTime: Date.now() - startTime,
        metadata: {
          source,
          format: mergedConfig.format,
          target: mergedConfig.target
        }
      }

      // Emit ingestion event
      this.emit('data-ingested', {
        result,
        timestamp: new Date().toISOString()
      })

      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(errorMessage)
      
      return {
        success: false,
        recordsProcessed,
        recordsQuarantined,
        errors,
        processingTime: Date.now() - startTime
      }
    }
  }

  private async ingestToTarget(data: any[], target: string) {
    // Simulate ingestion to target system
    console.log(`Ingesting ${data.length} records to target: ${target}`)
    
    // In a real implementation, this would:
    // 1. Connect to the target database/graph
    // 2. Insert/update records
    // 3. Handle conflicts and duplicates
    // 4. Update indexes
    
    // For now, emit event for processing
    this.emit('target-ingestion', {
      target,
      recordCount: data.length,
      timestamp: new Date().toISOString()
    })
  }

  public async ingestJSON(
    source: string, 
    jsonData: string, 
    options?: Partial<IngestionConfig>
  ): Promise<IngestionResult> {
    try {
      const parsed = JSON.parse(jsonData)
      return this.ingestData(source, parsed, { ...options, format: 'json' })
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsQuarantined: 1,
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
        processingTime: 0
      }
    }
  }

  public async ingestCSV(
    source: string, 
    csvData: string, 
    options?: Partial<IngestionConfig>
  ): Promise<IngestionResult> {
    try {
      // Simple CSV parsing (in production, use a proper CSV parser)
      const lines = csvData.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        return {
          success: false,
          recordsProcessed: 0,
          recordsQuarantined: 1,
          errors: ['CSV must have at least a header and one data row'],
          processingTime: 0
        }
      }
      
      const headers = lines[0].split(',').map(h => h.trim())
      const records = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ''
        })
        return record
      })
      
      return this.ingestData(source, records, { ...options, format: 'csv' })
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsQuarantined: 1,
        errors: [`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        processingTime: 0
      }
    }
  }

  public addIngestionConfig(config: IngestionConfig): void {
    this.ingestionConfigs.set(config.source, config)
    this.setupIngestionPipeline(config)
  }

  public removeIngestionConfig(source: string): boolean {
    return this.ingestionConfigs.delete(source)
  }

  public getIngestionConfigs(): IngestionConfig[] {
    return Array.from(this.ingestionConfigs.values())
  }

  public getPipelineStatus(source: string): any {
    const config = this.ingestionConfigs.get(source)
    return {
      source,
      exists: !!config,
      config: config || null,
      status: config ? 'active' : 'inactive'
    }
  }

  public getQuarantineQueue(): QuarantinedRecord[] {
    return this.quarantineQueue
  }

  public clearQuarantineQueue(): void {
    this.quarantineQueue = []
  }

  public stop() {
    this.isRunning = false
    this.removeAllListeners()
    console.log('RushDB service stopped')
  }
}
