import { CheckCircle, Clock, Package, DollarSign, MessageSquare, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderProgressTimelineProps {
  status: string;
  payment?: {
    status: string;
    paid_at: string | null;
  };
  created_at: string;
  delivered_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
}

export default function OrderProgressTimeline({
  status,
  payment,
  created_at,
  delivered_at,
  completed_at,
  cancelled_at,
}: OrderProgressTimelineProps) {
  const stages = [
    {
      id: "order_placed",
      label: "Order Placed",
      icon: Package,
      completed: true,
      date: created_at,
      description: "Your order has been created",
    },
    {
      id: "payment",
      label: "Payment",
      icon: DollarSign,
      completed: payment?.status === "completed",
      date: payment?.paid_at || null,
      description: payment?.status === "completed" ? "Payment received" : "Awaiting payment",
    },
    {
      id: "in_progress",
      label: "Work in Progress",
      icon: Clock,
      completed: ["in_progress", "delivered", "completed"].includes(status),
      date: status === "in_progress" ? new Date().toISOString() : null,
      description: "Freelancer is working on your order",
    },
    {
      id: "delivered",
      label: "Delivered",
      icon: CheckCircle,
      completed: ["delivered", "completed"].includes(status),
      date: delivered_at || null,
      description: "Work has been delivered for review",
    },
    {
      id: "completed",
      label: "Completed",
      icon: CheckCircle,
      completed: status === "completed",
      date: completed_at || null,
      description: "Order completed successfully",
    },
  ];

  const cancelled = status === "cancelled";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = !cancelled && stage.completed && !stages[index + 1]?.completed;
            const isPast = cancelled || stages.slice(0, index + 1).every((s) => s.completed);

            return (
              <div key={stage.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      stage.completed && !cancelled
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-slate-700 text-white"
                        : cancelled && stage.id === "order_placed"
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {cancelled && stage.id === "order_placed" ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < stages.length - 1 && (
                    <div
                      className={`w-0.5 h-12 mt-2 ${
                        stage.completed && !cancelled ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`font-medium ${
                        stage.completed && !cancelled
                          ? "text-green-700"
                          : isActive
                          ? "text-slate-700"
                          : "text-gray-500"
                      }`}
                    >
                      {stage.label}
                    </h4>
                    {stage.completed && stage.date && (
                      <span className="text-xs text-gray-500">
                        {new Date(stage.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                  {isActive && (
                    <Badge variant="default" className="mt-2">
                      Current Stage
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {cancelled && cancelled_at && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Order Cancelled:</strong> {new Date(cancelled_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

