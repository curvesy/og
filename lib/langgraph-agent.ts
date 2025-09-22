// src/lib/langgraph-agent.ts
import { ChatOpenAI } from "@langchain/openai";
import { AgentState, StateGraph, END } from "@langchain/langgraph";
import { Tool } from "@langchain/core/tools";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

// This is the interface for the state of our graph.
interface IAgentState {
  messages: BaseMessage[];
}

/**
 * This function dynamically builds and runs a LangGraph agent.
 * It constructs the graph with the specific tools provided for the execution.
 * @param {object} params - The parameters for running the graph.
 * @param {any} params.input - The initial input for the agent.
 * @param {any} params.agent - The agent definition from the database.
 * @param {any} params.context - The execution context.
 * @param {Tool[]} params.tools - The array of tools for the agent to use.
 * @returns {Promise<any>} The final result from the agent execution.
 */
export const runGraph = async ({ input, agent, context, tools }: { input: any; agent: any; context: any; tools: Tool[] }) => {
  // 1. Initialize the model and bind the dynamic tools.
  // We use a placeholder model here. In a real app, this would be configured.
  const model = new ChatOpenAI({ temperature: 0, streaming: true });
  const modelWithTools = model.bindTools(tools);

  // 2. Define the core agent node.
  const agentNode = async (state: IAgentState) => {
    const response = await modelWithTools.invoke(state.messages);
    return { messages: [response] };
  };

  // 3. Define the tool execution node.
  const toolNode = async (state: IAgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] as AIMessage;
    const toolCalls = lastMessage.tool_calls || [];
    
    // The ToolExecutor is now created with the dynamic tools for this specific run.
    const toolExecutor = new ToolExecutor(tools);
    const toolResponses = await toolExecutor.batch(toolCalls);

    const responseMessages = toolResponses.map(response => new HumanMessage({
      content: JSON.stringify(response),
      name: "tool",
    }));

    return { messages: responseMessages };
  };

  // 4. Define the routing logic.
  const router = (state: IAgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return "tool_node";
    }
    return END; // End the execution if no tool is called.
  };

  // 5. Construct the graph.
  const workflow = new StateGraph<IAgentState>({
    channels: {
      messages: {
        value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
        default: () => [],
      },
    },
  });

  workflow.addNode("agent", agentNode);
  workflow.addNode("tool_node", toolNode);
  workflow.addConditionalEdges("agent", router);
  workflow.addEdge("tool_node", "agent");
  workflow.setEntryPoint("agent");

  const langGraphAgent = workflow.compile();

  // 6. Execute the graph with the initial input.
  const initialMessages = [new HumanMessage(input.query || JSON.stringify(input))];
  const result = await langGraphAgent.invoke({ messages: initialMessages });

  // Return the final message from the agent.
  return result.messages[result.messages.length - 1]?.content;
};