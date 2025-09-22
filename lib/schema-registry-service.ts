import { EventEmitter } from 'events'

export interface SchemaDefinition {
  id: string
  name: string
  type: 'json' | 'avro' | 'protobuf'
  version: number
  schema: any
  compatibility: 'BACKWARD' | 'FORWARD' | 'FULL' | 'NONE'
  validationLevel: 'STRICT' | 'LENIENT' | 'WARNING'
  evolution: 'ALLOWED' | 'DISABLED'
  metadata: {
    description?: string
    owner?: string
    tags?: string[]
    createdAt?: string
    updatedAt?: string
  }
}

export interface ValidationRule {
  id: string
  name: string
  type: 'expectation' | 'constraint' | 'custom'
  definition: any
  severity: 'ERROR' | 'WARNING' | 'INFO'
  enabled: boolean
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  metadata: {
    schemaId: string
    schemaVersion: number
    validatedAt: string
    processingTime: number
  }
}

export interface ValidationError {
  code: string
  message: string
  path?: string
  value?: any
  expected?: any
  actual?: any
}

export interface ValidationWarning {
  code: string
  message: string
  path?: string
  value?: any
  recommendation?: string
}

export interface SchemaEvolutionRequest {
  schemaId: string
  newSchema: any
  evolutionType: 'ADD_FIELD' | 'REMOVE_FIELD' | 'CHANGE_TYPE' | 'ADD_CONSTRAINT'
  reason: string
  force?: boolean
}

export class SchemaRegistryService extends EventEmitter {
  private static instance: SchemaRegistryService
  private schemas: Map<string, SchemaDefinition> = new Map()
  private validationRules: Map<string, ValidationRule> = new Map()
  private versionHistory: Map<string, SchemaDefinition[]> = new Map()
  private isRunning: boolean = false
  private zai: any = null

  static getInstance(): SchemaRegistryService {
    if (!SchemaRegistryService.instance) {
      SchemaRegistryService.instance = new SchemaRegistryService()
    }
    return SchemaRegistryService.instance
  }

  constructor() {
    super()
    this.initializeSchemaRegistry()
  }

  private async initializeSchemaRegistry() {
    try {
      // Initialize ZAI for schema validation and evolution
      const ZAI = await import('z-ai-web-dev-sdk')
      this.zai = await ZAI.create()
      
      // Setup default schemas
      await this.setupDefaultSchemas()
      
      // Setup default validation rules
      await this.setupDefaultValidationRules()
      
      this.isRunning = true
      console.log('Schema registry service initialized successfully')
    } catch (error) {
      console.error('Error initializing schema registry service:', error)
    }
  }

  private async setupDefaultSchemas() {
    const defaultSchemas: SchemaDefinition[] = [
      {
        id: 'agent_execution',
        name: 'Agent Execution Schema',
        type: 'json',
        version: 1,
        schema: {
          type: 'object',
          properties: {
            agentId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
            executionId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
            input: { type: 'object' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] 
            },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            duration: { type: 'number', minimum: 0 },
            output: { type: 'object' },
            error: { type: 'string' }
          },
          required: ['agentId', 'executionId', 'status'],
          additionalProperties: true
        },
        compatibility: 'BACKWARD',
        validationLevel: 'STRICT',
        evolution: 'ALLOWED',
        metadata: {
          description: 'Schema for agent execution events',
          owner: 'system',
          tags: ['execution', 'agent', 'monitoring'],
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'mcp_server_event',
        name: 'MCP Server Event Schema',
        type: 'json',
        version: 1,
        schema: {
          type: 'object',
          properties: {
            serverId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
            serverName: { type: 'string', minLength: 1 },
            eventType: { 
              type: 'string', 
              enum: ['STATUS_CHANGE', 'CONNECTION_UPDATE', 'HEALTH_CHECK'] 
            },
            status: { type: 'boolean' },
            connectedAgents: { type: 'number', minimum: 0 },
            timestamp: { type: 'string', format: 'date-time' },
            metadata: { type: 'object' }
          },
          required: ['serverId', 'serverName', 'eventType', 'status', 'timestamp'],
          additionalProperties: true
        },
        compatibility: 'BACKWARD',
        validationLevel: 'STRICT',
        evolution: 'ALLOWED',
        metadata: {
          description: 'Schema for MCP server events',
          owner: 'system',
          tags: ['mcp', 'server', 'event'],
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'knowledge_graph_update',
        name: 'Knowledge Graph Update Schema',
        type: 'json',
        version: 1,
        schema: {
          type: 'object',
          properties: {
            updateType: { 
              type: 'string', 
              enum: ['NODE_CREATE', 'NODE_UPDATE', 'RELATION_CREATE', 'RELATION_UPDATE'] 
            },
            dataType: { type: 'string', enum: ['entity', 'relation'] },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
            source: { type: 'string', minLength: 1 }
          },
          required: ['updateType', 'dataType', 'data', 'timestamp'],
          additionalProperties: true
        },
        compatibility: 'BACKWARD',
        validationLevel: 'STRICT',
        evolution: 'ALLOWED',
        metadata: {
          description: 'Schema for knowledge graph updates',
          owner: 'system',
          tags: ['knowledge', 'graph', 'update'],
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'workflow_execution',
        name: 'Workflow Execution Schema',
        type: 'json',
        version: 1,
        schema: {
          type: 'object',
          properties: {
            workflowId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
            workflowName: { type: 'string', minLength: 1 },
            executionId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
            status: { 
              type: 'string', 
              enum: ['STARTED', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED'] 
            },
            currentNode: { type: 'string' },
            progress: { type: 'number', minimum: 0, maximum: 100 },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            duration: { type: 'number', minimum: 0 },
            nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  status: { type: 'string' },
                  executionTime: { type: 'number' }
                },
                required: ['id', 'name', 'status']
              }
            }
          },
          required: ['workflowId', 'workflowName', 'executionId', 'status', 'startTime'],
          additionalProperties: true
        },
        compatibility: 'BACKWARD',
        validationLevel: 'STRICT',
        evolution: 'ALLOWED',
        metadata: {
          description: 'Schema for workflow execution events',
          owner: 'system',
          tags: ['workflow', 'execution', 'monitoring'],
          createdAt: new Date().toISOString()
        }
      }
    ]

    for (const schema of defaultSchemas) {
      this.schemas.set(schema.id, schema)
      this.versionHistory.set(schema.id, [schema])
    }
  }

  private async setupDefaultValidationRules() {
    const defaultRules: ValidationRule[] = [
      {
        id: 'required_fields',
        name: 'Required Fields Validation',
        type: 'expectation',
        definition: {
          expectation: 'expect_column_values_to_not_be_null',
          columns: ['id', 'timestamp', 'status']
        },
        severity: 'ERROR',
        enabled: true
      },
      {
        id: 'timestamp_format',
        name: 'Timestamp Format Validation',
        type: 'expectation',
        definition: {
          expectation: 'expect_column_values_to_match_regex',
          column: 'timestamp',
          regex: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$'
        },
        severity: 'ERROR',
        enabled: true
      },
      {
        id: 'enum_values',
        name: 'Enum Values Validation',
        type: 'expectation',
        definition: {
          expectation: 'expect_column_values_to_be_in_set',
          column: 'status',
          value_set: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']
        },
        severity: 'ERROR',
        enabled: true
      },
      {
        id: 'id_format',
        name: 'ID Format Validation',
        type: 'expectation',
        definition: {
          expectation: 'expect_column_values_to_match_regex',
          column: 'id',
          regex: '^[a-zA-Z0-9-]+$'
        },
        severity: 'ERROR',
        enabled: true
      },
      {
        id: 'data_size',
        name: 'Data Size Validation',
        type: 'constraint',
        definition: {
          constraint: 'max_size',
          max_bytes: 1024 * 1024 // 1MB
        },
        severity: 'WARNING',
        enabled: true
      },
      {
        id: 'processing_time',
        name: 'Processing Time Validation',
        type: 'custom',
        definition: {
          validation: 'max_processing_time',
          max_ms: 5000
        },
        severity: 'WARNING',
        enabled: true
      }
    ]

    for (const rule of defaultRules) {
      this.validationRules.set(rule.id, rule)
    }
  }

  public async registerSchema(schema: Omit<SchemaDefinition, 'version' | 'metadata'>): Promise<SchemaDefinition> {
    const existingSchema = this.schemas.get(schema.id)
    const version = existingSchema ? existingSchema.version + 1 : 1
    
    const newSchema: SchemaDefinition = {
      ...schema,
      version,
      metadata: {
        ...schema.metadata,
        createdAt: schema.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    // Validate schema compatibility
    if (existingSchema) {
      const compatibilityResult = await this.validateSchemaCompatibility(existingSchema, newSchema)
      if (!compatibilityResult.valid) {
        throw new Error(`Schema compatibility validation failed: ${compatibilityResult.errors.join(', ')}`)
      }
    }

    this.schemas.set(schema.id, newSchema)
    
    // Update version history
    const history = this.versionHistory.get(schema.id) || []
    history.push(newSchema)
    this.versionHistory.set(schema.id, history)

    this.emit('schema-registered', {
      schema: newSchema,
      timestamp: new Date().toISOString()
    })

    return newSchema
  }

  public async validateData(schemaId: string, data: any): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      const schema = this.schemas.get(schemaId)
      if (!schema) {
        throw new Error(`Schema not found: ${schemaId}`)
      }

      const errors: ValidationError[] = []
      const warnings: ValidationWarning[] = []

      // Validate against schema
      const schemaValidation = await this.validateAgainstSchema(schema, data)
      errors.push(...schemaValidation.errors)
      warnings.push(...schemaValidation.warnings)

      // Apply validation rules
      const ruleValidation = await this.applyValidationRules(schemaId, data)
      errors.push(...ruleValidation.errors)
      warnings.push(...ruleValidation.warnings)

      const result: ValidationResult = {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          schemaId,
          schemaVersion: schema.version,
          validatedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      }

      this.emit('data-validated', {
        result,
        timestamp: new Date().toISOString()
      })

      return result
    } catch (error) {
      const result: ValidationResult = {
        valid: false,
        errors: [{
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown validation error'
        }],
        warnings: [],
        metadata: {
          schemaId,
          schemaVersion: 1,
          validatedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      }

      return result
    }
  }

  private async validateAgainstSchema(schema: SchemaDefinition, data: any): Promise<{ errors: ValidationError[], warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      // Basic JSON Schema validation
      if (schema.type === 'json') {
        const validationResult = this.validateJSONSchema(schema.schema, data)
        errors.push(...validationResult.errors)
        warnings.push(...validationResult.warnings)
      }

      // Additional type-specific validation
      if (schema.validationLevel === 'STRICT') {
        const strictValidation = this.validateStrictRules(schema, data)
        errors.push(...strictValidation.errors)
        warnings.push(...strictValidation.warnings)
      }

    } catch (error) {
      errors.push({
        code: 'SCHEMA_VALIDATION_ERROR',
        message: error instanceof Error ? error.message : 'Schema validation error'
      })
    }

    return { errors, warnings }
  }

  private validateJSONSchema(schema: any, data: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Simplified JSON Schema validation
    const validate = (schemaObj: any, dataObj: any, path: string = ''): void => {
      if (schemaObj.type && typeof dataObj !== schemaObj.type) {
        errors.push({
          code: 'TYPE_MISMATCH',
          message: `Expected ${schemaObj.type}, got ${typeof dataObj}`,
          path,
          value: dataObj,
          expected: schemaObj.type,
          actual: typeof dataObj
        })
      }

      if (schemaObj.properties && typeof dataObj === 'object') {
        for (const [prop, propSchema] of Object.entries(schemaObj.properties)) {
          if (dataObj[prop] === undefined && schemaObj.required?.includes(prop)) {
            errors.push({
              code: 'REQUIRED_PROPERTY_MISSING',
              message: `Required property '${prop}' is missing`,
              path: `${path}.${prop}`
            })
          } else if (dataObj[prop] !== undefined) {
            validate(propSchema, dataObj[prop], `${path}.${prop}`)
          }
        }
      }

      if (schemaObj.enum && !schemaObj.enum.includes(dataObj)) {
        errors.push({
          code: 'ENUM_VALUE_INVALID',
          message: `Value must be one of: ${schemaObj.enum.join(', ')}`,
          path,
          value: dataObj,
          expected: schemaObj.enum,
          actual: dataObj
        })
      }

      if (schemaObj.pattern && typeof dataObj === 'string') {
        const regex = new RegExp(schemaObj.pattern)
        if (!regex.test(dataObj)) {
          errors.push({
            code: 'PATTERN_MISMATCH',
            message: `Value does not match pattern: ${schemaObj.pattern}`,
            path,
            value: dataObj,
            expected: schemaObj.pattern
          })
        }
      }
    }

    validate(schema, data)
    return { errors, warnings }
  }

  private validateStrictRules(schema: SchemaDefinition, data: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Strict validation rules based on schema type
    switch (schema.id) {
      case 'agent_execution':
        if (data.duration && data.duration > 300000) { // 5 minutes
          warnings.push({
            code: 'LONG_EXECUTION_TIME',
            message: 'Execution time exceeds 5 minutes',
            path: 'duration',
            value: data.duration,
            recommendation: 'Consider optimizing the agent or breaking down the task'
          })
        }
        break
      
      case 'mcp_server_event':
        if (data.connectedAgents && data.connectedAgents > 10) {
          warnings.push({
            code: 'HIGH_CONNECTION_COUNT',
            message: 'Unusually high number of connected agents',
            path: 'connectedAgents',
            value: data.connectedAgents,
            recommendation: 'Verify server capacity and consider load balancing'
          })
        }
        break
    }

    return { errors, warnings }
  }

  private async applyValidationRules(schemaId: string, data: any): Promise<{ errors: ValidationError[], warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    for (const [ruleId, rule] of this.validationRules) {
      if (!rule.enabled) continue

      try {
        const ruleResult = await this.executeValidationRule(rule, schemaId, data)
        errors.push(...ruleResult.errors)
        warnings.push(...ruleResult.warnings)
      } catch (error) {
        errors.push({
          code: 'RULE_EXECUTION_ERROR',
          message: `Error executing rule '${rule.name}': ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    return { errors, warnings }
  }

  private async executeValidationRule(rule: ValidationRule, schemaId: string, data: any): Promise<{ errors: ValidationError[], warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    switch (rule.type) {
      case 'expectation':
        const expectationResult = await this.executeExpectation(rule.definition, data)
        if (!expectationResult.valid) {
          const errorOrWarning = rule.severity === 'ERROR' ? errors : warnings
          errorOrWarning.push({
            code: `EXPECTATION_${rule.definition.expectation.toUpperCase()}`,
            message: expectationResult.message,
            recommendation: expectationResult.recommendation
          })
        }
        break
      
      case 'constraint':
        const constraintResult = await this.executeConstraint(rule.definition, data)
        if (!constraintResult.valid) {
          const errorOrWarning = rule.severity === 'ERROR' ? errors : warnings
          errorOrWarning.push({
            code: `CONSTRAINT_${rule.definition.constraint.toUpperCase()}`,
            message: constraintResult.message,
            recommendation: constraintResult.recommendation
          })
        }
        break
      
      case 'custom':
        const customResult = await this.executeCustomValidation(rule.definition, data)
        if (!customResult.valid) {
          const errorOrWarning = rule.severity === 'ERROR' ? errors : warnings
          errorOrWarning.push({
            code: `CUSTOM_${rule.definition.validation.toUpperCase()}`,
            message: customResult.message,
            recommendation: customResult.recommendation
          })
        }
        break
    }

    return { errors, warnings }
  }

  private async executeExpectation(definition: any, data: any): Promise<{ valid: boolean; message: string; recommendation?: string }> {
    // Simulate Great Expectations execution
    switch (definition.expectation) {
      case 'expect_column_values_to_not_be_null':
        const nullColumns = definition.columns.filter((col: string) => data[col] === null || data[col] === undefined)
        if (nullColumns.length > 0) {
          return {
            valid: false,
            message: `Columns ${nullColumns.join(', ')} contain null values`,
            recommendation: 'Ensure required fields are provided'
          }
        }
        break
      
      case 'expect_column_values_to_match_regex':
        if (definition.regex && data[definition.column]) {
          const regex = new RegExp(definition.regex)
          if (!regex.test(data[definition.column])) {
            return {
              valid: false,
              message: `Column ${definition.column} does not match required format`,
              recommendation: 'Check the format and provide valid data'
            }
          }
        }
        break
      
      case 'expect_column_values_to_be_in_set':
        if (definition.value_set && data[definition.column]) {
          if (!definition.value_set.includes(data[definition.column])) {
            return {
              valid: false,
              message: `Column ${definition.column} must be one of: ${definition.value_set.join(', ')}`,
              recommendation: 'Use a valid value from the allowed set'
            }
          }
        }
        break
    }

    return { valid: true, message: 'Expectation validation passed' }
  }

  private async executeConstraint(definition: any, data: any): Promise<{ valid: boolean; message: string; recommendation?: string }> {
    switch (definition.constraint) {
      case 'max_size':
        const dataSize = JSON.stringify(data).length
        if (dataSize > definition.max_bytes) {
          return {
            valid: false,
            message: `Data size (${dataSize} bytes) exceeds maximum allowed (${definition.max_bytes} bytes)`,
            recommendation: 'Reduce data size or increase maximum allowed size'
          }
        }
        break
    }

    return { valid: true, message: 'Constraint validation passed' }
  }

  private async executeCustomValidation(definition: any, data: any): Promise<{ valid: boolean; message: string; recommendation?: string }> {
    switch (definition.validation) {
      case 'max_processing_time':
        if (data.processingTime && data.processingTime > definition.max_ms) {
          return {
            valid: false,
            message: `Processing time (${data.processingTime}ms) exceeds maximum allowed (${definition.max_ms}ms)`,
            recommendation: 'Optimize processing logic or increase timeout'
          }
        }
        break
    }

    return { valid: true, message: 'Custom validation passed' }
  }

  public async requestSchemaEvolution(request: SchemaEvolutionRequest): Promise<SchemaDefinition> {
    try {
      const currentSchema = this.schemas.get(request.schemaId)
      if (!currentSchema) {
        throw new Error(`Schema not found: ${request.schemaId}`)
      }

      // Validate evolution request
      const evolutionValidation = await this.validateSchemaEvolution(currentSchema, request)
      if (!evolutionValidation.valid && !request.force) {
        throw new Error(`Schema evolution validation failed: ${evolutionValidation.errors.join(', ')}`)
      }

      // Create evolved schema
      const evolvedSchema: SchemaDefinition = {
        ...currentSchema,
        version: currentSchema.version + 1,
        schema: this.evolveSchema(currentSchema.schema, request),
        metadata: {
          ...currentSchema.metadata,
          updatedAt: new Date().toISOString()
        }
      }

      // Update schema registry
      this.schemas.set(request.schemaId, evolvedSchema)
      
      // Update version history
      const history = this.versionHistory.get(request.schemaId) || []
      history.push(evolvedSchema)
      this.versionHistory.set(request.schemaId, history)

      this.emit('schema-evolved', {
        schemaId: request.schemaId,
        oldVersion: currentSchema.version,
        newVersion: evolvedSchema.version,
        evolutionType: request.evolutionType,
        timestamp: new Date().toISOString()
      })

      return evolvedSchema
    } catch (error) {
      throw new Error(`Schema evolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async validateSchemaCompatibility(oldSchema: SchemaDefinition, newSchema: SchemaDefinition): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Check compatibility based on compatibility level
    switch (oldSchema.compatibility) {
      case 'BACKWARD':
        // New schema must be readable by old schema readers
        if (!this.isBackwardCompatible(oldSchema.schema, newSchema.schema)) {
          errors.push('Schema is not backward compatible')
        }
        break
      
      case 'FORWARD':
        // Old schema must be readable by new schema readers
        if (!this.isForwardCompatible(oldSchema.schema, newSchema.schema)) {
          errors.push('Schema is not forward compatible')
        }
        break
      
      case 'FULL':
        // Must be both backward and forward compatible
        if (!this.isBackwardCompatible(oldSchema.schema, newSchema.schema) || 
            !this.isForwardCompatible(oldSchema.schema, newSchema.schema)) {
          errors.push('Schema is not fully compatible')
        }
        break
    }

    return { valid: errors.length === 0, errors }
  }

  private async validateSchemaEvolution(schema: SchemaDefinition, request: SchemaEvolutionRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Validate evolution type
    switch (request.evolutionType) {
      case 'REMOVE_FIELD':
        errors.push('Removing fields may break backward compatibility')
        break
      
      case 'CHANGE_TYPE':
        errors.push('Changing field types may break compatibility')
        break
    }

    // Check if evolution is allowed
    if (schema.evolution === 'DISABLED' && !request.force) {
      errors.push('Schema evolution is disabled')
    }

    return { valid: errors.length === 0, errors }
  }

  private evolveSchema(oldSchema: any, request: SchemaEvolutionRequest): any {
    // Simulate schema evolution
    const newSchema = { ...oldSchema }

    switch (request.evolutionType) {
      case 'ADD_FIELD':
        // Add new field to schema
        if (!newSchema.properties) {
          newSchema.properties = {}
        }
        newSchema.properties[request.newSchema.fieldName] = request.newSchema.fieldDefinition
        break
      
      case 'REMOVE_FIELD':
        // Remove field from schema
        if (newSchema.properties && newSchema.properties[request.newSchema.fieldName]) {
          delete newSchema.properties[request.newSchema.fieldName]
        }
        break
      
      case 'CHANGE_TYPE':
        // Change field type
        if (newSchema.properties && newSchema.properties[request.newSchema.fieldName]) {
          newSchema.properties[request.newSchema.fieldName].type = request.newSchema.newType
        }
        break
    }

    return newSchema
  }

  private isBackwardCompatible(oldSchema: any, newSchema: any): boolean {
    // Simplified backward compatibility check
    // New schema should not break old readers
    return true // For demo purposes
  }

  private isForwardCompatible(oldSchema: any, newSchema: any): boolean {
    // Simplified forward compatibility check
    // Old schema should be readable by new readers
    return true // For demo purposes
  }

  public getSchema(schemaId: string): SchemaDefinition | undefined {
    return this.schemas.get(schemaId)
  }

  public getSchemas(): SchemaDefinition[] {
    return Array.from(this.schemas.values())
  }

  public getSchemaHistory(schemaId: string): SchemaDefinition[] {
    return this.versionHistory.get(schemaId) || []
  }

  public getValidationRules(): ValidationRule[] {
    return Array.from(this.validationRules.values())
  }

  public addValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.id, rule)
  }

  public removeValidationRule(ruleId: string): boolean {
    return this.validationRules.delete(ruleId)
  }

  public async exportSchemas(): Promise<any> {
    return {
      schemas: Array.from(this.schemas.values()),
      validationRules: Array.from(this.validationRules.values()),
      versionHistory: Object.fromEntries(this.versionHistory),
      exportedAt: new Date().toISOString()
    }
  }

  public stop(): void {
    this.isRunning = false
    this.removeAllListeners()
    console.log('Schema registry service stopped')
  }
}