import { EventEmitter } from 'events'
import { GraphRAGService } from './graphrag-service'
import { MemgraphService } from './memgraph-service'

export type QueryType = 'symbolic' | 'semantic' | 'hybrid'

export interface QueryRequest {
  query: string
  type?: 'auto' | QueryType
}

export interface QueryPlan {
  originalQuery: string
  determinedType: QueryType
  steps: QueryStep[]
}

export interface QueryStep {
  service: 'memgraph' | 'graphrag'
  query: any
  description: string
}

export interface QueryResult {
  plan: QueryPlan
  data: any
  executionTime: number
}

export class HybridQueryPlanner extends EventEmitter {
  private static instance: HybridQueryPlanner
  private graphragService: GraphRAGService
  private memgraphService: MemgraphService
  private queryStats: Map<string, { totalTime: number; count: number }> = new Map()

  static getInstance(): HybridQueryPlanner {
    if (!HybridQueryPlanner.instance) {
      HybridQueryPlanner.instance = new HybridQueryPlanner()
    }
    return HybridQueryPlanner.instance
  }

  constructor() {
    super()
    this.graphragService = GraphRAGService.getInstance()
    this.memgraphService = MemgraphService.getInstance()
    console.log('Hybrid Query Planner initialized.')
  }

  public async executeQuery(request: QueryRequest): Promise<QueryResult> {
    const startTime = Date.now()
    const plan = this.createPlan(request)
    let finalData: any

    try {
      switch (plan.determinedType) {
        case 'symbolic':
          finalData = await this.executeSymbolicQuery(plan.steps[0].query)
          break
        case 'semantic':
          finalData = await this.executeSemanticQuery(plan.steps[0].query)
          break
        case 'hybrid':
          // For this stub, we'll just execute the symbolic part.
          // A real implementation would combine results.
          console.log('Executing hybrid plan (stub: symbolic part only)')
          finalData = await this.executeSymbolicQuery(plan.steps[0].query)
          break
        default:
          throw new Error('Unknown query type in plan.')
      }

      const executionTime = Date.now() - startTime
      this.logQueryStats(plan.determinedType, executionTime)

      const result: QueryResult = {
        plan,
        data: finalData,
        executionTime,
      }

      this.emit('query-executed', result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Error executing query plan for "${request.query}":`, errorMessage)
      throw error
    }
  }

  private createPlan(request: QueryRequest): QueryPlan {
    const { query, type = 'auto' } = request
    let determinedType: QueryType = 'symbolic' // Default to symbolic

    if (type === 'auto') {
      // Simple keyword-based routing for the prototype
      if (query.match(/find similar|who is like|what is related to/i)) {
        determinedType = 'semantic'
      } else if (query.match(/count|list all|show path/i)) {
        determinedType = 'symbolic'
      }
      // A more advanced planner would use a model to classify the query.
    } else {
      determinedType = type
    }

    const plan: QueryPlan = {
      originalQuery: query,
      determinedType,
      steps: [],
    }

    // Generate steps based on the determined type
    if (determinedType === 'symbolic') {
      plan.steps.push({
        service: 'memgraph',
        query: this.translateToCypher(query),
        description: 'Execute a Cypher query against the knowledge graph.',
      })
    } else if (determinedType === 'semantic') {
      plan.steps.push({
        service: 'graphrag',
        query: { query, top_k: 5 },
        description: 'Perform a semantic vector search using GraphRAG.',
      })
    }

    this.emit('plan-created', plan)
    return plan
  }

  private async executeSymbolicQuery(cypherQuery: string): Promise<any> {
    // In a real implementation, you would connect to Memgraph and run the query.
    // Here we simulate the call.
    console.log(`Executing Cypher: ${cypherQuery}`)
    return this.memgraphService.runQuery(cypherQuery)
  }

  private async executeSemanticQuery(graphragQuery: any): Promise<any> {
    // Simulate the call to the GraphRAG service.
    console.log(`Executing GraphRAG search:`, graphragQuery)
    return this.graphragService.search(graphragQuery.query, graphragQuery.top_k)
  }

  private translateToCypher(naturalLanguageQuery: string): string {
    // This is a simple stub. A real implementation would use an LLM for NL-to-Cypher.
    if (naturalLanguageQuery.toLowerCase().includes('count all agents')) {
      return 'MATCH (a:Agent) RETURN count(a)'
    }
    if (naturalLanguageQuery.toLowerCase().includes('list all workflows')) {
      return 'MATCH (w:Workflow) RETURN w.name'
    }
    return `MATCH (n) WHERE n.name = "${naturalLanguageQuery}" RETURN n`
  }

  private logQueryStats(type: QueryType, time: number): void {
    const stats = this.queryStats.get(type) || { totalTime: 0, count: 0 }
    stats.totalTime += time
    stats.count += 1
    this.queryStats.set(type, stats)
    console.log(`Query Type: ${type}, Avg Time: ${(stats.totalTime / stats.count).toFixed(2)}ms`)
  }

  public getQueryStats() {
    return Object.fromEntries(this.queryStats.entries())
  }
}
