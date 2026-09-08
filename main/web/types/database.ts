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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      collectors: {
        Row: {
          collector_type: Database["public"]["Enums"]["collector_type"]
          created_at: string
          display_name: string | null
          id: string
          onboarded_via: Database["public"]["Enums"]["source_channel"]
          preferred_language: string
          primary_ward_id: string | null
          updated_at: string
        }
        Insert: {
          collector_type?: Database["public"]["Enums"]["collector_type"]
          created_at?: string
          display_name?: string | null
          id: string
          onboarded_via?: Database["public"]["Enums"]["source_channel"]
          preferred_language?: string
          primary_ward_id?: string | null
          updated_at?: string
        }
        Update: {
          collector_type?: Database["public"]["Enums"]["collector_type"]
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded_via?: Database["public"]["Enums"]["source_channel"]
          preferred_language?: string
          primary_ward_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collectors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collectors_primary_ward_id_fkey"
            columns: ["primary_ward_id"]
            isOneToOne: false
            referencedRelation: "delhi_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_pickup_requests: {
        Row: {
          approx_weight_kg: number | null
          assigned_collector_id: string | null
          created_at: string
          customer_phone: string
          id: string
          is_bulk: boolean
          linked_lot_id: string | null
          material_description: string
          parent_code: string | null
          photo_url: string | null
          pickup_address: string
          pickup_location: unknown
          preferred_date: string
          preferred_time_window: string | null
          status: Database["public"]["Enums"]["pickup_request_status"]
          sub_code: string | null
          updated_at: string
          ward_id: string | null
        }
        Insert: {
          approx_weight_kg?: number | null
          assigned_collector_id?: string | null
          created_at?: string
          customer_phone: string
          id?: string
          is_bulk?: boolean
          linked_lot_id?: string | null
          material_description: string
          parent_code?: string | null
          photo_url?: string | null
          pickup_address: string
          pickup_location?: unknown
          preferred_date?: string
          preferred_time_window?: string | null
          status?: Database["public"]["Enums"]["pickup_request_status"]
          sub_code?: string | null
          updated_at?: string
          ward_id?: string | null
        }
        Update: {
          approx_weight_kg?: number | null
          assigned_collector_id?: string | null
          created_at?: string
          customer_phone?: string
          id?: string
          is_bulk?: boolean
          linked_lot_id?: string | null
          material_description?: string
          parent_code?: string | null
          photo_url?: string | null
          pickup_address?: string
          pickup_location?: unknown
          preferred_date?: string
          preferred_time_window?: string | null
          status?: Database["public"]["Enums"]["pickup_request_status"]
          sub_code?: string | null
          updated_at?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_pickup_requests_assigned_collector_id_fkey"
            columns: ["assigned_collector_id"]
            isOneToOne: false
            referencedRelation: "collector_earnings_summary"
            referencedColumns: ["collector_id"]
          },
          {
            foreignKeyName: "customer_pickup_requests_assigned_collector_id_fkey"
            columns: ["assigned_collector_id"]
            isOneToOne: false
            referencedRelation: "collectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_pickup_requests_linked_lot_id_fkey"
            columns: ["linked_lot_id"]
            isOneToOne: false
            referencedRelation: "ai_training_export"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "customer_pickup_requests_linked_lot_id_fkey"
            columns: ["linked_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_pickup_requests_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "delhi_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      delhi_wards: {
        Row: {
          created_at: string
          geometry: unknown
          id: string
          ward_name: string
          zone_name: string | null
        }
        Insert: {
          created_at?: string
          geometry: unknown
          id?: string
          ward_name: string
          zone_name?: string | null
        }
        Update: {
          created_at?: string
          geometry?: unknown
          id?: string
          ward_name?: string
          zone_name?: string | null
        }
        Relationships: []
      }
      handover_records: {
        Row: {
          confirmation_method: string
          created_at: string
          gps_point: unknown
          handover_timestamp: string
          id: string
          lot_id: string
          recycler_confirmed_by: string | null
          status: string
          transaction_id: string
          unique_reference_code: string
          weight_at_handover: number
        }
        Insert: {
          confirmation_method?: string
          created_at?: string
          gps_point?: unknown
          handover_timestamp?: string
          id?: string
          lot_id: string
          recycler_confirmed_by?: string | null
          status?: string
          transaction_id: string
          unique_reference_code: string
          weight_at_handover: number
        }
        Update: {
          confirmation_method?: string
          created_at?: string
          gps_point?: unknown
          handover_timestamp?: string
          id?: string
          lot_id?: string
          recycler_confirmed_by?: string | null
          status?: string
          transaction_id?: string
          unique_reference_code?: string
          weight_at_handover?: number
        }
        Relationships: [
          {
            foreignKeyName: "handover_records_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "ai_training_export"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "handover_records_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handover_records_recycler_confirmed_by_fkey"
            columns: ["recycler_confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handover_records_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_images: {
        Row: {
          id: string
          is_primary: boolean
          lot_id: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          is_primary?: boolean
          lot_id: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          is_primary?: boolean
          lot_id?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lot_images_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "ai_training_export"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "lot_images_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_matches: {
        Row: {
          created_at: string
          id: string
          lot_id: string
          offered_at: string
          rank: number
          recycler_id: string
          score: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          lot_id: string
          offered_at?: string
          rank?: number
          recycler_id: string
          score: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          lot_id?: string
          offered_at?: string
          rank?: number
          recycler_id?: string
          score?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lot_matches_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "ai_training_export"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "lot_matches_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_matches_recycler_id_fkey"
            columns: ["recycler_id"]
            isOneToOne: false
            referencedRelation: "recyclers"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          ai_confidence: number | null
          ai_raw_response: Json | null
          ai_suggested_rate_per_kg: number | null
          client_created_at: string
          collector_id: string
          condition: Database["public"]["Enums"]["lot_condition"]
          created_at: string
          estimated_value: number | null
          final_price: number | null
          hazard_flags: string[] | null
          id: string
          location: unknown
          parent_code: string
          primary_image_path: string | null
          quoted_price: number | null
          source_channel: Database["public"]["Enums"]["source_channel"]
          status: Database["public"]["Enums"]["lot_status"]
          sub_code: string
          synced_at: string | null
          updated_at: string
          ward_id: string | null
          weight_kg: number
        }
        Insert: {
          ai_confidence?: number | null
          ai_raw_response?: Json | null
          ai_suggested_rate_per_kg?: number | null
          client_created_at?: string
          collector_id: string
          condition?: Database["public"]["Enums"]["lot_condition"]
          created_at?: string
          estimated_value?: number | null
          final_price?: number | null
          hazard_flags?: string[] | null
          id?: string
          location?: unknown
          parent_code: string
          primary_image_path?: string | null
          quoted_price?: number | null
          source_channel?: Database["public"]["Enums"]["source_channel"]
          status?: Database["public"]["Enums"]["lot_status"]
          sub_code: string
          synced_at?: string | null
          updated_at?: string
          ward_id?: string | null
          weight_kg: number
        }
        Update: {
          ai_confidence?: number | null
          ai_raw_response?: Json | null
          ai_suggested_rate_per_kg?: number | null
          client_created_at?: string
          collector_id?: string
          condition?: Database["public"]["Enums"]["lot_condition"]
          created_at?: string
          estimated_value?: number | null
          final_price?: number | null
          hazard_flags?: string[] | null
          id?: string
          location?: unknown
          parent_code?: string
          primary_image_path?: string | null
          quoted_price?: number | null
          source_channel?: Database["public"]["Enums"]["source_channel"]
          status?: Database["public"]["Enums"]["lot_status"]
          sub_code?: string
          synced_at?: string | null
          updated_at?: string
          ward_id?: string | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "lots_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "collector_earnings_summary"
            referencedColumns: ["collector_id"]
          },
          {
            foreignKeyName: "lots_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "collectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_e_waste"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_glass"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_ferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_nonferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_paper"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_plastic"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_rubber_other"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_textile"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "price_board"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "delhi_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      material_aliases: {
        Row: {
          alias: string
          id: string
          language: string
          parent_code: string
          sub_code: string
        }
        Insert: {
          alias: string
          id?: string
          language: string
          parent_code: string
          sub_code: string
        }
        Update: {
          alias?: string
          id?: string
          language?: string
          parent_code?: string
          sub_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_e_waste"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_glass"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_ferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_nonferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_paper"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_plastic"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_rubber_other"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_textile"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "material_aliases_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "price_board"
            referencedColumns: ["parent_code", "sub_code"]
          },
        ]
      }
      material_categories: {
        Row: {
          active: boolean
          created_at: string
          epr_schedule1_hint: string | null
          group_code: string
          is_hazardous: boolean
          parent_code: string
          parent_name: string
          sub_code: string
          sub_name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          epr_schedule1_hint?: string | null
          group_code: string
          is_hazardous?: boolean
          parent_code: string
          parent_name: string
          sub_code: string
          sub_name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          epr_schedule1_hint?: string | null
          group_code?: string
          is_hazardous?: boolean
          parent_code?: string
          parent_name?: string
          sub_code?: string
          sub_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_family_fk"
            columns: ["parent_code", "group_code"]
            isOneToOne: false
            referencedRelation: "material_families"
            referencedColumns: ["parent_code", "group_code"]
          },
          {
            foreignKeyName: "material_group_fk"
            columns: ["group_code"]
            isOneToOne: false
            referencedRelation: "material_groups"
            referencedColumns: ["code"]
          },
        ]
      }
      material_classification_review: {
        Row: {
          created_at: string
          reason: string
          source_parent_code: string
          source_record: Json
          source_sub_code: string
        }
        Insert: {
          created_at?: string
          reason: string
          source_parent_code: string
          source_record: Json
          source_sub_code: string
        }
        Update: {
          created_at?: string
          reason?: string
          source_parent_code?: string
          source_record?: Json
          source_sub_code?: string
        }
        Relationships: []
      }
      material_families: {
        Row: {
          group_code: string
          name: string
          parent_code: string
        }
        Insert: {
          group_code: string
          name: string
          parent_code: string
        }
        Update: {
          group_code?: string
          name?: string
          parent_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_families_group_code_fkey"
            columns: ["group_code"]
            isOneToOne: false
            referencedRelation: "material_groups"
            referencedColumns: ["code"]
          },
        ]
      }
      material_groups: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          created_at: string
          id: string
          parent_code: string
          price_date: string
          price_per_kg: number
          source_id: string | null
          source_type: string
          sub_code: string
          ward_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          parent_code: string
          price_date?: string
          price_per_kg: number
          source_id?: string | null
          source_type?: string
          sub_code: string
          ward_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          parent_code?: string
          price_date?: string
          price_per_kg?: number
          source_id?: string | null
          source_type?: string
          sub_code?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_e_waste"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_glass"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_ferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_nonferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_paper"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_plastic"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_rubber_other"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_textile"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "price_board"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "price_history_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "delhi_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      recycler_material_acceptance: {
        Row: {
          is_active: boolean
          max_lot_kg: number | null
          min_lot_kg: number | null
          parent_code: string
          recycler_id: string
          sub_code: string
        }
        Insert: {
          is_active?: boolean
          max_lot_kg?: number | null
          min_lot_kg?: number | null
          parent_code: string
          recycler_id: string
          sub_code: string
        }
        Update: {
          is_active?: boolean
          max_lot_kg?: number | null
          min_lot_kg?: number | null
          parent_code?: string
          recycler_id?: string
          sub_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_e_waste"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_glass"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_ferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_nonferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_paper"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_plastic"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_rubber_other"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_textile"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "price_board"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_material_acceptance_recycler_id_fkey"
            columns: ["recycler_id"]
            isOneToOne: false
            referencedRelation: "recyclers"
            referencedColumns: ["id"]
          },
        ]
      }
      recycler_rate_cards: {
        Row: {
          created_at: string
          effective_date: string
          id: string
          parent_code: string
          rate_per_kg: number
          recycler_id: string
          sub_code: string
        }
        Insert: {
          created_at?: string
          effective_date?: string
          id?: string
          parent_code: string
          rate_per_kg: number
          recycler_id: string
          sub_code: string
        }
        Update: {
          created_at?: string
          effective_date?: string
          id?: string
          parent_code?: string
          rate_per_kg?: number
          recycler_id?: string
          sub_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_e_waste"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_glass"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_ferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_nonferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_paper"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_plastic"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_rubber_other"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_textile"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "price_board"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "recycler_rate_cards_recycler_id_fkey"
            columns: ["recycler_id"]
            isOneToOne: false
            referencedRelation: "recyclers"
            referencedColumns: ["id"]
          },
        ]
      }
      recyclers: {
        Row: {
          authorization_expiry: string | null
          authorization_status: Database["public"]["Enums"]["authorization_status"]
          avg_rating: number | null
          business_name: string
          created_at: string
          facility_location: unknown
          id: string
          pickup_available: boolean
          registration_authority: string
          registration_number: string
          service_area: unknown
          updated_at: string
          verified_by_admin_id: string | null
        }
        Insert: {
          authorization_expiry?: string | null
          authorization_status?: Database["public"]["Enums"]["authorization_status"]
          avg_rating?: number | null
          business_name: string
          created_at?: string
          facility_location: unknown
          id: string
          pickup_available?: boolean
          registration_authority?: string
          registration_number: string
          service_area?: unknown
          updated_at?: string
          verified_by_admin_id?: string | null
        }
        Update: {
          authorization_expiry?: string | null
          authorization_status?: Database["public"]["Enums"]["authorization_status"]
          avg_rating?: number | null
          business_name?: string
          created_at?: string
          facility_location?: unknown
          id?: string
          pickup_available?: boolean
          registration_authority?: string
          registration_number?: string
          service_area?: unknown
          updated_at?: string
          verified_by_admin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recyclers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recyclers_verified_by_admin_id_fkey"
            columns: ["verified_by_admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          collector_id: string
          comment_text: string | null
          created_at: string
          id: string
          rating: number
          request_id: string | null
          transaction_id: string | null
          voice_review_url: string | null
        }
        Insert: {
          collector_id: string
          comment_text?: string | null
          created_at?: string
          id?: string
          rating: number
          request_id?: string | null
          transaction_id?: string | null
          voice_review_url?: string | null
        }
        Update: {
          collector_id?: string
          comment_text?: string | null
          created_at?: string
          id?: string
          rating?: number
          request_id?: string | null
          transaction_id?: string | null
          voice_review_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "collector_earnings_summary"
            referencedColumns: ["collector_id"]
          },
          {
            foreignKeyName: "reviews_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "collectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "customer_pickup_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_content: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language: string
          media_type: string
          parent_code: string | null
          storage_path: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          media_type: string
          parent_code?: string | null
          storage_path: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          media_type?: string
          parent_code?: string | null
          storage_path?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_family_fk"
            columns: ["parent_code"]
            isOneToOne: false
            referencedRelation: "material_families"
            referencedColumns: ["parent_code"]
          },
        ]
      }
      transactions: {
        Row: {
          completed_at: string | null
          created_at: string
          final_price: number | null
          id: string
          lot_id: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          quoted_price: number
          recycler_id: string
          transaction_status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          final_price?: number | null
          id?: string
          lot_id: string
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quoted_price: number
          recycler_id: string
          transaction_status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          final_price?: number | null
          id?: string
          lot_id?: string
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quoted_price?: number
          recycler_id?: string
          transaction_status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: true
            referencedRelation: "ai_training_export"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "transactions_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: true
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recycler_id_fkey"
            columns: ["recycler_id"]
            isOneToOne: false
            referencedRelation: "recyclers"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      voice_calls: {
        Row: {
          call_status: string
          caller_phone: string
          collector_id: string | null
          created_at: string
          created_lot_id: string | null
          detected_language: string | null
          exotel_call_sid: string | null
          gemini_intent_json: Json | null
          id: string
          transcript_text: string | null
        }
        Insert: {
          call_status?: string
          caller_phone: string
          collector_id?: string | null
          created_at?: string
          created_lot_id?: string | null
          detected_language?: string | null
          exotel_call_sid?: string | null
          gemini_intent_json?: Json | null
          id?: string
          transcript_text?: string | null
        }
        Update: {
          call_status?: string
          caller_phone?: string
          collector_id?: string | null
          created_at?: string
          created_lot_id?: string | null
          detected_language?: string | null
          exotel_call_sid?: string | null
          gemini_intent_json?: Json | null
          id?: string
          transcript_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_calls_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "collector_earnings_summary"
            referencedColumns: ["collector_id"]
          },
          {
            foreignKeyName: "voice_calls_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "collectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_created_lot_id_fkey"
            columns: ["created_lot_id"]
            isOneToOne: false
            referencedRelation: "ai_training_export"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "voice_calls_created_lot_id_fkey"
            columns: ["created_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          created_at: string
          id: string
          message_type: string
          parent_code: string | null
          provider_message_id: string
          raw_payload: Json | null
          sender_hash: string
          sub_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_type: string
          parent_code?: string | null
          provider_message_id: string
          raw_payload?: Json | null
          sender_hash: string
          sub_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message_type?: string
          parent_code?: string | null
          provider_message_id?: string
          raw_payload?: Json | null
          sender_hash?: string
          sub_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_e_waste"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_glass"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_ferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_nonferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_paper"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_plastic"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_rubber_other"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_textile"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "whatsapp_messages_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "price_board"
            referencedColumns: ["parent_code", "sub_code"]
          },
        ]
      }
    }
    Views: {
      ai_training_export: {
        Row: {
          ai_confidence: number | null
          ai_suggested_rate_per_kg: number | null
          condition: Database["public"]["Enums"]["lot_condition"] | null
          lot_id: string | null
          parent_code: string | null
          storage_path: string | null
          sub_code: string | null
          weight_kg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_e_waste"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_glass"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_ferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_metal_nonferrous"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_paper"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_plastic"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_rubber_other"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "catalog_textile"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["parent_code", "sub_code"]
          },
          {
            foreignKeyName: "lots_parent_code_sub_code_fkey"
            columns: ["parent_code", "sub_code"]
            isOneToOne: false
            referencedRelation: "price_board"
            referencedColumns: ["parent_code", "sub_code"]
          },
        ]
      }
      catalog_e_waste: {
        Row: {
          epr_schedule1_hint: string | null
          is_hazardous: boolean | null
          parent_code: string | null
          parent_name: string | null
          sub_code: string | null
          sub_name: string | null
        }
        Insert: {
          epr_schedule1_hint?: string | null
          is_hazardous?: boolean | null
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Update: {
          epr_schedule1_hint?: string | null
          is_hazardous?: boolean | null
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Relationships: []
      }
      catalog_glass: {
        Row: {
          parent_code: string | null
          parent_name: string | null
          sub_code: string | null
          sub_name: string | null
        }
        Insert: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Update: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Relationships: []
      }
      catalog_metal_ferrous: {
        Row: {
          parent_code: string | null
          parent_name: string | null
          sub_code: string | null
          sub_name: string | null
        }
        Insert: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Update: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Relationships: []
      }
      catalog_metal_nonferrous: {
        Row: {
          parent_code: string | null
          parent_name: string | null
          sub_code: string | null
          sub_name: string | null
        }
        Insert: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Update: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Relationships: []
      }
      catalog_paper: {
        Row: {
          parent_code: string | null
          parent_name: string | null
          sub_code: string | null
          sub_name: string | null
        }
        Insert: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Update: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Relationships: []
      }
      catalog_plastic: {
        Row: {
          parent_code: string | null
          parent_name: string | null
          sub_code: string | null
          sub_name: string | null
        }
        Insert: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Update: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Relationships: []
      }
      catalog_rubber_other: {
        Row: {
          parent_code: string | null
          parent_name: string | null
          sub_code: string | null
          sub_name: string | null
        }
        Insert: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Update: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Relationships: []
      }
      catalog_textile: {
        Row: {
          parent_code: string | null
          parent_name: string | null
          sub_code: string | null
          sub_name: string | null
        }
        Insert: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Update: {
          parent_code?: string | null
          parent_name?: string | null
          sub_code?: string | null
          sub_name?: string | null
        }
        Relationships: []
      }
      collector_earnings_summary: {
        Row: {
          collector_id: string | null
          completed_transactions: number | null
          display_name: string | null
          total_earnings: number | null
          total_weight_kg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collectors_id_fkey"
            columns: ["collector_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      price_board: {
        Row: {
          group_code: string | null
          parent_code: string | null
          parent_name: string | null
          price_date: string | null
          price_per_kg: number | null
          source_type: string | null
          sub_code: string | null
          sub_name: string | null
          ward_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_family_fk"
            columns: ["parent_code", "group_code"]
            isOneToOne: false
            referencedRelation: "material_families"
            referencedColumns: ["parent_code", "group_code"]
          },
          {
            foreignKeyName: "material_group_fk"
            columns: ["group_code"]
            isOneToOne: false
            referencedRelation: "material_groups"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Functions: {
      fn_generate_handover_ref_code: { Args: never; Returns: string }
      fn_match_recyclers_for_lot: {
        Args: { p_limit?: number; p_lot_id: string }
        Returns: {
          business_name: string
          distance_km: number
          match_rank: number
          match_score: number
          offered_rate_per_kg: number
          recycler_id: string
        }[]
      }
    }
    Enums: {
      authorization_status:
        | "verified"
        | "pending_verification"
        | "expired"
        | "suspended"
      collector_type: "individual" | "collection_point"
      lot_condition: "working" | "damaged" | "scrap" | "burnt_unsafe"
      lot_status:
        | "draft"
        | "submitted"
        | "matched"
        | "quoted"
        | "accepted"
        | "handed_over"
        | "confirmed"
        | "paid"
        | "disputed"
        | "cancelled"
      payment_mode: "cash" | "upi"
      payment_status: "pending" | "partial" | "paid"
      pickup_request_status:
        | "pending"
        | "assigned"
        | "scheduled"
        | "collected"
        | "cancelled"
      source_channel: "app" | "voice" | "admin"
      transaction_status:
        | "pending"
        | "quoted"
        | "accepted"
        | "handed_over"
        | "confirmed"
        | "paid"
        | "disputed"
        | "cancelled"
      user_role: "collector" | "recycler" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      authorization_status: [
        "verified",
        "pending_verification",
        "expired",
        "suspended",
      ],
      collector_type: ["individual", "collection_point"],
      lot_condition: ["working", "damaged", "scrap", "burnt_unsafe"],
      lot_status: [
        "draft",
        "submitted",
        "matched",
        "quoted",
        "accepted",
        "handed_over",
        "confirmed",
        "paid",
        "disputed",
        "cancelled",
      ],
      payment_mode: ["cash", "upi"],
      payment_status: ["pending", "partial", "paid"],
      pickup_request_status: [
        "pending",
        "assigned",
        "scheduled",
        "collected",
        "cancelled",
      ],
      source_channel: ["app", "voice", "admin"],
      transaction_status: [
        "pending",
        "quoted",
        "accepted",
        "handed_over",
        "confirmed",
        "paid",
        "disputed",
        "cancelled",
      ],
      user_role: ["collector", "recycler", "admin"],
    },
  },
} as const
