// src/lib/cognitive-memory-service.ts
import { db } from './db';
import ZAI from 'z-ai-web-dev-sdk';
import { z } from 'zod';

// Zod schema for the expected output from the relationship extraction model.
const relationshipSchema = z.array(
  z.object({
    subject: z.string(),
    predicate: z.string(),
    object: z.string(),
  })
);

/**
 * Uses a powerful language model to extract a graph of entities and relationships from text.
 * @param text The text to analyze.
 * @returns A promise that resolves to an array of extracted relationships.
 */
const modelBasedRelationshipExtractor = async (
  text: string
): Promise<z.infer<typeof relationshipSchema>> => {
  const zai = await ZAI.create();
  const messages = [
    {
      role: 'system',
      content: `You are an expert at extracting knowledge graphs from text. Your task is to identify entities (subjects and objects) and the relationships (predicates) that connect them. Extract as many meaningful relationships as you can. Format your response as a JSON array of objects, where each object has a "subject", "predicate", and "object".`,
    },
    {
      role: 'user',
      content: `Extract the knowledge graph from the following text: "${text}"`,
    },
  ];

  try {
    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0]?.message?.content || '[]';
    const parsedJson = JSON.parse(result);
    // The model might return the array within a "relationships" key.
    const relationshipsArray = parsedJson.relationships || parsedJson;
    return relationshipSchema.parse(relationshipsArray);
  } catch (error) {
    console.error('[CognitiveMemoryService] Error extracting relationships:', error);
    return [];
  }
};

export class CognitiveMemoryService {
  async addObservation(text: string): Promise<void> {
    console.log(`[CognitiveMemoryService] Adding observation: "${text}"`);
    const relationships = await modelBasedRelationshipExtractor(text);

    if (relationships.length === 0) {
      console.log(`[CognitiveMemoryService] No relationships found.`);
      return;
    }

    for (const rel of relationships) {
      // 1. Upsert the subject and object as nodes.
      const subjectNode = await db.knowledgeNode.upsert({
        where: { label: rel.subject },
        update: {},
        create: { label: rel.subject, type: 'ENTITY', description: '', properties: {} },
      });
      const objectNode = await db.knowledgeNode.upsert({
        where: { label: rel.object },
        update: {},
        create: { label: rel.object, type: 'ENTITY', description: '', properties: {} },
      });

      // 2. Create the relationship between them.
      await db.knowledgeRelation.create({
        data: {
          fromId: subjectNode.id,
          toId: objectNode.id,
          type: rel.predicate,
          properties: {},
        },
      });
      console.log(
        `[CognitiveMemoryService] Created relationship: (${rel.subject})-[${rel.predicate}]->(${rel.object})`
      );
    }
  }

  async retrieveContext(
    query: string
  ): Promise<{ id: string; label: string; type: string }[]> {
    console.log(`[CognitiveMemoryService] Retrieving context for query: "${query}"`);
    const queryTerms = query.split(/\s+/).filter(term => term.length > 2);
    
    // Find nodes directly mentioned in the query.
    const directNodes = await db.knowledgeNode.findMany({
      where: { label: { in: queryTerms, mode: 'insensitive' } },
    });

    // Also find nodes that are related to the directly mentioned nodes.
    const relatedNodes = await db.knowledgeRelation.findMany({
      where: {
        OR: [
          { fromId: { in: directNodes.map(n => n.id) } },
          { toId: { in: directNodes.map(n => n.id) } },
        ],
      },
      include: { from: true, to: true },
    });

    const allNodes = [...directNodes];
    for (const rel of relatedNodes) {
      allNodes.push(rel.from);
      allNodes.push(rel.to);
    }

    // Deduplicate the nodes.
    const uniqueNodes = Array.from(new Map(allNodes.map(n => [n.id, n])).values());

    console.log(
      `[CognitiveMemoryService] Found ${uniqueNodes.length} relevant nodes (direct and related).`
    );
    return uniqueNodes.map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
    }));
  }
}

export const cognitiveMemoryService = new CognitiveMemoryService();
