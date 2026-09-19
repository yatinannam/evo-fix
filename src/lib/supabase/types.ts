// Auto-generated shape for the emp-dash Supabase project.
// When you have real credentials, regenerate with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts

export type TaskStatus = 'draft' | 'not_started' | 'in_progress' | 'submitted_for_review' | 'completed';
export type RoleName   = 'super_admin' | 'admin' | 'domain_head' | 'employee';
export type RoleInDomain = 'head' | 'member';
export type ChannelType  = 'domain' | 'dm';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type FieldType = 'text' | 'table' | 'select' | 'date' | 'checklist' | 'url' | 'keyvalue' | 'textarea' | 'multiselect' | 'number';
export type NoteVisibility = 'private' | 'upward';
export type NotificationType = 'task_assigned' | 'status_changed' | 'comment_added' | 'mention' | 'review_overdue' | 'review_claimed';
export type AuditAction = 'profile_created' | 'role_changed' | 'super_admin_created' | 'domain_reassigned' | 'task_created' | 'status_changed';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  columns?: string[]; // for 'table' type
}

export interface Link      { label: string; url: string }
export interface Attachment { filename: string; url: string; size?: number }

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      emp_roles: {
        Row: { id: string; name: RoleName; created_at: string };
        Insert: { id?: string; name: RoleName; created_at?: string };
        Update: { id?: string; name?: RoleName; created_at?: string };
      };
      emp_profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          role_id: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          role_id: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          role_id?: string;
          created_by?: string | null;
          updated_at?: string;
        };
      };
      emp_domains: {
        Row: { id: string; name: string; slug: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; created_at?: string };
        Update: { id?: string; name?: string; slug?: string };
      };
      emp_domain_admin_map: {
        Row: { id: string; domain_id: string; admin_profile_id: string; created_at: string };
        Insert: { id?: string; domain_id: string; admin_profile_id: string; created_at?: string };
        Update: { id?: string; domain_id?: string; admin_profile_id?: string };
      };
      emp_user_domains: {
        Row: { id: string; profile_id: string; domain_id: string; role_in_domain: RoleInDomain; created_at: string };
        Insert: { id?: string; profile_id: string; domain_id: string; role_in_domain: RoleInDomain; created_at?: string };
        Update: { id?: string; profile_id?: string; domain_id?: string; role_in_domain?: RoleInDomain };
      };
      emp_domain_field_templates: {
        Row: { id: string; domain_id: string; schema: Json; updated_by: string | null; updated_at: string };
        Insert: { id?: string; domain_id: string; schema: Json; updated_by?: string | null; updated_at?: string };
        Update: { id?: string; domain_id?: string; schema?: Json; updated_by?: string | null; updated_at?: string };
      };
      emp_tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          domain_id: string;
          priority: Priority;
          status: TaskStatus;
          deadline: string | null;
          tags: string[];
          links: Json;
          custom_fields: Json;
          reviewing_by: string | null;
          reviewing_since: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          domain_id: string;
          priority?: Priority;
          status?: TaskStatus;
          deadline?: string | null;
          tags?: string[];
          links?: Json;
          custom_fields?: Json;
          reviewing_by?: string | null;
          reviewing_since?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          domain_id?: string;
          priority?: Priority;
          status?: TaskStatus;
          deadline?: string | null;
          tags?: string[];
          links?: Json;
          custom_fields?: Json;
          reviewing_by?: string | null;
          reviewing_since?: string | null;
          updated_at?: string;
        };
      };
      emp_task_assignees: {
        Row: { task_id: string; profile_id: string; assigned_by: string; created_at: string };
        Insert: { task_id: string; profile_id: string; assigned_by: string; created_at?: string };
        Update: { task_id?: string; profile_id?: string; assigned_by?: string };
      };
      emp_task_status_history: {
        Row: {
          id: string;
          task_id: string;
          changed_by: string;
          from_status: TaskStatus | null;
          to_status: TaskStatus;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          changed_by: string;
          from_status?: TaskStatus | null;
          to_status: TaskStatus;
          comment?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      emp_task_milestones: {
        Row: {
          id: string;
          task_id: string;
          title: string;
          due_date: string | null;
          done: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          title: string;
          due_date?: string | null;
          done?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: { id?: string; title?: string; due_date?: string | null; done?: boolean; sort_order?: number };
      };
      emp_personal_notes: {
        Row: {
          id: string;
          author_id: string;
          about_profile_id: string | null;
          task_id: string | null;
          body: string;
          visibility_scope: NoteVisibility;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          about_profile_id?: string | null;
          task_id?: string | null;
          body: string;
          visibility_scope?: NoteVisibility;
          created_at?: string;
          updated_at?: string;
        };
        Update: { id?: string; body?: string; visibility_scope?: NoteVisibility; updated_at?: string };
      };
      emp_files: {
        Row: {
          id: string;
          task_id: string | null;
          domain_id: string;
          filename: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id?: string | null;
          domain_id: string;
          filename: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: { id?: string; task_id?: string | null; filename?: string };
      };
      emp_file_versions: {
        Row: { id: string; file_id: string; version: number; storage_url: string; uploaded_by: string; created_at: string };
        Insert: { id?: string; file_id: string; version: number; storage_url: string; uploaded_by: string; created_at?: string };
        Update: never;
      };
      emp_channels: {
        Row: { id: string; domain_id: string | null; type: ChannelType; name: string | null; created_at: string };
        Insert: { id?: string; domain_id?: string | null; type: ChannelType; name?: string | null; created_at?: string };
        Update: { id?: string; name?: string | null };
      };
      emp_channel_members: {
        Row: { channel_id: string; profile_id: string; joined_at: string };
        Insert: { channel_id: string; profile_id: string; joined_at?: string };
        Update: never;
      };
      emp_messages: {
        Row: { id: string; channel_id: string; sender_id: string; body: string; attachments: Json; created_at: string; updated_at: string };
        Insert: { id?: string; channel_id: string; sender_id: string; body: string; attachments?: Json; created_at?: string; updated_at?: string };
        Update: { id?: string; body?: string; attachments?: Json; updated_at?: string };
      };
      emp_task_comments: {
        Row: { id: string; task_id: string; author_id: string; body: string; attachments: Json; created_at: string; updated_at: string };
        Insert: { id?: string; task_id: string; author_id: string; body: string; attachments?: Json; created_at?: string; updated_at?: string };
        Update: { id?: string; body?: string; attachments?: Json; updated_at?: string };
      };
      emp_notifications: {
        Row: { id: string; profile_id: string; type: NotificationType; payload: Json; read: boolean; created_at: string };
        Insert: { id?: string; profile_id: string; type: NotificationType; payload?: Json; read?: boolean; created_at?: string };
        Update: { id?: string; read?: boolean };
      };
      emp_audit_log: {
        Row: { id: string; actor_id: string; action: AuditAction; target: Json; created_at: string };
        Insert: { id?: string; actor_id: string; action: AuditAction; target?: Json; created_at?: string };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      task_status: TaskStatus;
      role_name: RoleName;
      role_in_domain: RoleInDomain;
      channel_type: ChannelType;
      priority: Priority;
    };
  };
}

// Convenience row types
export type EmpProfile      = Database['public']['Tables']['emp_profiles']['Row'];
export type EmpRole         = Database['public']['Tables']['emp_roles']['Row'];
export type EmpDomain       = Database['public']['Tables']['emp_domains']['Row'];
export type EmpTask         = Database['public']['Tables']['emp_tasks']['Row'];
export type EmpTaskHistory  = Database['public']['Tables']['emp_task_status_history']['Row'];
export type EmpTaskComment  = Database['public']['Tables']['emp_task_comments']['Row'];
export type EmpTaskAssignee = Database['public']['Tables']['emp_task_assignees']['Row'];
export type EmpMessage      = Database['public']['Tables']['emp_messages']['Row'];
export type EmpChannel      = Database['public']['Tables']['emp_channels']['Row'];
export type EmpFile         = Database['public']['Tables']['emp_files']['Row'];
export type EmpFileVersion  = Database['public']['Tables']['emp_file_versions']['Row'];
export type EmpUserDomain   = Database['public']['Tables']['emp_user_domains']['Row'];
export type EmpDomainFieldTemplate = Database['public']['Tables']['emp_domain_field_templates']['Row'];
export type EmpTaskMilestone = Database['public']['Tables']['emp_task_milestones']['Row'];
export type EmpPersonalNote  = Database['public']['Tables']['emp_personal_notes']['Row'];
export type EmpNotification  = Database['public']['Tables']['emp_notifications']['Row'];
export type EmpAuditLog      = Database['public']['Tables']['emp_audit_log']['Row'];
