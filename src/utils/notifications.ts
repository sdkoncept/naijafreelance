import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
  | "order_received"
  | "order_delivered"
  | "order_completed"
  | "message"
  | "payment"
  | "review"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "verification_approved"
  | "off_platform_warning"
  | "loyalty_tier_upgrade";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string | null;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedId = null,
}: CreateNotificationParams): Promise<void> {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
    });

    if (error && error.code !== "PGRST205") {
      console.error("Error creating notification:", error);
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// Helper functions for common notifications
export async function notifyOrderReceived(
  freelancerId: string,
  orderId: string,
  clientName: string
): Promise<void> {
  await createNotification({
    userId: freelancerId,
    type: "order_received",
    title: "New Order Received",
    message: `You have received a new order from ${clientName}. Check your dashboard for details.`,
    relatedId: orderId,
  });
}

export async function notifyOrderDelivered(
  clientId: string,
  orderId: string,
  freelancerName: string
): Promise<void> {
  await createNotification({
    userId: clientId,
    type: "order_delivered",
    title: "Order Delivered",
    message: `${freelancerName} has delivered your order. Please review and accept.`,
    relatedId: orderId,
  });
}

export async function notifyOrderCompleted(
  userId: string,
  orderId: string,
  isClient: boolean
): Promise<void> {
  await createNotification({
    userId,
    type: "order_completed",
    title: "Order Completed",
    message: isClient
      ? "Your order has been completed. Thank you for using NaijaFreelance!"
      : "Order marked as completed. Payment will be released shortly.",
    relatedId: orderId,
  });
}

export async function notifyNewMessage(
  receiverId: string,
  senderName: string
): Promise<void> {
  await createNotification({
    userId: receiverId,
    type: "message",
    title: "New Message",
    message: `You have a new message from ${senderName}`,
  });
}

export async function notifyWithdrawalApproved(
  freelancerId: string,
  withdrawalId: string,
  amount: number
): Promise<void> {
  await createNotification({
    userId: freelancerId,
    type: "withdrawal_approved",
    title: "Withdrawal Approved",
    message: `Your withdrawal request of ₦${amount.toLocaleString()} has been approved and processed.`,
    relatedId: withdrawalId,
  });
}

export async function notifyWithdrawalRejected(
  freelancerId: string,
  withdrawalId: string,
  reason?: string
): Promise<void> {
  await createNotification({
    userId: freelancerId,
    type: "withdrawal_rejected",
    title: "Withdrawal Rejected",
    message: reason
      ? `Your withdrawal request was rejected: ${reason}`
      : "Your withdrawal request was rejected. Please contact support for more information.",
    relatedId: withdrawalId,
  });
}

export async function notifyVerificationApproved(userId: string): Promise<void> {
  await createNotification({
    userId,
    type: "verification_approved",
    title: "Account Verified",
    message: "Your account has been verified! You can now purchase gigs on the platform.",
  });
}

