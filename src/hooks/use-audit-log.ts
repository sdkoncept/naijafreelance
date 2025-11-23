import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuditAction = 
  | "login"
  | "login_failed"
  | "logout"
  | "signup"
  | "password_change"
  | "password_reset_request"
  | "enrollee_create"
  | "enrollee_update"
  | "enrollee_delete"
  | "dependant_create"
  | "dependant_update"
  | "dependant_delete"
  | "payment_verify"
  | "role_change"
  | "user_delete";

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
