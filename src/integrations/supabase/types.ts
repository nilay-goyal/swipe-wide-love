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
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          education: string | null
          id: string
          interests: string[] | null
          location: string | null
          name: string | null
          occupation: string | null
          photos: string[] | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          education?: string | null
          id: string
          interests?: string[] | null
          location?: string | null
          name?: string | null
          occupation?: string | null
          photos?: string[] | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          education?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          name?: string | null
          occupation?: string | null
          photos?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      users_data: {
        Row: {
          "Backend Dev": number | null
          "Check the skills you're comfortable with:": string | null
          Cybersecurity: number | null
          "Enter name:": string
          "Enter the major you're pursuing:": string | null
          "Enter the school/university you're attending:": string | null
          "Enter your year:": string | null
          "Frontend Dev": number | null
          "Hardware / Arduino / Raspberry Pi": number | null
          "Pitching / Public Speaking": number | null
          "Project Management (Notion, Trello, etc.)": number | null
          "Provide a link to your Devpost profile:": string | null
          "Provide a link to your GitHub:": string | null
          "Provide a link to your LinkedIn profile:": string | null
          Timestamp: string | null
          "UI/UX Design (Figma, Adobe XD)": number | null
        }
        Insert: {
          "Backend Dev"?: number | null
          "Check the skills you're comfortable with:"?: string | null
          Cybersecurity?: number | null
          "Enter name:": string
          "Enter the major you're pursuing:"?: string | null
          "Enter the school/university you're attending:"?: string | null
          "Enter your year:"?: string | null
          "Frontend Dev"?: number | null
          "Hardware / Arduino / Raspberry Pi"?: number | null
          "Pitching / Public Speaking"?: number | null
          "Project Management (Notion, Trello, etc.)"?: number | null
          "Provide a link to your Devpost profile:"?: string | null
          "Provide a link to your GitHub:"?: string | null
          "Provide a link to your LinkedIn profile:"?: string | null
          Timestamp?: string | null
          "UI/UX Design (Figma, Adobe XD)"?: number | null
        }
        Update: {
          "Backend Dev"?: number | null
          "Check the skills you're comfortable with:"?: string | null
          Cybersecurity?: number | null
          "Enter name:"?: string
          "Enter the major you're pursuing:"?: string | null
          "Enter the school/university you're attending:"?: string | null
          "Enter your year:"?: string | null
          "Frontend Dev"?: number | null
          "Hardware / Arduino / Raspberry Pi"?: number | null
          "Pitching / Public Speaking"?: number | null
          "Project Management (Notion, Trello, etc.)"?: number | null
          "Provide a link to your Devpost profile:"?: string | null
          "Provide a link to your GitHub:"?: string | null
          "Provide a link to your LinkedIn profile:"?: string | null
          Timestamp?: string | null
          "UI/UX Design (Figma, Adobe XD)"?: number | null
        }
        Relationships: []
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
