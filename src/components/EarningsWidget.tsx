import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

interface EarningsWidgetProps {
  totalEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  recentTransactions?: Array<{
    id: string;
    amount: number;
    type: string;
    date: string;
  }>;
}

export default function EarningsWidget({
  totalEarnings,
  pendingBalance,
  availableBalance,
}: EarningsWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Earnings Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <p className="text-sm text-gray-600">Total Earnings</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₦{totalEarnings.toLocaleString()}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₦{pendingBalance.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Available</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₦{availableBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
            <Link to="/freelancer/earnings">View Details</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/freelancer/earnings">Withdraw Funds</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


