// src/components/ui/sentiment-chart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SentimentChartProps {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  justification: string;
}

const sentimentColors = {
  Positive: 'bg-green-500',
  Neutral: 'bg-gray-500',
  Negative: 'bg-red-500',
};

export const SentimentChart = ({ sentiment, justification }: SentimentChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          <div className={`w-4 h-4 rounded-full ${sentimentColors[sentiment]}`} />
          <span className="ml-2 font-semibold">{sentiment}</span>
        </div>
        <p className="text-sm text-gray-600">{justification}</p>
      </CardContent>
    </Card>
  );
};
