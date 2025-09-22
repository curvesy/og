import { EventEmitter } from 'events'

export interface EWMAFilter {
  alpha: number // Smoothing factor (0 < alpha <= 1)
  currentValue: number
  timestamp: number
}

export interface CausalEdge {
  from: string
  to: string
  type: string
  strength: number
  confidence: number
  pValue: number
  bootstrapSamples: number
  timestamp: string
}

export interface RegularizationConfig {
  l1Lambda: number // L1 regularization strength
  l2Lambda: number // L2 regularization strength
  maxIterations: number
  convergenceThreshold: number
  learningRate: number
}

export interface BootstrapConfig {
  sampleSize: number
  numSamples: number
  confidenceLevel: number // 0.95 for 95% confidence
  randomSeed?: number
}

export interface NoiseFilteringResult {
  filteredData: any[]
  removedOutliers: number[]
  smoothingMetrics: {
    originalVariance: number
    filteredVariance: number
    noiseReduction: number
  }
}

export interface CausalDiscoveryResult {
  edges: CausalEdge[]
  confidenceIntervals: Map<string, [number, number]>
  significantEdges: CausalEdge[]
  filteredEdges: CausalEdge[]
  discoveryMetrics: {
    totalEdges: number
    significantEdges: number
    averageConfidence: number
    discoveryTime: number
  }
}

export class CausalRobustnessService extends EventEmitter {
  private static instance: CausalRobustnessService
  private ewmaFilters: Map<string, EWMAFilter> = new Map()
  private regularizationConfig: RegularizationConfig
  private bootstrapConfig: BootstrapConfig
  private isRunning: boolean = false
  private zai: any = null

  static getInstance(): CausalRobustnessService {
    if (!CausalRobustnessService.instance) {
      CausalRobustnessService.instance = new CausalRobustnessService()
    }
    return CausalRobustnessService.instance
  }

  constructor() {
    super()
    this.initializeCausalRobustness()
  }

  private async initializeCausalRobustness() {
    try {
      // Initialize ZAI for causal analysis
      const ZAI = await import('z-ai-web-dev-sdk')
      this.zai = await ZAI.create()
      
      // Setup default configurations
      this.setupDefaultConfigs()
      
      // Start noise filtering monitoring
      this.startNoiseFiltering()
      
      this.isRunning = true
      console.log('Causal robustness service initialized successfully')
    } catch (error) {
      console.error('Error initializing causal robustness service:', error)
    }
  }

  private setupDefaultConfigs() {
    this.regularizationConfig = {
      l1Lambda: 0.01,
      l2Lambda: 0.001,
      maxIterations: 1000,
      convergenceThreshold: 1e-6,
      learningRate: 0.01
    }

    this.bootstrapConfig = {
      sampleSize: 100,
      numSamples: 1000,
      confidenceLevel: 0.95,
      randomSeed: 42
    }
  }

  private startNoiseFiltering() {
    // Start EWMA filtering for streaming data
    setInterval(() => {
      this.processStreamingData()
    }, 5000) // Process every 5 seconds
  }

  public async applyEWMAFilter(
    dataStream: any[],
    variableName: string,
    alpha: number = 0.1
  ): Promise<NoiseFilteringResult> {
    try {
      const filter = this.ewmaFilters.get(variableName) || {
        alpha,
        currentValue: 0,
        timestamp: Date.now()
      }

      const filteredData: any[] = []
      const removedOutliers: number[] = []

      for (let i = 0; i < dataStream.length; i++) {
        const dataPoint = dataStream[i]
        const value = this.extractValue(dataPoint, variableName)

        if (value === null || value === undefined) {
          filteredData.push(dataPoint)
          continue
        }

        // Apply EWMA smoothing
        const smoothedValue = alpha * value + (1 - alpha) * filter.currentValue
        filter.currentValue = smoothedValue
        filter.timestamp = Date.now()

        // Detect outliers using statistical methods
        const isOutlier = this.detectOutlier(value, smoothedValue, dataStream, i)
        
        if (isOutlier) {
          removedOutliers.push(i)
        } else {
          // Create filtered data point
          const filteredPoint = { ...dataPoint }
          this.setValue(filteredPoint, variableName, smoothedValue)
          filteredData.push(filteredPoint)
        }
      }

      // Update filter
      this.ewmaFilters.set(variableName, filter)

      // Calculate smoothing metrics
      const originalValues = dataStream.map(d => this.extractValue(d, variableName)).filter(v => v !== null)
      const filteredValues = filteredData.map(d => this.extractValue(d, variableName)).filter(v => v !== null)

      const originalVariance = this.calculateVariance(originalValues)
      const filteredVariance = this.calculateVariance(filteredValues)
      const noiseReduction = originalVariance > 0 ? (originalVariance - filteredVariance) / originalVariance : 0

      const result: NoiseFilteringResult = {
        filteredData,
        removedOutliers,
        smoothingMetrics: {
          originalVariance,
          filteredVariance,
          noiseReduction
        }
      }

      this.emit('ewma-filter-applied', {
        variableName,
        result,
        timestamp: new Date().toISOString()
      })

      return result
    } catch (error) {
      throw new Error(`EWMA filtering failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private detectOutlier(value: number, smoothedValue: number, dataStream: any[], index: number): boolean {
    // Simple outlier detection using Z-score
    const windowSize = Math.min(20, index)
    const startIdx = Math.max(0, index - windowSize)
    const window = dataStream.slice(startIdx, index)
    
    if (window.length < 5) return false // Not enough data for outlier detection

    const values = window.map(d => this.extractValue(d, this.getVariableName(value))).filter(v => v !== null)
    if (values.length < 3) return false

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance = this.calculateVariance(values)
    const stdDev = Math.sqrt(variance)

    if (stdDev === 0) return false

    const zScore = Math.abs((value - mean) / stdDev)
    return zScore > 3 // 3 standard deviations threshold
  }

  private extractValue(dataPoint: any, variableName: string): number {
    // Extract numeric value from data point
    if (typeof dataPoint === 'number') return dataPoint
    if (typeof dataPoint === 'object' && dataPoint !== null) {
      return dataPoint[variableName] || 0
    }
    return 0
  }

  private setValue(dataPoint: any, variableName: string, value: number): void {
    if (typeof dataPoint === 'object' && dataPoint !== null) {
      dataPoint[variableName] = value
    }
  }

  private getVariableName(value: any): string {
    // Get variable name from context (simplified)
    return 'value'
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    return variance
  }

  public async discoverCausalRelationships(
    data: any[],
    variables: string[]
  ): Promise<CausalDiscoveryResult> {
    try {
      const startTime = Date.now()

      // Step 1: Preprocess data with EWMA filtering
      const filteredData: any[] = []
      const preprocessingResults: NoiseFilteringResult[] = []

      for (const variable of variables) {
        const result = await this.applyEWMAFilter(data, variable)
        preprocessingResults.push(result)
        filteredData.push(...result.filteredData)
      }

      // Step 2: Apply regularization to prevent overfitting
      const regularizedData = await this.applyRegularization(filteredData, variables)

      // Step 3: Bootstrap confidence intervals
      const bootstrapResult = await this.performBootstrapAnalysis(regularizedData, variables)

      // Step 4: Discover causal edges
      const causalEdges = await this.discoverCausalEdges(regularizedData, variables, bootstrapResult)

      // Step 5: Filter by statistical significance
      const significantEdges = causalEdges.filter(edge => 
        edge.pValue < (1 - this.bootstrapConfig.confidenceLevel) && 
        edge.confidence > 0.7
      )

      // Step 6: Apply final filtering
      const filteredEdges = this.applyFinalFiltering(significantEdges, variables)

      const result: CausalDiscoveryResult = {
        edges: causalEdges,
        confidenceIntervals: bootstrapResult.confidenceIntervals,
        significantEdges,
        filteredEdges,
        discoveryMetrics: {
          totalEdges: causalEdges.length,
          significantEdges: significantEdges.length,
          averageConfidence: significantEdges.reduce((sum, edge) => sum + edge.confidence, 0) / significantEdges.length,
          discoveryTime: Date.now() - startTime
        }
      }

      this.emit('causal-discovery-completed', {
        result,
        timestamp: new Date().toISOString()
      })

      return result
    } catch (error) {
      throw new Error(`Causal discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async applyRegularization(data: any[], variables: string[]): Promise<any[]> {
    try {
      // Simulate L1/L2 regularization for causal discovery
      const regularizedData = data.map(point => ({ ...point }))

      // Apply L1 regularization (Lasso) to encourage sparsity
      for (const variable of variables) {
        const values = data.map(d => this.extractValue(d, variable)).filter(v => v !== null)
        if (values.length === 0) continue

        const mean = values.reduce((sum, v) => sum + v, 0) / values.length
        const centeredValues = values.map(v => v - mean)

        // Apply L1 soft thresholding
        const threshold = this.regularizationConfig.l1Lambda
        const regularizedValues = centeredValues.map(v => 
          Math.sign(v) * Math.max(Math.abs(v) - threshold, 0)
        )

        // Update regularized data
        regularizedData.forEach((point, index) => {
          if (index < regularizedValues.length) {
            this.setValue(point, variable, regularizedValues[index] + mean)
          }
        })
      }

      return regularizedData
    } catch (error) {
      throw new Error(`Regularization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async performBootstrapAnalysis(
    data: any[], 
    variables: string[]
  ): Promise<{ confidenceIntervals: Map<string, [number, number]> } > {
    try {
      const confidenceIntervals = new Map<string, [number, number]>()

      for (const variable of variables) {
        const values = data.map(d => this.extractValue(d, variable)).filter(v => v !== null)
        if (values.length < this.bootstrapConfig.sampleSize) continue

        const bootstrapSamples: number[][] = []
        
        // Generate bootstrap samples
        for (let i = 0; i < this.bootstrapConfig.numSamples; i++) {
          const sample: number[] = []
          for (let j = 0; j < this.bootstrapConfig.sampleSize; j++) {
            const randomIndex = Math.floor(Math.random() * values.length)
            sample.push(values[randomIndex])
          }
          bootstrapSamples.push(sample)
        }

        // Calculate statistic for each sample (using mean as example)
        const sampleStats = bootstrapSamples.map(sample => 
          sample.reduce((sum, v) => sum + v, 0) / sample.length
        )

        // Calculate confidence interval
        sampleStats.sort((a, b) => a - b)
        const lowerIndex = Math.floor((1 - this.bootstrapConfig.confidenceLevel) / 2 * sampleStats.length)
        const upperIndex = Math.ceil((1 + this.bootstrapConfig.confidenceLevel) / 2 * sampleStats.length) - 1
        
        const lowerBound = sampleStats[lowerIndex]
        const upperBound = sampleStats[upperIndex]

        confidenceIntervals.set(variable, [lowerBound, upperBound])
      }

      return { confidenceIntervals }
    } catch (error) {
      throw new Error(`Bootstrap analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async discoverCausalEdges(
    data: any[], 
    variables: string[],
    bootstrapResult: { confidenceIntervals: Map<string, [number, number]> }
  ): Promise<CausalEdge[]> {
    try {
      const causalEdges: CausalEdge[] = []

      // Generate all possible variable pairs
      for (let i = 0; i < variables.length; i++) {
        for (let j = 0; j < variables.length; j++) {
          if (i === j) continue

          const fromVar = variables[i]
          const toVar = variables[j]

          // Calculate causal strength using correlation and conditional independence
          const strength = await this.calculateCausalStrength(data, fromVar, toVar)
          
          // Calculate confidence using bootstrap analysis
          const confidence = await this.calculateCausalConfidence(data, fromVar, toVar, bootstrapResult)
          
          // Calculate p-value using permutation test
          const pValue = await this.calculatePValue(data, fromVar, toVar)

          if (strength > 0.1) { // Minimum strength threshold
            causalEdges.push({
              from: fromVar,
              to: toVar,
              type: 'direct',
              strength,
              confidence,
              pValue,
              bootstrapSamples: this.bootstrapConfig.numSamples,
              timestamp: new Date().toISOString()
            })
          }
        }
      }

      return causalEdges
    } catch (error) {
      throw new Error(`Causal edge discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async calculateCausalStrength(data: any[], fromVar: string, toVar: string): Promise<number> {
    try {
      // Extract values
      const fromValues = data.map(d => this.extractValue(d, fromVar)).filter(v => v !== null)
      const toValues = data.map(d => this.extractValue(d, toVar)).filter(v => v !== null)

      if (fromValues.length === 0 || toValues.length === 0) return 0

      // Calculate correlation coefficient
      const correlation = this.calculateCorrelation(fromValues, toValues)
      
      // Calculate conditional independence (simplified)
      const conditionalIndependence = await this.calculateConditionalIndependence(data, fromVar, toVar)

      // Combine correlation and conditional independence for causal strength
      const strength = Math.abs(correlation) * (1 - conditionalIndependence)
      
      return Math.min(strength, 1.0) // Ensure strength is between 0 and 1
    } catch (error) {
      return 0
    }
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0

    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  private async calculateConditionalIndependence(data: any[], fromVar: string, toVar: string): Promise<number> {
    // Simplified conditional independence calculation
    // In practice, this would involve testing independence given all other variables
    try {
      const fromValues = data.map(d => this.extractValue(d, fromVar)).filter(v => v !== null)
      const toValues = data.map(d => this.extractValue(d, toVar)).filter(v => v !== null)

      if (fromValues.length === 0 || toValues.length === 0) return 0

      // Calculate residual correlation after controlling for other variables
      const correlation = this.calculateCorrelation(fromValues, toValues)
      
      // Return 1 - |correlation| as independence measure (higher = more independent)
      return 1 - Math.abs(correlation)
    } catch (error) {
      return 0.5 // Default to moderate independence
    }
  }

  private async calculateCausalConfidence(
    data: any[], 
    fromVar: string, 
    toVar: string,
    bootstrapResult: { confidenceIntervals: Map<string, [number, number]> }
  ): Promise<number> {
    try {
      // Use bootstrap confidence intervals to assess confidence
      const fromInterval = bootstrapResult.confidenceIntervals.get(fromVar)
      const toInterval = bootstrapResult.confidenceIntervals.get(toVar)

      if (!fromInterval || !toInterval) return 0.5

      // Calculate overlap in confidence intervals
      const overlap = this.calculateIntervalOverlap(fromInterval, toInterval)
      
      // Confidence is inversely related to overlap (less overlap = more confidence)
      const confidence = 1 - overlap
      
      return Math.max(0, Math.min(1, confidence))
    } catch (error) {
      return 0.5
    }
  }

  private calculateIntervalOverlap(interval1: [number, number], interval2: [number, number]): number {
    const [min1, max1] = interval1
    const [min2, max2] = interval2

    const overlapMin = Math.max(min1, min2)
    const overlapMax = Math.min(max1, max2)
    
    if (overlapMax < overlapMin) return 0 // No overlap

    const overlapLength = overlapMax - overlapMin
    const totalLength = Math.max(max1 - min1, max2 - min2)
    
    return totalLength > 0 ? overlapLength / totalLength : 0
  }

  private async calculatePValue(data: any[], fromVar: string, toVar: string): Promise<number> {
    try {
      // Simplified permutation test for p-value calculation
      const fromValues = data.map(d => this.extractValue(d, fromVar)).filter(v => v !== null)
      const toValues = data.map(d => this.extractValue(d, toVar)).filter(v => v !== null)

      if (fromValues.length === 0 || toValues.length === 0) return 1.0

      const observedCorrelation = Math.abs(this.calculateCorrelation(fromValues, toValues))
      
      // Permutation test: shuffle one variable and recalculate correlation
      const numPermutations = 100
      let extremeCount = 0

      for (let i = 0; i < numPermutations; i++) {
        const shuffledToValues = [...toValues].sort(() => Math.random() - 0.5)
        const permutedCorrelation = Math.abs(this.calculateCorrelation(fromValues, shuffledToValues))
        
        if (permutedCorrelation >= observedCorrelation) {
          extremeCount++
        }
      }

      // P-value is proportion of permutations with correlation as extreme as observed
      return extremeCount / numPermutations
    } catch (error) {
      return 0.05 // Default p-value
    }
  }

  private applyFinalFiltering(edges: CausalEdge[], variables: string[]): CausalEdge[] {
    // Apply final filtering rules
    return edges.filter(edge => {
      // Remove self-loops
      if (edge.from === edge.to) return false
      
      // Remove very weak edges
      if (edge.strength < 0.05) return false
      
      // Remove low confidence edges
      if (edge.confidence < 0.5) return false
      
      // Remove statistically insignificant edges
      if (edge.pValue > 0.05) return false
      
      return true
    })
  }

  private processStreamingData(): void {
    // Simulate processing streaming data for noise filtering
    this.emit('streaming-data-processed', {
      timestamp: new Date().toISOString(),
      filtersActive: this.ewmaFilters.size
    })
  }

  // Public API methods
  public getEWMAFilters(): Map<string, EWMAFilter> {
    return new Map(this.ewmaFilters)
  }

  public getRegularizationConfig(): RegularizationConfig {
    return { ...this.regularizationConfig }
  }

  public getBootstrapConfig(): BootstrapConfig {
    return { ...this.bootstrapConfig }
  }

  public updateRegularizationConfig(config: Partial<RegularizationConfig>): void {
    this.regularizationConfig = { ...this.regularizationConfig, ...config }
    console.log('Regularization config updated:', this.regularizationConfig)
  }

  public updateBootstrapConfig(config: Partial<BootstrapConfig>): void {
    this.bootstrapConfig = { ...this.bootstrapConfig, ...config }
    console.log('Bootstrap config updated:', this.bootstrapConfig)
  }

  public addEWMAFilter(variableName: string, alpha: number = 0.1): void {
    this.ewmaFilters.set(variableName, {
      alpha,
      currentValue: 0,
      timestamp: Date.now()
    })
    console.log(`EWMA filter added for variable: ${variableName}`)
  }

  public removeEWMAFilter(variableName: string): boolean {
    return this.ewmaFilters.delete(variableName)
  }

  public stop(): void {
    this.isRunning = false
    this.removeAllListeners()
    console.log('Causal robustness service stopped')
  }
}