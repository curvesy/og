// AG-UI Event Stream Protocol
export enum AGUIEventType {
  RUN_STARTED = 'RUN_STARTED',
  TEXT_MESSAGE_CONTENT = 'TEXT_MESSAGE_CONTENT',
  TOOL_CALL_START = 'TOOL_CALL_START',
  TOOL_CALL_END = 'TOOL_CALL_END',
  STATE_DELTA = 'STATE_DELTA',
  RUN_ENDED = 'RUN_ENDED',
  GRAPH_INSIGHT = 'GRAPH_INSIGHT', // For trust-building UI
  RENDER_GENERATIVE_UI = 'RENDER_GENERATIVE_UI', // For agent-pushed UI

  // --- V7 Architecture Events ---
  SKILL_INFERRED = 'SKILL_INFERRED',
  EXPERT_RECRUITED = 'EXPERT_RECRUITED',
  SYNTHESIS_STARTED = 'SYNTHESIS_STARTED',
  SYNTHESIS_COMPLETE = 'SYNTHESIS_COMPLETE',
  REFLECTION_TRIGGERED = 'REFLECTION_TRIGGERED',
  PROOF_PATCH_APPLIED = 'PROOF_PATCH_APPLIED',
  CONSTITUTION_CHECK = 'CONSTITUTION_CHECK',

  // --- Phase 1: Planning Events ---
  PLAN_GENERATED = 'PLAN_GENERATED',
  NODE_EXPANDED = 'NODE_EXPANDED',
  STEP_SCORED = 'STEP_SCORED',
  PLAN_EXECUTED = 'PLAN_EXECUTED',

  // --- Phase 2: RL Assurance Events ---
  PATCH_ARENA_START = 'PATCH_ARENA_START',
  PATCH_WINNER_SELECTED = 'PATCH_WINNER_SELECTED',
  RISK_PRIOR_UPDATED = 'RISK_PRIOR_UPDATED',
  UNCERTAINTY_HIGH = 'UNCERTAINTY_HIGH',

  // --- Phase 3: MoTE Events ---
  STAGE_ANALYSIS_COMPLETE = 'STAGE_ANALYSIS_COMPLETE',
  EXPERT_ROUTING_DECIDED = 'EXPERT_ROUTING_DECIDED',
  SAFETY_CHECK_PASSED = 'SAFETY_CHECK_PASSED',

  // --- Phase 4: Alignment & Neurosymbolic Events ---
  PRINCIPLE_APPLIED = 'PRINCIPLE_APPLIED',
  CONSTITUTION_VIOLATED = 'CONSTITUTION_VIOLATED',
  NEURAL_PATTERN_DETECTED = 'NEURAL_PATTERN_DETECTED',
  SYMBOLIC_RULE_FIRED = 'SYMBOLIC_RULE_FIRED',

  // --- Phase 5: Self-Correction & Memory Events ---
  CACHE_HIT = 'CACHE_HIT',
  CACHE_MISS = 'CACHE_MISS',

  // --- Day 4: Streaming Events ---
  FIELD_PARTIAL = 'FIELD_PARTIAL',
  FIELD_COMMITTED = 'FIELD_COMMITTED',

  // --- Day 6: Provenance Events ---
  EVIDENCE_ATTACHED = 'EVIDENCE_ATTACHED',

  // --- Day 8: Context Engineering Events ---
  CONTEXT_PACKED = 'CONTEXT_PACKED',
  CONTEXT_TRIMMED = 'CONTEXT_TRIMMED',

  // --- Week 1, Day 3: Topological Events ---
  TOPOLOGICAL_FAILURE_PROBABILITY = 'TOPOLOGICAL_FAILURE_PROBABILITY',

  // --- Week 2, Day 2: TDA Observability Events ---
  COORDINATION_HEALTH_SCORE_UPDATED = 'COORDINATION_HEALTH_SCORE_UPDATED',

  // --- Week 2, Day 3: Autoscaling Events ---
  BRIDGE_AGENT_SPAWNED = 'BRIDGE_AGENT_SPAWNED',

  // --- Week 3: GPU Acceleration Events ---
  GPU_TASK_OFFLOADED = 'GPU_TASK_OFFLOADED',
  GPU_TASK_COMPLETED = 'GPU_TASK_COMPLETED',

  // --- Week 4: Multi-Agent Events ---
  GEOMETRIC_CONSENSUS_STARTED = 'GEOMETRIC_CONSENSUS_STARTED',
  GEOMETRIC_CONSENSUS_COMPLETED = 'GEOMETRIC_CONSENSUS_COMPLETED',

  // --- Week 5: Neuromorphic Events ---
  NEUROMORPHIC_PREPROCESSING_STARTED = 'NEUROMORPHIC_PREPROCESSING_STARTED',
  NEUROMORPHIC_PREPROCESSING_COMPLETED = 'NEUROMORPHIC_PREPROCESSING_COMPLETED',

  // --- Week 1, Day 2 (Hardening): Remediation Events ---
  TIER1_ANOMALY_DETECTED = 'TIER1_ANOMALY_DETECTED',
  TIER2_ANALYSIS_STARTED = 'TIER2_ANALYSIS_STARTED',

  // Week 2, Day 2 (RL): Governor Events ---
  RL_GOVERNOR_ACTION_TAKEN = 'RL_GOVERNOR_ACTION_TAKEN',

  // --- Week 3 (Consensus): Sheaf Events ---
  SHEAF_CONSENSUS_STARTED = 'SHEAF_CONSENSUS_STARTED',
  SHEAF_CONSENSUS_COMPLETED = 'SHEAF_CONSENSUS_COMPLETED',
  BYZANTINE_INCONSISTENCY_DETECTED = 'BYZANTINE_INCONSISTENCY_DETECTED',
}

export interface AGUIEvent {
  type: AGUIEventType;
  timestamp: string;
  runId: string;
  agentId: string;
}

export interface RunStartedEvent extends AGUIEvent {
  type: AGUIEventType.RUN_STARTED;
  input: any;
}

export interface TextMessageContentEvent extends AGUIEvent {
  type: AGUIEventType.TEXT_MESSAGE_CONTENT;
  content: string;
}

export interface ToolCallStartEvent extends AGUIEvent {
  type: AGUIEventType.TOOL_CALL_START;
  toolName: string;
  args: any;
}

export interface ToolCallEndEvent extends AGUIEvent {
  type: AGUIEventType.TOOL_CALL_END;
  toolName: string;
  result: any;
}

export interface StateDeltaEvent extends AGUIEvent {
  type: AGUIEventType.STATE_DELTA;
  delta: any;
}

export interface GraphInsightEvent extends AGUIEvent {
  type: AGUIEventType.GRAPH_INSIGHT;
  content: string;
  graphElements: {
    id: string;
    type: 'node' | 'edge';
    label: string;
  }[];
}

export interface RenderGenerativeUIEvent extends AGUIEvent {
  type: AGUIEventType.RENDER_GENERATIVE_UI;
  componentName: string;
  props: Record<string, any>;
}

export interface RunEndedEvent extends AGUIEvent {
  type: AGUIEventType.RUN_ENDED;
  result: any;
  error?: string;
}

// --- V7 Architecture Event Payloads ---

export interface SkillInferredEvent extends AGUIEvent {
    type: AGUIEventType.SKILL_INFERRED;
    skills: Record<string, number>;
}

export interface ExpertRecruitedEvent extends AGUIEvent {
    type: AGUIEventType.EXPERT_RECRUITED;
    expertId: string;
    expertName: string;
    score: number;
}

export interface SynthesisStartedEvent extends AGUIEvent {
    type: AGUIEventType.SYNTHESIS_STARTED;
    expertId: string;
}

export interface SynthesisCompleteEvent extends AGUIEvent {
    type: AGUIEventType.SYNTHESIS_COMPLETE;
    expertId: string;
    result: any;
}

export interface ReflectionTriggeredEvent extends AGUIEvent {
    type: AGUIEventType.REFLECTION_TRIGGERED;
    reason: string;
    trace: any;
}

export interface ProofPatchAppliedEvent extends AGUIEvent {
    type: AGUIEventType.PROOF_PATCH_APPLIED;
    patch: any;
    originalTrace: any;
    correctedTrace: any;
}

export interface ConstitutionCheckEvent extends AGUIEvent {
    type: AGUIEventType.CONSTITUTION_CHECK;
    principleId: string;
    passed: boolean;
}

// --- Phase 1: Planning Event Payloads ---
export interface PlanGeneratedEvent extends AGUIEvent {
    type: AGUIEventType.PLAN_GENERATED;
    plan: string[];
}

export interface NodeExpandedEvent extends AGUIEvent {
    type: AGUIEventType.NODE_EXPANDED;
    node: any; // In a real system, this would be a structured node object
}

export interface StepScoredEvent extends AGUIEvent {
    type: AGUIEventType.STEP_SCORED;
    step: string;
    score: number;
}

export interface PlanExecutedEvent extends AGUIEvent {
    type: AGUIEventType.PLAN_EXECUTED;
    steps: number;
}

// --- Phase 2: RL Assurance Event Payloads ---
export interface PatchArenaStartEvent extends AGUIEvent {
    type: AGUIEventType.PATCH_ARENA_START;
    patchA_id: string;
    patchB_id: string;
}

export interface PatchWinnerSelectedEvent extends AGUIEvent {
    type: AGUIEventType.PATCH_WINNER_SELECTED;
    winner: string;
    metrics: any;
}

export interface RiskPriorUpdatedEvent extends AGUIEvent {
    type: AGUIEventType.RISK_PRIOR_UPDATED;
    action_id: string;
    alpha: number;
    beta: number;
}

export interface UncertaintyHighEvent extends AGUIEvent {
    type: AGUIEventType.UNCERTAINTY_HIGH;
    entropy: number;
}

// --- Phase 3: MoTE Event Payloads ---
export interface StageAnalysisCompleteEvent extends AGUIEvent {
    type: AGUIEventType.STAGE_ANALYSIS_COMPLETE;
    analysis: string;
}

export interface ExpertRoutingDecidedEvent extends AGUIEvent {
    type: AGUIEventType.EXPERT_ROUTING_DECIDED;
    expertName: string;
    score: number;
}

export interface SafetyCheckPassedEvent extends AGUIEvent {
    type: AGUIEventType.SAFETY_CHECK_PASSED;
    passed: boolean;
}

// --- Phase 4: Alignment & Neurosymbolic Event Payloads ---
export interface PrincipleAppliedEvent extends AGUIEvent {
    type: AGUIEventType.PRINCIPLE_APPLIED;
    principleId: string;
    passed: boolean;
}

export interface ConstitutionViolatedEvent extends AGUIEvent {
    type: AGUIEventType.CONSTITUTION_VIOLATED;
    principleId: string;
}

export interface NeuralPatternDetectedEvent extends AGUIEvent {
    type: AGUIEventType.NEURAL_PATTERN_DETECTED;
    violation: string;
}

export interface SymbolicRuleFiredEvent extends AGUIEvent {
    type: AGUIEventType.SYMBOLIC_RULE_FIRED;
    rule: string;
}

// --- Phase 5: Self-Correction & Memory Event Payloads ---
export interface CacheHitEvent extends AGUIEvent {
    type: AGUIEventType.CACHE_HIT;
    task_hash: string;
}

export interface CacheMissEvent extends AGUIEvent {
    type: AGUIEventType.CACHE_MISS;
}

// --- Day 4: Streaming Event Payloads ---
export interface FieldPartialEvent extends AGUIEvent {
    type: AGUIEventType.FIELD_PARTIAL;
    field_name: string;
    partial_content: any;
}

export interface FieldCommittedEvent extends AGUIEvent {
    type: AGUIEventType.FIELD_COMMITTED;
    field_name: string;
    final_content: any;
}

// --- Day 6: Provenance Event Payloads ---
export interface EvidenceAttachedEvent extends AGUIEvent {
    type: AGUIEventType.EVIDENCE_ATTACHED;
    claim_id: string;
    evidence_ids: string[];
    neighborhood_ids: string[];
}

// --- Day 8: Context Engineering Event Payloads ---
export interface ContextPackedEvent extends AGUIEvent {
    type: AGUIEventType.CONTEXT_PACKED;
    token_count: number;
}

export interface ContextTrimmedEvent extends AGUIEvent {
    type: AGUIEventType.CONTEXT_TRIMMED;
    component_type: string;
}

// --- Week 1, Day 3: Topological Event Payloads ---
export interface TopologicalFailureProbabilityEvent extends AGUIEvent {
    type: AGUIEventType.TOPOLOGICAL_FAILURE_PROBABILITY;
    probability: number;
    wasserstein_distance: number;
}

// --- Week 2, Day 2: TDA Observability Event Payloads ---
export interface CoordinationHealthScoreUpdatedEvent extends AGUIEvent {
    type: AGUIEventType.COORDINATION_HEALTH_SCORE_UPDATED;
    betti0: number;
    betti1: number;
    fragmentation: number;
}

// --- Week 2, Day 3: Autoscaling Event Payloads ---
export interface BridgeAgentSpawnedEvent extends AGUIEvent {
    type: AGUIEventType.BRIDGE_AGENT_SPAWNED;
    agent_id: string;
    reason: string;
}

// --- Week 3: GPU Acceleration Event Payloads ---
export interface GpuTaskOffloadedEvent extends AGUIEvent {
    type: AGUIEventType.GPU_TASK_OFFLOADED;
    task_name: string;
}

export interface GpuTaskCompletedEvent extends AGUIEvent {
    type: AGUIEventType.GPU_TASK_COMPLETED;
    task_name: string;
}

// --- Week 4: Multi-Agent Event Payloads ---
export interface GeometricConsensusStartedEvent extends AGUIEvent {
    type: AGUIEventType.GEOMETRIC_CONSENSUS_STARTED;
    agents: string[];
}

export interface GeometricConsensusCompletedEvent extends AGUIEvent {
    type: AGUIEventType.GEOMETRIC_CONSENSUS_COMPLETED;
    solution: string;
}

// --- Week 5: Neuromorphic Event Payloads ---
export interface NeuromorphicPreprocessingStartedEvent extends AGUIEvent {
    type: AGUIEventType.NEUROMORPHIC_PREPROCESSING_STARTED;
}

export interface NeuromorphicPreprocessingCompletedEvent extends AGUIEvent {
    type: AGUIEventType.NEUROMORPHIC_PREPROCESSING_COMPLETED;
    spike_train_length: number;
}

// --- Week 1, Day 2 (Hardening): Remediation Event Payloads ---
export interface Tier1AnomalyDetectedEvent extends AGUIEvent {
    type: AGUIEventType.TIER1_ANOMALY_DETECTED;
    betti_numbers: [number, number];
}

export interface Tier2AnalysisStartedEvent extends AGUIEvent {
    type: AGUIEventType.TIER2_ANALYSIS_STARTED;
}

// --- Week 2, Day 2 (RL): Governor Event Payloads ---
export interface RlGovernorActionTakenEvent extends AGUIEvent {
    type: AGUIEventType.RL_GOVERNOR_ACTION_TAKEN;
    action: string;
    reward: number;
}

// --- Week 3 (Consensus): Sheaf Event Payloads ---
export interface SheafConsensusStartedEvent extends AGUIEvent {
    type: AGUIEventType.SHEAF_CONSENSUS_STARTED;
}

export interface SheafConsensusCompletedEvent extends AGUIEvent {
    type: AGUIEventType.SHEAF_CONSENSUS_COMPLETED;
    result: any;
}

export interface ByzantineInconsistencyDetectedEvent extends AGUIEvent {
    type: AGUIEventType.BYZANTINE_INCONSISTENCY_DETECTED;
    byzantine_agents: string[];
}


export type AGUIEventPayload =
  | RunStartedEvent
  | TextMessageContentEvent
  | ToolCallStartEvent
  | ToolCallEndEvent
  | StateDeltaEvent
  | GraphInsightEvent
  | RenderGenerativeUIEvent
  | RunEndedEvent
  // V7 Events
  | SkillInferredEvent
  | ExpertRecruitedEvent
  | SynthesisStartedEvent
  | SynthesisCompleteEvent
  | ReflectionTriggeredEvent
  | ProofPatchAppliedEvent
  | ConstitutionCheckEvent
  | PrincipleAppliedEvent
  // Phase 1 Events
  | PlanGeneratedEvent
  | NodeExpandedEvent
  | StepScoredEvent
  | PlanExecutedEvent
  // Phase 2 Events
  | PatchArenaStartEvent
  | PatchWinnerSelectedEvent
  | RiskPriorUpdatedEvent
  | UncertaintyHighEvent
  // Phase 3 Events
  | StageAnalysisCompleteEvent
  | ExpertRoutingDecidedEvent
  | SafetyCheckPassedEvent
  // Phase 4 Events
  | ConstitutionViolatedEvent
  | NeuralPatternDetectedEvent
  | SymbolicRuleFiredEvent
  // Phase 5 Events
  | CacheHitEvent
  | CacheMissEvent
  // Day 4 Events
  | FieldPartialEvent
  | FieldCommittedEvent
  // Day 6 Events
  | EvidenceAttachedEvent
  // Day 8 Events
  | ContextPackedEvent
  | ContextTrimmedEvent
  // Week 1, Day 3 Events
  | TopologicalFailureProbabilityEvent
  // Week 2, Day 2 Events
  | CoordinationHealthScoreUpdatedEvent
  // Week 2, Day 3 Events
  | BridgeAgentSpawnedEvent
  // Week 3 Events
  | GpuTaskOffloadedEvent
  | GpuTaskCompletedEvent
  // Week 4 Events
  | GeometricConsensusStartedEvent
  | GeometricConsensusCompletedEvent
  // Week 5 Events
  | NeuromorphicPreprocessingStartedEvent
  | NeuromorphicPreprocessingCompletedEvent
  // Week 1, Day 2 (Hardening) Events
  | Tier1AnomalyDetectedEvent
  | Tier2AnalysisStartedEvent
  // Week 2, Day 2 (RL) Events
  | RlGovernorActionTakenEvent
  // Week 3 (Consensus) Events
  | SheafConsensusStartedEvent
  | SheafConsensusCompletedEvent
  | ByzantineInconsistencyDetectedEvent;

export interface AgentStatusUpdate {
  agentId: string;
  status: string;
  message?: string;
  progress?: number;
  timestamp: string;
}

export interface ExecutionUpdate {
  executionId: string;
  agentId: string;
  status: string;
  output?: any;
  error?: string;
  duration?: number;
  timestamp: string;
}

export interface MCPUpdate {
  serverId: string;
  status: string;
  connectedAgents: number;
  timestamp: string;
}