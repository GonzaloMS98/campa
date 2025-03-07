export interface Team {
  id: number;
  name: string;
}

export interface Match {
  id: string;
  baseId: number;
  team1Id: number;
  team2Id: number;
  winnerId: number | null; // null means it's a tie
  completed: boolean;
  timestamp: string;
}

export interface Base {
  id: number;
  name: string;
  password: string;
}

export interface User {
  type: 'admin' | 'base';
  id: number;
  password: string;
}

export interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Supabase types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      bases: {
        Row: {
          id: number
          name: string
          password: string
          created_at: string
        }
        Insert: {
          id: number
          name: string
          password: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          password?: string
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          base_id: number
          team1_id: number
          team2_id: number
          winner_id: number | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          base_id: number
          team1_id: number
          team2_id: number
          winner_id?: number | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          base_id?: number
          team1_id?: number
          team2_id?: number
          winner_id?: number | null
          completed?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_base_id_fkey"
            columns: ["base_id"]
            referencedRelation: "bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team1_id_fkey"
            columns: ["team1_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_id_fkey"
            columns: ["team2_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
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