'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Triple {
  text: string;
  type: 'entity' | 'relation';
  confidence: number;
}

// This simulates the output of Cognee's UI overlay feature
const getAnnotatedText = (text: string): (string | Triple)[] => {
  const annotations: (string | Triple)[] = [];
  let lastIndex = 0;

  const addTriple = (text: string, type: 'entity' | 'relation', confidence: number) => {
    annotations.push({ text, type, confidence });
  };

  // Keyword-based triple extraction for demonstration
  const regex = /(clause 15.b)|(data privacy)|(Acme Corp)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      annotations.push(text.substring(lastIndex, match.index));
    }
    const matchedText = match[0];
    if (matchedText.toLowerCase() === 'clause 15.b') {
      addTriple(matchedText, 'entity', 0.95);
    } else if (matchedText.toLowerCase() === 'data privacy') {
      addTriple(matchedText, 'entity', 0.98);
    } else if (matchedText.toLowerCase() === 'acme corp') {
      addTriple(matchedText, 'entity', 0.99);
    }
    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    annotations.push(text.substring(lastIndex));
  }

  return annotations;
};

export const DocumentExplorer = () => {
  const documentText = "This contract amendment introduces clause 15.b, which pertains to new data privacy regulations. The agreement is between Novin Dev and Acme Corp.";
  const annotatedText = getAnnotatedText(documentText);

  const getHighlightColor = (confidence: number) => {
    if (confidence > 0.95) return 'bg-blue-200 dark:bg-blue-800';
    if (confidence > 0.9) return 'bg-green-200 dark:bg-green-800';
    return 'bg-yellow-200 dark:bg-yellow-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Explorer with Cognee Overlays</CardTitle>
        <CardDescription>
          Extracted entities and relationships are highlighted in the text, showing the agent's "memory" of this document.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 border rounded-lg prose prose-sm">
          {annotatedText.map((item, index) => {
            if (typeof item === 'string') {
              return <span key={index}>{item}</span>;
            }
            return (
              <span key={index} className={`relative p-1 rounded-md ${getHighlightColor(item.confidence)}`}>
                {item.text}
                <Badge className="absolute -top-2 -right-2 text-xs">
                  {(item.confidence * 100).toFixed(0)}%
                </Badge>
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
