// src/components/ui/financial-data-table.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FinancialMetric {
  metric: string;
  value: string | number;
  change?: string;
}

interface FinancialDataTableProps {
  title: string;
  metrics: FinancialMetric[];
}

export const FinancialDataTable = ({ title, metrics }: FinancialDataTableProps) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Change (YoY)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((item) => (
            <TableRow key={item.metric}>
              <TableCell className="font-medium">{item.metric}</TableCell>
              <TableCell>{item.value}</TableCell>
              <TableCell className={item.change?.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                {item.change || 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
