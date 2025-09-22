// src/components/ui/stock-ticker.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StockTicker = ({ stock, price, delta }: { stock: string; price: number; delta: number }) => (
  <Card className="w-64">
    <CardHeader>
      <CardTitle>{stock}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">${price.toFixed(2)}</p>
      <p className={delta >= 0 ? 'text-green-500' : 'text-red-500'}>
        {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
      </p>
    </CardContent>
  </Card>
);
