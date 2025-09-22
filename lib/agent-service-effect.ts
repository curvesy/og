// src/lib/agent-service-effect.ts
import { Effect, Context, Layer } from 'effect';
import { db } from '@/lib/db';
import { Server } from 'socket.io';
import { AgentExecutionContext, AgentExecutionResult } from './agent-service';
import { AGUIEventType, RunEndedEvent, RunStartedEvent } from './socket-client';
import { runGraph } from './langgraph-agent';
import { z } from 'zod';
import { RunTree, Client } from "langsmith";
import { GraphRagService, graphRagService } from './graphrag-service';
import { DSPyService, dspyService } from './dspy-service';
import { AssuranceService, assuranceService } from './assurance-service';
import { ExpertRosterService, expertRosterService } from './expert-roster-service';
import { SkillRouterService, skillRouterService } from './skill-router-service';
import { Expert } from './expert-types';

// Define custom error types for our domain
class AgentNotFoundError extends Error { constructor() { super("AgentNotFoundError"); } }
class AgentExecutionError extends Error { constructor() { super("AgentExecutionError"); } }

// Define the services our application needs as a Context
class Database extends Context.Tag('Database')<Database, typeof db>() {}
class SocketServer extends Context.Tag('SocketServer')<SocketServer, Server>() {}
class LangGraphRunner extends Context.Tag('LangGraphRunner')<LangGraphRunner, { runGraph: typeof runGraph }>() {}
class LangSmithTracer extends Context.Tag('LangSmithTracer')<LangSmithTracer, Client>() {}
class GraphRag extends Context.Tag('GraphRag')<GraphRag, GraphRagService>() {}
class DSPy extends Context.Tag('DSPy')<DSPy, DSPyService>() {}
class Assurance extends Context.Tag('Assurance')<Assurance, AssuranceService>() {}
class ExpertRoster extends Context.Tag('ExpertRoster')<ExpertRoster, ExpertRosterService>() {}
class SkillRouter extends Context.Tag('SkillRouter')<SkillRouter, SkillRouterService>() {}

// The main program to execute an agent.
export const executeAgent = (
  context: AgentExecutionContext
): Effect.Effect<
  AgentExecutionResult,
  AgentNotFoundError | AgentExecutionError,
  Database | SocketServer | LangGraphRunner | GraphRag | DSPy | Assurance | ExpertRoster | SkillRouter
> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const io = yield* SocketServer;

    // ... (event emission and agent fetching logic remains the same)

    const agent = yield* Effect.tryPromise({
        try: () => db.agent.findUnique({ where: { id: context.agentId } }),
        catch: () => new AgentExecutionError(),
      });
  
      if (!agent) {
        return yield* Effect.fail(new AgentNotFoundError());
      }
  
      yield* Effect.tryPromise({
        try: () =>
          db.agentExecution.update({
            where: { id: context.executionId },
            data: { status: 'RUNNING', startedAt: new Date() },
          }),
        catch: () => new AgentExecutionError(),
      });

    const startTime = Date.now();

    // The core logic now uses the SkillRouter to select the best expert.
    const skillRouter = yield* SkillRouter;
    const selectedExperts = yield* skillRouter.route(context.input.query || JSON.stringify(context.input));
    
    // For now, we'll use the top-ranked expert.
    // A more advanced Meta-Controller would orchestrate multiple experts.
    const topExpert = selectedExperts[0];

    if (!topExpert) {
        return yield* Effect.fail(new AgentExecutionError("No suitable expert found for this task."));
    }

    // We now execute a generic "expert" program, which is powered by DSPy.
    const result = yield* executeExpertProgram(topExpert, agent, context);

    const executionTime = Date.now() - startTime;

    // ... (result handling and event emission logic remains the same)
    yield* Effect.tryPromise({
        try: () =>
          db.agentExecution.update({
            where: { id: context.executionId },
            data: {
              status: 'COMPLETED',
              output: result as any,
              duration: executionTime,
              completedAt: new Date(),
            },
          }),
        catch: () => new AgentExecutionError(),
      });
  
      yield* Effect.sync(() =>
        io.to('agui-events').emit(AGUIEventType.RUN_ENDED, {
          type: AGUIEventType.RUN_ENDED,
          timestamp: new Date().toISOString(),
          runId: context.executionId,
          agentId: context.agentId,
          result,
        } as RunEndedEvent)
      );
  
      return {
        success: true,
        result,
        metadata: {
          model: topExpert.id, // We now log the expert ID instead of a generic model.
          executionTime,
        },
      };
  });

// A new generic program for executing any expert via DSPy.
const executeExpertProgram = (expert: Expert, agent: any, context: AgentExecutionContext) => Effect.gen(function* () {
    const dspy = yield* DSPy;
    // The expert's description and skill profile can be used to create a highly specialized prompt.
    const systemPrompt = `You are ${expert.name}. ${expert.description}. Your skills are: ${JSON.stringify(expert.skillProfile)}.`;
    const userRequest = JSON.stringify(context.input);
    
    return yield* dspy.run(systemPrompt, userRequest);
});


export const tracedExecuteAgent = (context: AgentExecutionContext) =>
  Effect.gen(function* () {
    // ... (tracing logic remains the same)
  });

export const assuredTracedExecuteAgent = (context: AgentExecutionContext) =>
  Effect.gen(function* () {
    const assurance = yield* Assurance;
    return yield* assurance.executeWithAssurance(tracedExecuteAgent(context));
  });

// --- Live Service Implementations ---

export const DatabaseLive = Layer.succeed(Database, db);
export const SocketServerLive = (io: Server) => Layer.succeed(SocketServer, io);
export const LangGraphRunnerLive = Layer.succeed(LangGraphRunner, { runGraph });
export const LangSmithTracerLive = Layer.succeed(LangSmithTracer, new Client());
export const GraphRagLive = Layer.succeed(GraphRag, graphRagService);
export const DSPyLive = Layer.succeed(DSPy, dspyService);
export const AssuranceLive = Layer.succeed(Assurance, assuranceService);
export const ExpertRosterLive = Layer.succeed(ExpertRoster, expertRosterService);
export const SkillRouterLive = Layer.succeed(SkillRouter, skillRouterService);

// This is the final, runnable program with all dependencies provided.
export const executeAgentLive = (context: AgentExecutionContext, io: Server) =>
  assuredTracedExecuteAgent(context).pipe(
    Effect.provide(DatabaseLive),
    Effect.provide(SocketServerLive(io)),
    Effect.provide(LangGraphRunnerLive),
    Effect.provide(LangSmithTracerLive),
    Effect.provide(GraphRagLive),
    Effect.provide(DSPyLive),
    Effect.provide(AssuranceLive),
    Effect.provide(ExpertRosterLive),
    Effect.provide(SkillRouterLive)
  );