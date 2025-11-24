import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuditAction = 
  // Authentication
  | "login"
  | "login_failed"
  | "logout"
  | "signup"
  | "password_change"
  | "password_reset_request"
  // User Management
  | "user_update"
  | "user_type_change"
  | "user_delete"
  | "profile_update"
  // Gigs
  | "gig_create"
  | "gig_update"
  | "gig_delete"
  | "gig_pause"
  | "gig_activate"
  // Orders
  | "order_create"
  | "order_update"
  | "order_status_change"
  | "order_cancel"
  | "order_complete"
  // Payments
  | "payment_initiated"
  | "payment_completed"
  | "payment_failed"
  | "payment_refunded"
  // Jobs
  | "job_create"
  | "job_update"
  | "job_close"
  | "job_cancel"
  | "job_apply"
  // Messages
  | "message_sent"
  | "message_read"
  // Reviews
  | "review_create"
  | "review_update"
  | "review_delete"
  // Legacy (for backward compatibility)
  | "enrollee_create"
  | "enrollee_update"
  | "enrollee_delete"
  | "dependant_create"
  | "dependant_update"
  | "dependant_delete"
  | "payment_verify"
  | "role_change";

interface AuditLogData {
  action: AuditAction;
  table_name: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
}

export const useAuditLog = () => {
  const logAction = async ({
    action,
    table_name,
    record_id,
    old_data,
    new_data,
  }: AuditLogData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn("No user found for audit log");
        return;
      }

      const { error } = await supabase.from("audit_logs").insert({
        user_id: user.id,
        action,
        table_name,
        record_id: record_id || null,
        old_data: old_data || null,
        new_data: new_data || null,
      });

      if (error) {
        console.error("Failed to create audit log:", error);
      }
    } catch (error) {
      console.error("Error creating audit log:", error);
    }
  };

  return { logAction };
};

// Helper function for direct audit logging without hook
export const createAuditLog = async ({
  action,
  table_name,
  record_id,
  old_data,
  new_data,
}: AuditLogData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("No user found for audit log");
      return;
    }

    const { error } = await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      table_name,
      record_id: record_id || null,
      old_data: old_data || null,
      new_data: new_data || null,
    });

    if (error) {
      console.error("Failed to create audit log:", error);
    }
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};
