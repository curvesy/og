'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContractDetailsCardProps {
  vendor: string;
  amount: number;
  renewalDate: string;
  status: "Active" | "Expired" | "Pending";
}

export const ContractDetailsCard = ({ vendor, amount, renewalDate, status }: ContractDetailsCardProps) => {
  const getStatusVariant = () => {
    switch (status) {
      case "Active":
        return "default";
      case "Expired":
        return "destructive";
      case "Pending":
        return "secondary";
    }
  };

  return (
    <Card className="my-4 border-blue-500">
      <CardHeader>
        <CardTitle className="text-lg">Contract Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Vendor</span>
          <span>{vendor}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Amount</span>
          <span>${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Renewal Date</span>
          <span>{new Date(renewalDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Status</span>
          <Badge variant={getStatusVariant()}>{status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
