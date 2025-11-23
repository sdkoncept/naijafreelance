export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dependants: {
        Row: {
          address: string | null
          allergies: string | null
          cin: string | null
          created_at: string | null
          date_of_birth: string
          enrollee_id: string
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          genotype: Database["public"]["Enums"]["genotype_type"] | null
          id: string
          last_name: string
          middle_name: string | null
          phone_number: string | null
          photo_url: string | null
          relationship: Database["public"]["Enums"]["relationship_type"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          cin?: string | null
          created_at?: string | null
          date_of_birth: string
          enrollee_id: string
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          genotype?: Database["public"]["Enums"]["genotype_type"] | null
          id?: string
          last_name: string
          middle_name?: string | null
          phone_number?: string | null
          photo_url?: string | null
          relationship: Database["public"]["Enums"]["relationship_type"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          cin?: string | null
          created_at?: string | null
          date_of_birth?: string
          enrollee_id?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          genotype?: Database["public"]["Enums"]["genotype_type"] | null
          id?: string
          last_name?: string
          middle_name?: string | null
          phone_number?: string | null
          photo_url?: string | null
          relationship?: Database["public"]["Enums"]["relationship_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dependants_enrollee_id_fkey"
            columns: ["enrollee_id"]
            isOneToOne: false
            referencedRelation: "enrollees"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollees: {
        Row: {
          allergies: string | null
          blood_group: Database["public"]["Enums"]["blood_group_type"]
          cin: string
          created_at: string | null
          created_by: string
          date_of_birth: string
          email: string | null
          enrollment_type: Database["public"]["Enums"]["enrollment_type"]
          facility: string
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          genotype: Database["public"]["Enums"]["genotype_type"]
          group_member_count: number | null
          group_name: string | null
          health_plan: Database["public"]["Enums"]["health_plan_type"]
          home_address: string
          id: string
          last_name: string
          lga: string
          middle_name: string | null
          payment_date: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status_type"]
          payment_verified_at: string | null
          payment_verified_by: string | null
          phone_number: string
          photo_url: string | null
          plan_expiry_date: string
          plan_start_date: string
          primary_enrollee_id: string | null
          registration_date: string
          updated_at: string | null
        }
        Insert: {
          allergies?: string | null
          blood_group: Database["public"]["Enums"]["blood_group_type"]
          cin: string
          created_at?: string | null
          created_by: string
          date_of_birth: string
          email?: string | null
          enrollment_type?: Database["public"]["Enums"]["enrollment_type"]
          facility: string
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          genotype: Database["public"]["Enums"]["genotype_type"]
          group_member_count?: number | null
          group_name?: string | null
          health_plan?: Database["public"]["Enums"]["health_plan_type"]
          home_address: string
          id?: string
          last_name: string
          lga: string
          middle_name?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status_type"]
          payment_verified_at?: string | null
          payment_verified_by?: string | null
          phone_number: string
          photo_url?: string | null
          plan_expiry_date?: string
          plan_start_date?: string
          primary_enrollee_id?: string | null
          registration_date?: string
          updated_at?: string | null
        }
        Update: {
          allergies?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group_type"]
          cin?: string
          created_at?: string | null
          created_by?: string
          date_of_birth?: string
          email?: string | null
          enrollment_type?: Database["public"]["Enums"]["enrollment_type"]
          facility?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          genotype?: Database["public"]["Enums"]["genotype_type"]
          group_member_count?: number | null
          group_name?: string | null
          health_plan?: Database["public"]["Enums"]["health_plan_type"]
          home_address?: string
          id?: string
          last_name?: string
          lga?: string
          middle_name?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status_type"]
          payment_verified_at?: string | null
          payment_verified_by?: string | null
          phone_number?: string
          photo_url?: string | null
          plan_expiry_date?: string
          plan_start_date?: string
          primary_enrollee_id?: string | null
          registration_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollees_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollees_payment_verified_by_fkey"
            columns: ["payment_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollees_primary_enrollee_id_fkey"
            columns: ["primary_enrollee_id"]
            isOneToOne: false
            referencedRelation: "enrollees"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          enrollee_id: string
          id: string
          new_facility: string
          old_facility: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          enrollee_id: string
          id?: string
          new_facility: string
          old_facility: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          enrollee_id?: string
          id?: string
          new_facility?: string
          old_facility?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_history_enrollee_id_fkey"
            columns: ["enrollee_id"]
            isOneToOne: false
            referencedRelation: "enrollees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_cin: { Args: never; Returns: string }
      generate_dependant_cin: {
        Args: { enrollee_cin: string }
        Returns: string
      }
      generate_enrollee_cin: {
        Args: {
          lga: string
          plan: Database["public"]["Enums"]["health_plan_type"]
        }
        Returns: string
      }
      get_expiring_enrollees: {
        Args: { months_ahead?: number }
        Returns: {
          cin: string
          days_until_expiry: number
          first_name: string
          id: string
          last_name: string
          phone_number: string
          plan_expiry_date: string
        }[]
      }
      get_lga_abbreviation: { Args: { lga_name: string }; Returns: string }
      get_monthly_enrollments: {
        Args: { year_param?: number }
        Returns: {
          enrollment_count: number
          group_member_count: number
          month_name: string
          month_number: number
          primary_count: number
          single_count: number
        }[]
      }
      get_plan_abbreviation: {
        Args: { plan: Database["public"]["Enums"]["health_plan_type"] }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_plan_expired: { Args: { enrollee_id: string }; Returns: boolean }
      is_primary_enrollee: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "viewer"
      blood_group_type: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-"
      enrollment_type: "single" | "primary" | "group_member"
      gender_type: "Male" | "Female" | "Other"
      genotype_type: "AA" | "AS" | "SS"
      health_plan_type: "bronze" | "silver" | "formal" | "enhanced" | "equity"
      payment_status_type: "pending" | "confirmed" | "failed"
      relationship_type: "Spouse" | "Child" | "Parent" | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "viewer"],
      blood_group_type: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
      enrollment_type: ["single", "primary", "group_member"],
      gender_type: ["Male", "Female", "Other"],
      genotype_type: ["AA", "AS", "SS"],
      health_plan_type: ["bronze", "silver", "formal", "enhanced", "equity"],
      payment_status_type: ["pending", "confirmed", "failed"],
      relationship_type: ["Spouse", "Child", "Parent", "Other"],
    },
  },
} as const
