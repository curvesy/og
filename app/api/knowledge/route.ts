import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { RushDBService } from '@/lib/rushdb-service'
import { graphRagService, Triple } from '@/lib/graphrag-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source, data } = body

    if (!source || !data) {
      return NextResponse.json({ error: 'Source and data are required' }, { status: 400 })
    }

    // Ingest the structured data first
    const rushDB = RushDBService.getInstance()
    const ingestionResult = await rushDB.ingestData(source, data)

    if (!ingestionResult.success) {
      return NextResponse.json({ 
        message: 'Ingestion completed with errors.', 
        result: ingestionResult 
      }, { status: 207 })
    }

    // If it's procurement data with an amendment, run GraphRAG
    if (source === 'procurement_data' && data.amendment && data.contractId) {
      const extractionResult = await graphRagService.extractTriplesFromText(data.contractId, data.amendment)

      if (extractionResult.triples.length > 0) {
        await saveTriplesToDatabase(extractionResult.triples, extractionResult.source_doc_id)
      }
    }

    return NextResponse.json({ 
      message: 'Ingestion successful.', 
      result: ingestionResult 
    })
  } catch (error) {
    console.error('Error in knowledge ingestion:', error)
    return NextResponse.json({ error: 'Failed to ingest knowledge' }, { status: 500 })
  }
}

async function saveTriplesToDatabase(triples: Triple[], sourceDocId: string) {
  for (const triple of triples) {
    // 1. Find or create subject node
    const subjectNode = await db.knowledgeNode.upsert({
      where: { label: triple.subject.id },
      update: {},
      create: {
        label: triple.subject.id,
        type: triple.subject.type,
        properties: {},
      },
    });

    // 2. Find or create object node
    const objectNode = await db.knowledgeNode.upsert({
      where: { label: triple.object.id },
      update: {},
      create: {
        label: triple.object.id,
        type: triple.object.type,
        properties: {},
      },
    });

    // 3. Create the relationship
    await db.knowledgeRelation.create({
      data: {
        fromId: subjectNode.id,
        toId: objectNode.id,
        type: triple.predicate,
        properties: {},
        source_doc_id: sourceDocId,
        confidence: triple.confidence,
      },
    });
  }
  console.log(`Saved ${triples.length} triples to the knowledge graph.`);
}
