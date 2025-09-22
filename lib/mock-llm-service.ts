// Mock LLM Service - Replaces MAX Engine dependency
// Provides realistic responses for development and testing

export interface MockLLMResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class MockLLMService {
  private static instance: MockLLMService
  
  private constructor() {}
  
  static getInstance(): MockLLMService {
    if (!MockLLMService.instance) {
      MockLLMService.instance = new MockLLMService()
    }
    return MockLLMService.instance
  }
  
  async chatCompletion(request: {
    model: string
    messages: Array<{ role: string; content: string }>
  }): Promise<MockLLMResponse> {
    const { messages } = request
    const lastMessage = messages[messages.length - 1]
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))
    
    // Generate contextual responses based on the input
    const response = this.generateResponse(lastMessage.content)
    
    return {
      choices: [{
        message: {
          content: response
        }
      }],
      model: request.model,
      usage: {
        prompt_tokens: Math.floor(Math.random() * 100) + 50,
        completion_tokens: Math.floor(Math.random() * 200) + 100,
        total_tokens: Math.floor(Math.random() * 300) + 150
      }
    }
  }
  
  private generateResponse(input: string): string {
    const lowerInput = input.toLowerCase()
    
    // Contract analysis responses
    if (lowerInput.includes('contract') || lowerInput.includes('agreement')) {
      return this.generateContractResponse(input)
    }
    
    // Risk assessment responses
    if (lowerInput.includes('risk') || lowerInput.includes('assessment')) {
      return this.generateRiskResponse(input)
    }
    
    // Mathematical analysis responses
    if (lowerInput.includes('tda') || lowerInput.includes('topological') || lowerInput.includes('mathematical')) {
      return this.generateMathematicalResponse(input)
    }
    
    // General AI responses
    return this.generateGeneralResponse(input)
  }
  
  private generateContractResponse(input: string): string {
    const responses = [
      `I've analyzed the contract and identified several key areas of concern. The document contains standard clauses with moderate risk levels. I recommend reviewing the termination clauses and liability limitations carefully.`,
      
      `Based on my analysis, this contract shows a risk score of 0.65. The main concerns are around intellectual property rights and data protection clauses. The mathematical topology analysis reveals 3 connected components with 2 potential risk loops.`,
      
      `The contract structure analysis indicates this is a service agreement with standard terms. I've identified 5 key entities: the contracting parties, payment terms, delivery schedule, warranty period, and termination conditions. The TDA signature shows H₀=2, H₁=1, H₂=0, indicating moderate complexity.`,
      
      `I've completed a comprehensive contract analysis using our advanced mathematical algorithms. The document shows good structural integrity with some areas requiring attention. The sheaf consensus analysis confirms the contract terms are internally consistent.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  private generateRiskResponse(input: string): string {
    const responses = [
      `Risk assessment complete. I've identified 3 high-risk areas and 7 medium-risk clauses. The overall risk score is 0.72, which requires immediate attention. I recommend implementing additional safeguards in the liability and termination sections.`,
      
      `Using our advanced causal reasoning algorithms, I've mapped the risk propagation paths through the contract. The analysis shows that changes to clause 15.b would have cascading effects on 4 other clauses. The mathematical model predicts a 23% increase in overall risk if this clause is modified.`,
      
      `The topological data analysis reveals interesting patterns in the risk distribution. I've identified 2 risk clusters that are topologically connected, suggesting they should be addressed together. The persistence homology shows these risks are stable across different contract variations.`,
      
      `My risk assessment incorporates both traditional legal analysis and cutting-edge mathematical modeling. The results show that while individual clauses appear acceptable, their topological relationships create unexpected risk amplification. I recommend a holistic review approach.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  private generateMathematicalResponse(input: string): string {
    const responses = [
      `The topological data analysis is complete. I've computed the persistence diagrams and identified the following topological features: H₀=3 (connected components), H₁=2 (loops), H₂=1 (voids), and T=0 (torsion). This signature indicates moderate structural complexity with some hidden relationships.`,
      
      `My mathematical analysis using sheaf cohomology reveals interesting patterns in the contract structure. The Čech cohomology groups show H⁰=2, H¹=1, H²=0, indicating good local-to-global consistency. The sheaf consensus algorithm confirms the contract terms are mathematically coherent.`,
      
      `I've applied advanced causal reasoning using do-calculus and structural causal models. The analysis reveals that clause modifications have predictable causal effects. The intervention analysis shows that changing the payment terms would have a 0.3 causal effect on delivery timeline compliance.`,
      
      `The mathematical kernel optimization is complete. I've processed the contract through our specialized TDA algorithms and identified 5 topological features that correlate with legal risk. The persistence homology reveals that risks cluster around specific contract regions, suggesting targeted mitigation strategies.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  private generateGeneralResponse(input: string): string {
    const responses = [
      `I understand your request. As an AI assistant specialized in contract analysis and mathematical modeling, I'm here to help you with complex legal document processing, risk assessment, and advanced mathematical analysis. How can I assist you today?`,
      
      `I'm ready to help with your contract analysis needs. I can perform topological data analysis, sheaf consensus calculations, causal reasoning, and comprehensive risk assessments. What specific analysis would you like me to perform?`,
      
      `Thank you for your input. I'm equipped with advanced mathematical capabilities including TDA, sheaf cohomology, and causal reasoning algorithms. I can analyze contracts, assess risks, and provide insights based on both legal expertise and mathematical rigor. What would you like me to analyze?`,
      
      `I'm here to assist with your contract management and analysis needs. My capabilities include document parsing, entity extraction, risk scoring, mathematical topology analysis, and workflow automation. How can I help you today?`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }
}

// Export singleton instance
export const mockLLMService = MockLLMService.getInstance()