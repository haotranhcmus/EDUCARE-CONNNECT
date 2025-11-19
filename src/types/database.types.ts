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
      ai_processing: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          failed_at: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          processing_status: string | null
          processing_time_seconds: number | null
          profile_id: string
          progress: number | null
          result_sessions: Json | null
          student_id: string
          text_content: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          processing_status?: string | null
          processing_time_seconds?: number | null
          profile_id: string
          progress?: number | null
          result_sessions?: Json | null
          student_id: string
          text_content?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          processing_status?: string | null
          processing_time_seconds?: number | null
          profile_id?: string
          progress?: number | null
          result_sessions?: Json | null
          student_id?: string
          text_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      backups: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string | null
          expires_at: string | null
          file_size: number | null
          file_url: string | null
          id: string
          profile_id: string
          status: string | null
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          profile_id: string
          status?: string | null
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          profile_id?: string
          status?: string | null
        }
        Relationships: []
      }
      behavior_groups: {
        Row: {
          code: string
          color_code: string | null
          common_tips: Json | null
          created_at: string | null
          description_en: string | null
          description_vn: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_vn: string
          order_index: number
          updated_at: string | null
        }
        Insert: {
          code: string
          color_code?: string | null
          common_tips?: Json | null
          created_at?: string | null
          description_en?: string | null
          description_vn?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_vn: string
          order_index: number
          updated_at?: string | null
        }
        Update: {
          code?: string
          color_code?: string | null
          common_tips?: Json | null
          created_at?: string | null
          description_en?: string | null
          description_vn?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_vn?: string
          order_index?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      behavior_incidents: {
        Row: {
          antecedent: string | null
          behavior_description: string
          behavior_library_id: string | null
          consequence: string | null
          created_at: string | null
          duration_minutes: number | null
          environmental_factors: string | null
          frequency_count: number | null
          id: string
          incident_number: number
          intensity_level: number | null
          intervention_effective: boolean | null
          intervention_used: string | null
          notes: string | null
          occurred_at: string
          recorded_by: string
          requires_followup: boolean | null
          session_log_id: string
          updated_at: string | null
          witnessed_by: string | null
        }
        Insert: {
          antecedent?: string | null
          behavior_description: string
          behavior_library_id?: string | null
          consequence?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          environmental_factors?: string | null
          frequency_count?: number | null
          id?: string
          incident_number: number
          intensity_level?: number | null
          intervention_effective?: boolean | null
          intervention_used?: string | null
          notes?: string | null
          occurred_at: string
          recorded_by: string
          requires_followup?: boolean | null
          session_log_id: string
          updated_at?: string | null
          witnessed_by?: string | null
        }
        Update: {
          antecedent?: string | null
          behavior_description?: string
          behavior_library_id?: string | null
          consequence?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          environmental_factors?: string | null
          frequency_count?: number | null
          id?: string
          incident_number?: number
          intensity_level?: number | null
          intervention_effective?: boolean | null
          intervention_used?: string | null
          notes?: string | null
          occurred_at?: string
          recorded_by?: string
          requires_followup?: boolean | null
          session_log_id?: string
          updated_at?: string | null
          witnessed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "behavior_incidents_behavior_library_id_fkey"
            columns: ["behavior_library_id"]
            isOneToOne: false
            referencedRelation: "behavior_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_incidents_session_log_id_fkey"
            columns: ["session_log_id"]
            isOneToOne: false
            referencedRelation: "session_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_library: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          behavior_code: string
          behavior_group_id: string
          created_at: string | null
          explanation: Json | null
          icon: string | null
          id: string
          is_active: boolean | null
          keywords_en: Json | null
          keywords_vn: Json | null
          last_used_at: string | null
          manifestation_en: string | null
          manifestation_vn: string | null
          name_en: string
          name_vn: string
          prevention_strategies: Json | null
          related_behaviors: Json | null
          solutions: Json | null
          sources: Json | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          behavior_code: string
          behavior_group_id: string
          created_at?: string | null
          explanation?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          keywords_en?: Json | null
          keywords_vn?: Json | null
          last_used_at?: string | null
          manifestation_en?: string | null
          manifestation_vn?: string | null
          name_en: string
          name_vn: string
          prevention_strategies?: Json | null
          related_behaviors?: Json | null
          solutions?: Json | null
          sources?: Json | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          behavior_code?: string
          behavior_group_id?: string
          created_at?: string | null
          explanation?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          keywords_en?: Json | null
          keywords_vn?: Json | null
          last_used_at?: string | null
          manifestation_en?: string | null
          manifestation_vn?: string | null
          name_en?: string
          name_vn?: string
          prevention_strategies?: Json | null
          related_behaviors?: Json | null
          solutions?: Json | null
          sources?: Json | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "behavior_library_behavior_group_id_fkey"
            columns: ["behavior_group_id"]
            isOneToOne: false
            referencedRelation: "behavior_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          code: string | null
          created_at: string | null
          default_goals: Json | null
          deleted_at: string | null
          description: string | null
          difficulty_level: string | null
          domain: string
          estimated_duration: number | null
          id: string
          instructions: Json | null
          is_public: boolean | null
          is_template: boolean | null
          last_used_at: string | null
          materials_needed: Json | null
          profile_id: string | null
          rating_avg: number | null
          rating_count: number | null
          tags: Json | null
          target_age_max: number | null
          target_age_min: number | null
          tips: Json | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          default_goals?: Json | null
          deleted_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          domain: string
          estimated_duration?: number | null
          id?: string
          instructions?: Json | null
          is_public?: boolean | null
          is_template?: boolean | null
          last_used_at?: string | null
          materials_needed?: Json | null
          profile_id?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          tags?: Json | null
          target_age_max?: number | null
          target_age_min?: number | null
          tips?: Json | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          default_goals?: Json | null
          deleted_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          domain?: string
          estimated_duration?: number | null
          id?: string
          instructions?: Json | null
          is_public?: boolean | null
          is_template?: boolean | null
          last_used_at?: string | null
          materials_needed?: Json | null
          profile_id?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          tags?: Json | null
          target_age_max?: number | null
          target_age_min?: number | null
          tips?: Json | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_library_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_evaluations: {
        Row: {
          achievement_level: number | null
          content_goal_id: string
          created_at: string | null
          id: string
          notes: string | null
          session_log_id: string
          status: string
          support_level: string | null
          updated_at: string | null
        }
        Insert: {
          achievement_level?: number | null
          content_goal_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          session_log_id: string
          status: string
          support_level?: string | null
          updated_at?: string | null
        }
        Update: {
          achievement_level?: number | null
          content_goal_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          session_log_id?: string
          status?: string
          support_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_evaluations_content_goal_id_fkey"
            columns: ["content_goal_id"]
            isOneToOne: false
            referencedRelation: "session_content_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_evaluations_session_log_id_fkey"
            columns: ["session_log_id"]
            isOneToOne: false
            referencedRelation: "session_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_attachments: {
        Row: {
          caption: string | null
          created_at: string | null
          duration: number | null
          file_size: number
          filename: string
          height: number | null
          id: string
          media_type: string
          mime_type: string
          session_log_id: string
          thumbnail_url: string | null
          updated_at: string | null
          uploaded_by: string
          url: string
          width: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          duration?: number | null
          file_size: number
          filename: string
          height?: number | null
          id?: string
          media_type: string
          mime_type: string
          session_log_id: string
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by: string
          url: string
          width?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          duration?: number | null
          file_size?: number
          filename?: string
          height?: number | null
          id?: string
          media_type?: string
          mime_type?: string
          session_log_id?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_attachments_session_log_id_fkey"
            columns: ["session_log_id"]
            isOneToOne: false
            referencedRelation: "session_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          deleted_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          push_sent: boolean | null
          push_sent_at: string | null
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_messages: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_read: boolean | null
          message: string
          parent_thread_id: string | null
          read_at: string | null
          recipient_id: string
          reply_to_message_id: string | null
          sender_id: string
          student_id: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          parent_thread_id?: string | null
          read_at?: string | null
          recipient_id: string
          reply_to_message_id?: string | null
          sender_id: string
          student_id: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          parent_thread_id?: string | null
          read_at?: string | null
          recipient_id?: string
          reply_to_message_id?: string | null
          sender_id?: string
          student_id?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_messages_parent_thread_id_fkey"
            columns: ["parent_thread_id"]
            isOneToOne: false
            referencedRelation: "parent_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "parent_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_favorites: {
        Row: {
          behavior_library_id: string
          created_at: string | null
          id: string
          profile_id: string
        }
        Insert: {
          behavior_library_id: string
          created_at?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          behavior_library_id?: string
          created_at?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          emergency_contact: string | null
          first_name: string
          id: string
          is_active: boolean | null
          language: string | null
          last_login_at: string | null
          last_name: string
          notes: string | null
          occupation: string | null
          phone: string | null
          push_token: string | null
          relationship_to_student: string | null
          role: string
          school: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          emergency_contact?: string | null
          first_name: string
          id: string
          is_active?: boolean | null
          language?: string | null
          last_login_at?: string | null
          last_name: string
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          push_token?: string | null
          relationship_to_student?: string | null
          role: string
          school?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          emergency_contact?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_login_at?: string | null
          last_name?: string
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          push_token?: string | null
          relationship_to_student?: string | null
          role?: string
          school?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          date_from: string
          date_to: string
          expires_at: string | null
          file_size: number | null
          file_url: string | null
          format: string
          id: string
          profile_id: string
          report_type: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          date_from: string
          date_to: string
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          format: string
          id?: string
          profile_id: string
          report_type: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          date_from?: string
          date_to?: string
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          format?: string
          id?: string
          profile_id?: string
          report_type?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      session_content_goals: {
        Row: {
          created_at: string | null
          description: string
          goal_type: string
          id: string
          is_primary: boolean | null
          order_index: number
          session_content_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          goal_type: string
          id?: string
          is_primary?: boolean | null
          order_index: number
          session_content_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          goal_type?: string
          id?: string
          is_primary?: boolean | null
          order_index?: number
          session_content_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_content_goals_session_content_id_fkey"
            columns: ["session_content_id"]
            isOneToOne: false
            referencedRelation: "session_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      session_contents: {
        Row: {
          content_library_id: string | null
          created_at: string | null
          description: string | null
          domain: string
          estimated_duration: number | null
          id: string
          instructions: string | null
          materials_needed: string | null
          notes: string | null
          order_index: number
          session_id: string
          tips: string | null
          title: string
          updated_at: string | null
          user_custom_content_id: string | null
        }
        Insert: {
          content_library_id?: string | null
          created_at?: string | null
          description?: string | null
          domain: string
          estimated_duration?: number | null
          id?: string
          instructions?: string | null
          materials_needed?: string | null
          notes?: string | null
          order_index: number
          session_id: string
          tips?: string | null
          title: string
          updated_at?: string | null
          user_custom_content_id?: string | null
        }
        Update: {
          content_library_id?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string
          estimated_duration?: number | null
          id?: string
          instructions?: string | null
          materials_needed?: string | null
          notes?: string | null
          order_index?: number
          session_id?: string
          tips?: string | null
          title?: string
          updated_at?: string | null
          user_custom_content_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_contents_content_library_id_fkey"
            columns: ["content_library_id"]
            isOneToOne: false
            referencedRelation: "content_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_contents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_contents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_contents_user_custom_content_id_fkey"
            columns: ["user_custom_content_id"]
            isOneToOne: false
            referencedRelation: "user_custom_content"
            referencedColumns: ["id"]
          },
        ]
      }
      session_logs: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          attitude_summary: string | null
          challenges_faced: string | null
          completed_at: string | null
          cooperation_level: number | null
          created_at: string | null
          created_by: string
          energy_level: number | null
          focus_level: number | null
          id: string
          independence_level: number | null
          logged_at: string | null
          mood: string | null
          overall_rating: number | null
          progress_notes: string | null
          recommendations: string | null
          session_id: string
          teacher_notes_text: string | null
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          attitude_summary?: string | null
          challenges_faced?: string | null
          completed_at?: string | null
          cooperation_level?: number | null
          created_at?: string | null
          created_by: string
          energy_level?: number | null
          focus_level?: number | null
          id?: string
          independence_level?: number | null
          logged_at?: string | null
          mood?: string | null
          overall_rating?: number | null
          progress_notes?: string | null
          recommendations?: string | null
          session_id: string
          teacher_notes_text?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          attitude_summary?: string | null
          challenges_faced?: string | null
          completed_at?: string | null
          cooperation_level?: number | null
          created_at?: string | null
          created_by?: string
          energy_level?: number | null
          focus_level?: number | null
          id?: string
          independence_level?: number | null
          logged_at?: string | null
          mood?: string | null
          overall_rating?: number | null
          progress_notes?: string | null
          recommendations?: string | null
          session_id?: string
          teacher_notes_text?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "session_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_media: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          media_type: string
          session_log_id: string
          updated_at: string | null
          uploaded_by: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type: string
          session_log_id: string
          updated_at?: string | null
          uploaded_by: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string
          session_log_id?: string
          updated_at?: string | null
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_media_session_log_id_fkey"
            columns: ["session_log_id"]
            isOneToOne: false
            referencedRelation: "session_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          created_by: string
          creation_method: string | null
          deleted_at: string | null
          duration_minutes: number | null
          end_time: string
          has_evaluation: boolean | null
          id: string
          location: string | null
          notes: string | null
          session_date: string
          start_time: string
          status: string | null
          student_id: string
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          created_by?: string
          creation_method?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          end_time: string
          has_evaluation?: boolean | null
          id?: string
          location?: string | null
          notes?: string | null
          session_date: string
          start_time: string
          status?: string | null
          student_id: string
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          created_by?: string
          creation_method?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          end_time?: string
          has_evaluation?: boolean | null
          id?: string
          location?: string | null
          notes?: string | null
          session_date?: string
          start_time?: string
          status?: string | null
          student_id?: string
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_parents: {
        Row: {
          activated_at: string | null
          can_receive_notifications: boolean | null
          can_view_reports: boolean | null
          created_at: string | null
          deleted_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_primary: boolean | null
          parent_email: string | null
          parent_id: string
          permissions: Json | null
          relationship: string
          relationship_note: string | null
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          can_receive_notifications?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_primary?: boolean | null
          parent_email?: string | null
          parent_id: string
          permissions?: Json | null
          relationship: string
          relationship_note?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          can_receive_notifications?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_primary?: boolean | null
          parent_email?: string | null
          parent_id?: string
          permissions?: Json | null
          relationship?: string
          relationship_note?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_parents_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parents_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string
          deleted_at: string | null
          diagnosis: string | null
          first_name: string
          gender: string
          id: string
          last_name: string
          nickname: string | null
          notes: string | null
          parent_name: string | null
          parent_phone: string | null
          profile_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth: string
          deleted_at?: string | null
          diagnosis?: string | null
          first_name: string
          gender: string
          id?: string
          last_name: string
          nickname?: string | null
          notes?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          profile_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string
          deleted_at?: string | null
          diagnosis?: string | null
          first_name?: string
          gender?: string
          id?: string
          last_name?: string
          nickname?: string | null
          notes?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          profile_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_ratings: {
        Row: {
          content_library_id: string
          created_at: string | null
          id: string
          profile_id: string
          rating: number
          review: string | null
          updated_at: string | null
        }
        Insert: {
          content_library_id: string
          created_at?: string | null
          id?: string
          profile_id: string
          rating: number
          review?: string | null
          updated_at?: string | null
        }
        Update: {
          content_library_id?: string
          created_at?: string | null
          id?: string
          profile_id?: string
          rating?: number
          review?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_ratings_content_library_id_fkey"
            columns: ["content_library_id"]
            isOneToOne: false
            referencedRelation: "content_library"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_content: {
        Row: {
          created_at: string
          default_goals: Json | null
          deleted_at: string | null
          description: string | null
          domain: string
          estimated_duration: number | null
          id: string
          instructions: Json | null
          is_favorite: boolean | null
          last_used_at: string | null
          materials_needed: Json | null
          profile_id: string
          tags: Json | null
          tips: Json | null
          title: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          default_goals?: Json | null
          deleted_at?: string | null
          description?: string | null
          domain: string
          estimated_duration?: number | null
          id?: string
          instructions?: Json | null
          is_favorite?: boolean | null
          last_used_at?: string | null
          materials_needed?: Json | null
          profile_id: string
          tags?: Json | null
          tips?: Json | null
          title: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          default_goals?: Json | null
          deleted_at?: string | null
          description?: string | null
          domain?: string
          estimated_duration?: number | null
          id?: string
          instructions?: Json | null
          is_favorite?: boolean | null
          last_used_at?: string | null
          materials_needed?: Json | null
          profile_id?: string
          tags?: Json | null
          tips?: Json | null
          title?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_content_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      session_summary: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          content_count: number | null
          created_at: string | null
          created_by: string | null
          creation_method: string | null
          deleted_at: string | null
          duration_minutes: number | null
          end_time: string | null
          has_evaluation: boolean | null
          has_log: boolean | null
          id: string | null
          location: string | null
          notes: string | null
          session_date: string | null
          start_time: string | null
          status: string | null
          student_dob: string | null
          student_first_name: string | null
          student_id: string | null
          student_last_name: string | null
          student_nickname: string | null
          time_slot: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      activate_parent_link: {
        Args: { p_parent_email: string; p_parent_profile_id: string }
        Returns: {
          activated_at: string | null
          can_receive_notifications: boolean | null
          can_view_reports: boolean | null
          created_at: string | null
          deleted_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_primary: boolean | null
          parent_email: string | null
          parent_id: string
          permissions: Json | null
          relationship: string
          relationship_note: string | null
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "student_parents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      bulk_create_sessions: {
        Args: {
          p_created_by?: string
          p_dates: string[]
          p_end_time: string
          p_location?: string
          p_notes?: string
          p_start_time: string
          p_student_id: string
          p_time_slot: string
        }
        Returns: string[]
      }
      calculate_time_slot: { Args: { p_start_time: string }; Returns: string }
      can_parent_view_behavior_incidents: {
        Args: { p_parent_id: string; p_student_id: string }
        Returns: boolean
      }
      get_most_used_behaviors: {
        Args: { p_limit?: number; p_profile_id: string }
        Returns: {
          behavior_code: string
          behavior_group_id: string
          icon: string
          id: string
          is_favorite: boolean
          last_used_at: string
          name_en: string
          name_vn: string
          usage_count: number
        }[]
      }
      get_parent_children: {
        Args: { p_parent_id: string }
        Returns: {
          avatar_url: string
          completed_sessions: number
          date_of_birth: string
          diagnosis: string
          first_name: string
          is_primary: boolean
          last_name: string
          relationship: string
          status: string
          student_id: string
          teacher_email: string
          teacher_name: string
          total_sessions: number
        }[]
      }
      get_session_history: {
        Args: {
          p_from_date?: string
          p_limit?: number
          p_student_id: string
          p_to_date?: string
        }
        Returns: {
          behavior_incidents_count: number
          completed_at: string
          end_time: string
          has_evaluation: boolean
          media_count: number
          overall_rating: number
          session_date: string
          session_id: string
          start_time: string
          status: string
          time_slot: string
        }[]
      }
      get_student_progress_report: {
        Args: { p_end_date: string; p_start_date: string; p_student_id: string }
        Returns: {
          avg_achievement: number
          domain: string
          domain_achievement: number
          overall_rating: number
          session_date: string
        }[]
      }
      get_user_sessions_count: {
        Args: never
        Returns: {
          cancelled: number
          completed: number
          deleted: number
          pending: number
          total: number
        }[]
      }
      increment_custom_content_usage: {
        Args: { content_id: string }
        Returns: undefined
      }
      restore_session: {
        Args: { session_id: string }
        Returns: {
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          created_by: string
          creation_method: string | null
          deleted_at: string | null
          duration_minutes: number | null
          end_time: string
          has_evaluation: boolean | null
          id: string
          location: string | null
          notes: string | null
          session_date: string
          start_time: string
          status: string | null
          student_id: string
          time_slot: string
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      search_behaviors: {
        Args: { p_language?: string; p_limit?: number; p_query: string }
        Returns: {
          behavior_code: string
          behavior_group_id: string
          icon: string
          id: string
          name_en: string
          name_vn: string
          usage_count: number
        }[]
      }
      soft_delete_session: {
        Args: { session_id: string }
        Returns: {
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          created_by: string
          creation_method: string | null
          deleted_at: string | null
          duration_minutes: number | null
          end_time: string
          has_evaluation: boolean | null
          id: string
          location: string | null
          notes: string | null
          session_date: string
          start_time: string
          status: string | null
          student_id: string
          time_slot: string
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      user_can_modify_session: {
        Args: { session_id: string }
        Returns: boolean
      }
      user_is_teacher_of_session: {
        Args: { session_id: string }
        Returns: boolean
      }
      user_owns_session: { Args: { session_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
