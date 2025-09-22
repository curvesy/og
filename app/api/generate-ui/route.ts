// app/api/generate-ui/route.ts (server-only, keep as .ts)
import { NextRequest } from 'next/server';
import React from 'react';
import { streamUI } from '@ai-sdk/rsc';
import { StockTicker } from '@/components/ui/stock-ticker';
import { FinancialDataTable } from '@/components/ui/financial-data-table';
import { SentimentChart } from '@/components/ui/sentiment-chart';

const components: Record<string, React.ComponentType<any>> = {
  StockTicker,
  FinancialDataTable,
  SentimentChart,
};

export async function POST(req: NextRequest) {
  const { componentName, props } = await req.json();
  const Comp = components[componentName] ?? ((p: any) => React.createElement('div', null, `Unsupported component: ${componentName}`));
  
  // Build without JSX to keep this file TS-safe
  return streamUI({
    children: React.createElement(Comp, props),
  });
}
