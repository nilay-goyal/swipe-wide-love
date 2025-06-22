export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      hackathon_events: {
        Row: {
          application_deadline: string | null
          created_at: string
          date_end: string | null
          date_start: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          image_url: string | null
          location: string | null
          mlh_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          created_at?: string
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          mlh_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          created_at?: string
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          mlh_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hackathon_participants: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_verified: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_verified?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_verified?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "hackathon_events"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_teams: {
        Row: {
          created_at: string
          event_id: string
          id: string
          member1_id: string
          member2_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          member1_id: string
          member2_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          member1_id?: string
          member2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "hackathon_events"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          backend: number | null
          bio: string | null
          created_at: string
          cyber: number | null
          devpost: string | null
          devpost_url: string | null
          education: string | null
          education_details: Json | null
          frontend: number | null
          github: string | null
          github_projects: Json | null
          github_url: string | null
          hardware: number | null
          id: string
          interests: string[] | null
          joined_events: string[] | null
          linkedin: string | null
          linkedin_url: string | null
          location: string | null
          major: string | null
          management: number | null
          name: string | null
          occupation: string | null
          photos: string[] | null
          pitching: number | null
          school: string | null
          skills: string[] | null
          uiux: number | null
          updated_at: string
          work_experience: Json | null
          year: string | null
        }
        Insert: {
          age?: number | null
          backend?: number | null
          bio?: string | null
          created_at?: string
          cyber?: number | null
          devpost?: string | null
          devpost_url?: string | null
          education?: string | null
          education_details?: Json | null
          frontend?: number | null
          github?: string | null
          github_projects?: Json | null
          github_url?: string | null
          hardware?: number | null
          id: string
          interests?: string[] | null
          joined_events?: string[] | null
          linkedin?: string | null
          linkedin_url?: string | null
          location?: string | null
          major?: string | null
          management?: number | null
          name?: string | null
          occupation?: string | null
          photos?: string[] | null
          pitching?: number | null
          school?: string | null
          skills?: string[] | null
          uiux?: number | null
          updated_at?: string
          work_experience?: Json | null
          year?: string | null
        }
        Update: {
          age?: number | null
          backend?: number | null
          bio?: string | null
          created_at?: string
          cyber?: number | null
          devpost?: string | null
          devpost_url?: string | null
          education?: string | null
          education_details?: Json | null
          frontend?: number | null
          github?: string | null
          github_projects?: Json | null
          github_url?: string | null
          hardware?: number | null
          id?: string
          interests?: string[] | null
          joined_events?: string[] | null
          linkedin?: string | null
          linkedin_url?: string | null
          location?: string | null
          major?: string | null
          management?: number | null
          name?: string | null
          occupation?: string | null
          photos?: string[] | null
          pitching?: number | null
          school?: string | null
          skills?: string[] | null
          uiux?: number | null
          updated_at?: string
          work_experience?: Json | null
          year?: string | null
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          id: string
          is_like: boolean
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_like?: boolean
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_like?: boolean
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: []
      }
      test_data: {
        Row: {
          backend: number | null
          cyber: number | null
          devpost: string | null
          frontend: number | null
          github: string | null
          hardware: number | null
          id: string
          linkedin: string | null
          major: string | null
          management: number | null
          name: string | null
          pitching: number | null
          school: string | null
          skills: string | null
          timestamp: string | null
          uiux: number | null
          year: string | null
        }
        Insert: {
          backend?: number | null
          cyber?: number | null
          devpost?: string | null
          frontend?: number | null
          github?: string | null
          hardware?: number | null
          id: string
          linkedin?: string | null
          major?: string | null
          management?: number | null
          name?: string | null
          pitching?: number | null
          school?: string | null
          skills?: string | null
          timestamp?: string | null
          uiux?: number | null
          year?: string | null
        }
        Update: {
          backend?: number | null
          cyber?: number | null
          devpost?: string | null
          frontend?: number | null
          github?: string | null
          hardware?: number | null
          id?: string
          linkedin?: string | null
          major?: string | null
          management?: number | null
          name?: string | null
          pitching?: number | null
          school?: string | null
          skills?: string | null
          timestamp?: string | null
          uiux?: number | null
          year?: string | null
        }
        Relationships: []
      }
      test_data_duplicate: {
        Row: {
          backend: number | null
          cyber: number | null
          devpost: string | null
          frontend: number | null
          github: string | null
          hardware: number | null
          id: string
          linkedin: string | null
          major: string | null
          management: number | null
          name: string | null
          pitching: number | null
          school: string | null
          skills: string | null
          timestamp: string | null
          uiux: number | null
          year: string | null
        }
        Insert: {
          backend?: number | null
          cyber?: number | null
          devpost?: string | null
          frontend?: number | null
          github?: string | null
          hardware?: number | null
          id: string
          linkedin?: string | null
          major?: string | null
          management?: number | null
          name?: string | null
          pitching?: number | null
          school?: string | null
          skills?: string | null
          timestamp?: string | null
          uiux?: number | null
          year?: string | null
        }
        Update: {
          backend?: number | null
          cyber?: number | null
          devpost?: string | null
          frontend?: number | null
          github?: string | null
          hardware?: number | null
          id?: string
          linkedin?: string | null
          major?: string | null
          management?: number | null
          name?: string | null
          pitching?: number | null
          school?: string | null
          skills?: string | null
          timestamp?: string | null
          uiux?: number | null
          year?: string | null
        }
        Relationships: []
      }
      user_gemini_prompts: {
        Row: {
          created_at: string
          hackathon_id: string
          id: string
          prompt: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hackathon_id: string
          id?: string
          prompt: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hackathon_id?: string
          id?: string
          prompt?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_gemini_prompts_hackathon"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathon_events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_hackathon_participants: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
