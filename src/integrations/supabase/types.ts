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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_communications: {
        Row: {
          created_at: string
          from_agent: string
          id: string
          message_type: string
          payload: Json
          processed_at: string | null
          session_id: string
          status: string | null
          to_agent: string
        }
        Insert: {
          created_at?: string
          from_agent: string
          id?: string
          message_type: string
          payload: Json
          processed_at?: string | null
          session_id: string
          status?: string | null
          to_agent: string
        }
        Update: {
          created_at?: string
          from_agent?: string
          id?: string
          message_type?: string
          payload?: Json
          processed_at?: string | null
          session_id?: string
          status?: string | null
          to_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_communications_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          agent_type: string
          created_at: string
          feedback_text: string
          id: string
          improvements: string[] | null
          learning_path_recommendations: Json | null
          next_steps: string[] | null
          response_id: string
          score: number | null
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          agent_type?: string
          created_at?: string
          feedback_text: string
          id?: string
          improvements?: string[] | null
          learning_path_recommendations?: Json | null
          next_steps?: string[] | null
          response_id: string
          score?: number | null
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          agent_type?: string
          created_at?: string
          feedback_text?: string
          id?: string
          improvements?: string[] | null
          learning_path_recommendations?: Json | null
          next_steps?: string[] | null
          response_id?: string
          score?: number | null
          strengths?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "user_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          agent_type: string
          content: string
          content_type: string
          created_at: string
          difficulty_level: number | null
          estimated_read_time: number | null
          id: string
          metadata: Json | null
          session_id: string
          title: string
          user_id: string
        }
        Insert: {
          agent_type?: string
          content: string
          content_type: string
          created_at?: string
          difficulty_level?: number | null
          estimated_read_time?: number | null
          id?: string
          metadata?: Json | null
          session_id: string
          title: string
          user_id: string
        }
        Update: {
          agent_type?: string
          content?: string
          content_type?: string
          created_at?: string
          difficulty_level?: number | null
          estimated_read_time?: number | null
          id?: string
          metadata?: Json | null
          session_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          objectives: string[] | null
          progress: number | null
          started_at: string | null
          status: string | null
          subject_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          objectives?: string[] | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          subject_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          objectives?: string[] | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          subject_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          learning_preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          learning_preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          learning_preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          agent_type: string
          correct_answer: string | null
          created_at: string
          difficulty_level: number | null
          explanation: string | null
          id: string
          metadata: Json | null
          options: Json | null
          points: number | null
          question_text: string
          question_type: string
          session_id: string
          user_id: string
        }
        Insert: {
          agent_type?: string
          correct_answer?: string | null
          created_at?: string
          difficulty_level?: number | null
          explanation?: string | null
          id?: string
          metadata?: Json | null
          options?: Json | null
          points?: number | null
          question_text: string
          question_type: string
          session_id: string
          user_id: string
        }
        Update: {
          agent_type?: string
          correct_answer?: string | null
          created_at?: string
          difficulty_level?: number | null
          explanation?: string | null
          id?: string
          metadata?: Json | null
          options?: Json | null
          points?: number | null
          question_text?: string
          question_type?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty_level: number | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_responses: {
        Row: {
          answer: string
          id: string
          is_correct: boolean | null
          question_id: string
          session_id: string
          submitted_at: string
          time_spent: number | null
          user_id: string
        }
        Insert: {
          answer: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          session_id: string
          submitted_at?: string
          time_spent?: number | null
          user_id: string
        }
        Update: {
          answer?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          session_id?: string
          submitted_at?: string
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
