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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          affiliate_link_id: string | null
          amount: number
          created_at: string | null
          id: string
          order_id: string | null
          paid_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          affiliate_id: string
          affiliate_link_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          affiliate_id?: string
          affiliate_link_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          affiliate_id: string
          bot_id: string | null
          clicks: number | null
          code: string
          conversions: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          affiliate_id: string
          bot_id?: string | null
          clicks?: number | null
          code: string
          conversions?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliate_id?: string
          bot_id?: string | null
          clicks?: number | null
          code?: string
          conversions?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          approved_at: string | null
          client_id: string | null
          commission_rate: number
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          pix_key: string | null
          pix_key_type: string | null
          status: Database["public"]["Enums"]["affiliate_status"]
          total_earnings: number | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          client_id?: string | null
          commission_rate?: number
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          client_id?: string | null
          commission_rate?: number
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      balance_transactions: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string | null
          id: string
          payment_method: string | null
          reference_id: string | null
          type: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reference_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reference_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_messages: {
        Row: {
          bot_id: string | null
          buttons: Json | null
          client_id: string
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          media_type: string | null
          media_url: string | null
          message_content: string
          message_type: string
          updated_at: string | null
        }
        Insert: {
          bot_id?: string | null
          buttons?: Json | null
          client_id: string
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_content: string
          message_type: string
          updated_at?: string | null
        }
        Update: {
          bot_id?: string | null
          buttons?: Json | null
          client_id?: string
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_content?: string
          message_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_recovery_messages: {
        Row: {
          bot_id: string | null
          client_id: string
          created_at: string | null
          delay_minutes: number
          display_order: number
          id: string
          is_active: boolean | null
          media_type: string | null
          media_url: string | null
          message_content: string
          offer_message: string | null
          offer_product_id: string | null
          time_unit: string | null
          updated_at: string | null
        }
        Insert: {
          bot_id?: string | null
          client_id: string
          created_at?: string | null
          delay_minutes?: number
          display_order?: number
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_content: string
          offer_message?: string | null
          offer_product_id?: string | null
          time_unit?: string | null
          updated_at?: string | null
        }
        Update: {
          bot_id?: string | null
          client_id?: string
          created_at?: string | null
          delay_minutes?: number
          display_order?: number
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_content?: string
          offer_message?: string | null
          offer_product_id?: string | null
          time_unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_recovery_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_recovery_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_recovery_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_recovery_messages_offer_product_id_fkey"
            columns: ["offer_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      client_balances: {
        Row: {
          balance: number
          blocked_at: string | null
          client_id: string
          created_at: string
          debt_amount: number
          debt_started_at: string | null
          id: string
          is_blocked: boolean
          last_fee_date: string | null
          updated_at: string
        }
        Insert: {
          balance?: number
          blocked_at?: string | null
          client_id: string
          created_at?: string
          debt_amount?: number
          debt_started_at?: string | null
          id?: string
          is_blocked?: boolean
          last_fee_date?: string | null
          updated_at?: string
        }
        Update: {
          balance?: number
          blocked_at?: string | null
          client_id?: string
          created_at?: string
          debt_amount?: number
          debt_started_at?: string | null
          id?: string
          is_blocked?: boolean
          last_fee_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_bots: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          name: string
          telegram_bot_token: string | null
          telegram_bot_username: string | null
          updated_at: string | null
          webhook_configured: boolean | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string
          telegram_bot_token?: string | null
          telegram_bot_username?: string | null
          updated_at?: string | null
          webhook_configured?: boolean | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string
          telegram_bot_token?: string | null
          telegram_bot_username?: string | null
          updated_at?: string | null
          webhook_configured?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_bots_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_settings: {
        Row: {
          active_payment_gateway: string | null
          auto_delivery: boolean | null
          cart_reminder_enabled: boolean | null
          cart_reminder_hours: number | null
          client_id: string
          closing_time: string | null
          created_at: string | null
          duttyfy_api_key: string | null
          duttyfy_enabled: boolean | null
          facebook_access_token: string | null
          facebook_pixel_id: string | null
          facebook_test_event_code: string | null
          facebook_tracking_enabled: boolean | null
          fastsoft_api_key: string | null
          fastsoft_enabled: boolean | null
          fastsoft_public_key: string | null
          fastsoft_webhook_secret: string | null
          id: string
          opening_time: string | null
          pix_key: string | null
          pix_key_type: string | null
          pix_receiver_name: string | null
          push_notifications_enabled: boolean | null
          support_enabled: boolean | null
          tiktok_access_token: string | null
          tiktok_pixel_code: string | null
          tiktok_test_event_code: string | null
          tiktok_tracking_enabled: boolean | null
          updated_at: string | null
          upsell_enabled: boolean | null
          working_days: string[] | null
        }
        Insert: {
          active_payment_gateway?: string | null
          auto_delivery?: boolean | null
          cart_reminder_enabled?: boolean | null
          cart_reminder_hours?: number | null
          client_id: string
          closing_time?: string | null
          created_at?: string | null
          duttyfy_api_key?: string | null
          duttyfy_enabled?: boolean | null
          facebook_access_token?: string | null
          facebook_pixel_id?: string | null
          facebook_test_event_code?: string | null
          facebook_tracking_enabled?: boolean | null
          fastsoft_api_key?: string | null
          fastsoft_enabled?: boolean | null
          fastsoft_public_key?: string | null
          fastsoft_webhook_secret?: string | null
          id?: string
          opening_time?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          pix_receiver_name?: string | null
          push_notifications_enabled?: boolean | null
          support_enabled?: boolean | null
          tiktok_access_token?: string | null
          tiktok_pixel_code?: string | null
          tiktok_test_event_code?: string | null
          tiktok_tracking_enabled?: boolean | null
          updated_at?: string | null
          upsell_enabled?: boolean | null
          working_days?: string[] | null
        }
        Update: {
          active_payment_gateway?: string | null
          auto_delivery?: boolean | null
          cart_reminder_enabled?: boolean | null
          cart_reminder_hours?: number | null
          client_id?: string
          closing_time?: string | null
          created_at?: string | null
          duttyfy_api_key?: string | null
          duttyfy_enabled?: boolean | null
          facebook_access_token?: string | null
          facebook_pixel_id?: string | null
          facebook_test_event_code?: string | null
          facebook_tracking_enabled?: boolean | null
          fastsoft_api_key?: string | null
          fastsoft_enabled?: boolean | null
          fastsoft_public_key?: string | null
          fastsoft_webhook_secret?: string | null
          id?: string
          opening_time?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          pix_receiver_name?: string | null
          push_notifications_enabled?: boolean | null
          support_enabled?: boolean | null
          tiktok_access_token?: string | null
          tiktok_pixel_code?: string | null
          tiktok_test_event_code?: string | null
          tiktok_tracking_enabled?: boolean | null
          updated_at?: string | null
          upsell_enabled?: boolean | null
          working_days?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "client_settings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          business_description: string | null
          business_email: string | null
          business_name: string
          business_phone: string | null
          created_at: string | null
          default_payment_method: string | null
          fee_rate: number | null
          id: string
          is_active: boolean | null
          max_debt_days: number | null
          onboarding_completed: boolean | null
          stripe_customer_id: string | null
          telegram_bot_token: string | null
          telegram_bot_username: string | null
          updated_at: string | null
          user_id: string
          webhook_configured: boolean | null
        }
        Insert: {
          business_description?: string | null
          business_email?: string | null
          business_name: string
          business_phone?: string | null
          created_at?: string | null
          default_payment_method?: string | null
          fee_rate?: number | null
          id?: string
          is_active?: boolean | null
          max_debt_days?: number | null
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          telegram_bot_token?: string | null
          telegram_bot_username?: string | null
          updated_at?: string | null
          user_id: string
          webhook_configured?: boolean | null
        }
        Update: {
          business_description?: string | null
          business_email?: string | null
          business_name?: string
          business_phone?: string | null
          created_at?: string | null
          default_payment_method?: string | null
          fee_rate?: number | null
          id?: string
          is_active?: boolean | null
          max_debt_days?: number | null
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          telegram_bot_token?: string | null
          telegram_bot_username?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_configured?: boolean | null
        }
        Relationships: []
      }
      daily_fee_invoices: {
        Row: {
          client_id: string
          created_at: string
          due_date: string | null
          fees_count: number
          id: string
          invoice_date: string
          paid_at: string | null
          payment_id: string | null
          pix_code: string | null
          pix_qrcode: string | null
          status: string
          total_fees: number
        }
        Insert: {
          client_id: string
          created_at?: string
          due_date?: string | null
          fees_count?: number
          id?: string
          invoice_date: string
          paid_at?: string | null
          payment_id?: string | null
          pix_code?: string | null
          pix_qrcode?: string | null
          status?: string
          total_fees?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          due_date?: string | null
          fees_count?: number
          id?: string
          invoice_date?: string
          paid_at?: string | null
          payment_id?: string | null
          pix_code?: string | null
          pix_qrcode?: string | null
          status?: string
          total_fees?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_fee_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_events: {
        Row: {
          api_error_message: string | null
          api_response_code: number | null
          api_status: string | null
          bot_id: string | null
          client_id: string
          created_at: string
          currency: string | null
          customer_id: string | null
          event_id: string
          event_type: string
          id: string
          order_id: string | null
          product_id: string | null
          ttclid: string | null
          utm_campaign: string | null
          value: number | null
        }
        Insert: {
          api_error_message?: string | null
          api_response_code?: number | null
          api_status?: string | null
          bot_id?: string | null
          client_id: string
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          event_id: string
          event_type: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          ttclid?: string | null
          utm_campaign?: string | null
          value?: number | null
        }
        Update: {
          api_error_message?: string | null
          api_response_code?: number | null
          api_status?: string | null
          bot_id?: string | null
          client_id?: string
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          event_id?: string
          event_type?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          ttclid?: string | null
          utm_campaign?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_events_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_events_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "telegram_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body: string
          created_at: string | null
          event_type: string
          icon: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          event_type: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          event_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          bot_id: string | null
          client_id: string
          created_at: string | null
          customer_id: string | null
          delivered_at: string | null
          fees_paid: Json | null
          id: string
          is_downsell: boolean | null
          is_upsell: boolean | null
          last_recovery_sent_at: string | null
          paid_at: string | null
          parent_order_id: string | null
          payment_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          pix_code: string | null
          pix_qrcode: string | null
          product_id: string | null
          recovery_messages_sent: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          telegram_message_id: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bot_id?: string | null
          client_id: string
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          fees_paid?: Json | null
          id?: string
          is_downsell?: boolean | null
          is_upsell?: boolean | null
          last_recovery_sent_at?: string | null
          paid_at?: string | null
          parent_order_id?: string | null
          payment_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          pix_code?: string | null
          pix_qrcode?: string | null
          product_id?: string | null
          recovery_messages_sent?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          telegram_message_id?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bot_id?: string | null
          client_id?: string
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          fees_paid?: Json | null
          id?: string
          is_downsell?: boolean | null
          is_upsell?: boolean | null
          last_recovery_sent_at?: string | null
          paid_at?: string | null
          parent_order_id?: string | null
          payment_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          pix_code?: string | null
          pix_qrcode?: string | null
          product_id?: string | null
          recovery_messages_sent?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          telegram_message_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "telegram_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_parent_order_id_fkey"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          cart_recovery_enabled: boolean
          created_at: string | null
          custom_messages_enabled: boolean
          id: string
          max_bots: number
          max_orders_per_month: number
          max_products: number
          max_recovery_messages: number
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          priority_support: boolean
          updated_at: string | null
          upsell_enabled: boolean
        }
        Insert: {
          cart_recovery_enabled?: boolean
          created_at?: string | null
          custom_messages_enabled?: boolean
          id?: string
          max_bots?: number
          max_orders_per_month?: number
          max_products?: number
          max_recovery_messages?: number
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          priority_support?: boolean
          updated_at?: string | null
          upsell_enabled?: boolean
        }
        Update: {
          cart_recovery_enabled?: boolean
          created_at?: string | null
          custom_messages_enabled?: boolean
          id?: string
          max_bots?: number
          max_orders_per_month?: number
          max_products?: number
          max_recovery_messages?: number
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          priority_support?: boolean
          updated_at?: string | null
          upsell_enabled?: boolean
        }
        Relationships: []
      }
      platform_fees: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          order_id: string | null
          paid_at: string | null
          status: string
        }
        Insert: {
          amount?: number
          client_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          paid_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_fees_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_fees_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_fees: {
        Row: {
          amount: number
          button_text: string | null
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          is_active: boolean | null
          name: string
          payment_message: string | null
          product_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          name: string
          payment_message?: string | null
          product_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          name?: string
          payment_message?: string | null
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_fees_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_upsells: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          product_id: string
          updated_at: string | null
          upsell_message: string | null
          upsell_product_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          product_id: string
          updated_at?: string | null
          upsell_message?: string | null
          upsell_product_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          product_id?: string
          updated_at?: string | null
          upsell_message?: string | null
          upsell_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_upsells_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_upsells_upsell_product_id_fkey"
            columns: ["upsell_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bot_id: string | null
          client_id: string
          created_at: string | null
          description: string | null
          downsell_message: string | null
          downsell_product_id: string | null
          file_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_hot: boolean | null
          name: string
          price: number
          require_fees_before_delivery: boolean | null
          sales_count: number | null
          telegram_group_id: string | null
          updated_at: string | null
          upsell_message: string | null
          upsell_product_id: string | null
          views_count: number | null
        }
        Insert: {
          bot_id?: string | null
          client_id: string
          created_at?: string | null
          description?: string | null
          downsell_message?: string | null
          downsell_product_id?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_hot?: boolean | null
          name: string
          price: number
          require_fees_before_delivery?: boolean | null
          sales_count?: number | null
          telegram_group_id?: string | null
          updated_at?: string | null
          upsell_message?: string | null
          upsell_product_id?: string | null
          views_count?: number | null
        }
        Update: {
          bot_id?: string | null
          client_id?: string
          created_at?: string | null
          description?: string | null
          downsell_message?: string | null
          downsell_product_id?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_hot?: boolean | null
          name?: string
          price?: number
          require_fees_before_delivery?: boolean | null
          sales_count?: number | null
          telegram_group_id?: string | null
          updated_at?: string | null
          upsell_message?: string | null
          upsell_product_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_downsell_product_id_fkey"
            columns: ["downsell_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_upsell_product_id_fkey"
            columns: ["upsell_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          client_id: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          client_id: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          client_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"] | null
          cancelled_at: string | null
          client_id: string
          created_at: string
          expires_at: string | null
          id: string
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          price: number | null
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"] | null
          cancelled_at?: string | null
          client_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          price?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"] | null
          cancelled_at?: string | null
          client_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          price?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_customers: {
        Row: {
          bot_id: string | null
          client_id: string
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          last_recovery_sent_at: string | null
          phone: string | null
          recovery_messages_sent: number | null
          telegram_id: number
          telegram_username: string | null
          ttclid: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          bot_id?: string | null
          client_id: string
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_recovery_sent_at?: string | null
          phone?: string | null
          recovery_messages_sent?: number | null
          telegram_id: number
          telegram_username?: string | null
          ttclid?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          bot_id?: string | null
          client_id?: string
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_recovery_sent_at?: string | null
          phone?: string | null
          recovery_messages_sent?: number | null
          telegram_id?: number
          telegram_username?: string | null
          ttclid?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_customers_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_customers_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_customers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_messages: {
        Row: {
          bot_id: string | null
          client_id: string
          created_at: string
          customer_id: string | null
          direction: string
          id: string
          message_content: string | null
          message_type: string
          telegram_chat_id: number
          telegram_message_id: number | null
        }
        Insert: {
          bot_id?: string | null
          client_id: string
          created_at?: string
          customer_id?: string | null
          direction: string
          id?: string
          message_content?: string | null
          message_type?: string
          telegram_chat_id: number
          telegram_message_id?: number | null
        }
        Update: {
          bot_id?: string | null
          client_id?: string
          created_at?: string
          customer_id?: string | null
          direction?: string
          id?: string
          message_content?: string | null
          message_type?: string
          telegram_chat_id?: number
          telegram_message_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "telegram_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_events: {
        Row: {
          api_error_message: string | null
          api_response_code: number | null
          api_status: string | null
          bot_id: string | null
          client_id: string
          created_at: string
          currency: string | null
          customer_id: string | null
          event_id: string
          event_type: string
          id: string
          order_id: string | null
          product_id: string | null
          ttclid: string | null
          utm_campaign: string | null
          value: number | null
        }
        Insert: {
          api_error_message?: string | null
          api_response_code?: number | null
          api_status?: string | null
          bot_id?: string | null
          client_id: string
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          event_id: string
          event_type: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          ttclid?: string | null
          utm_campaign?: string | null
          value?: number | null
        }
        Update: {
          api_error_message?: string | null
          api_response_code?: number | null
          api_status?: string | null
          bot_id?: string | null
          client_id?: string
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          event_id?: string
          event_type?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          ttclid?: string | null
          utm_campaign?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_events_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_events_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "telegram_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      ttclid_mappings: {
        Row: {
          bot_id: string | null
          client_id: string
          created_at: string | null
          customer_id: string | null
          expires_at: string | null
          id: string
          short_code: string
          ttclid: string
          used_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          bot_id?: string | null
          client_id: string
          created_at?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          short_code: string
          ttclid: string
          used_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          bot_id?: string | null
          client_id?: string
          created_at?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          short_code?: string
          ttclid?: string
          used_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ttclid_mappings_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ttclid_mappings_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "client_bots_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ttclid_mappings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ttclid_mappings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "telegram_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      client_bots_public: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          is_primary: boolean | null
          name: string | null
          telegram_bot_username: string | null
          updated_at: string | null
          webhook_configured: boolean | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string | null
          telegram_bot_username?: string | null
          updated_at?: string | null
          webhook_configured?: boolean | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string | null
          telegram_bot_username?: string | null
          updated_at?: string | null
          webhook_configured?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_bots_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_my_affiliate_id: { Args: never; Returns: string }
      get_my_bot_ids: { Args: never; Returns: string[] }
      get_my_client_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      affiliate_status: "pending" | "approved" | "rejected" | "suspended"
      app_role: "admin" | "client"
      balance_transaction_type:
        | "credit"
        | "debit"
        | "fee_deduction"
        | "debt_payment"
      billing_cycle: "monthly" | "yearly"
      invoice_status: "pending" | "paid" | "overdue" | "cancelled"
      order_status: "pending" | "paid" | "delivered" | "cancelled" | "refunded"
      payment_method: "pix" | "card" | "boleto"
      platform_fee_status: "pending" | "paid" | "deducted_from_balance"
      subscription_plan: "free" | "basic" | "pro" | "enterprise"
      subscription_status:
        | "active"
        | "cancelled"
        | "expired"
        | "trial"
        | "pending"
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
      affiliate_status: ["pending", "approved", "rejected", "suspended"],
      app_role: ["admin", "client"],
      balance_transaction_type: [
        "credit",
        "debit",
        "fee_deduction",
        "debt_payment",
      ],
      billing_cycle: ["monthly", "yearly"],
      invoice_status: ["pending", "paid", "overdue", "cancelled"],
      order_status: ["pending", "paid", "delivered", "cancelled", "refunded"],
      payment_method: ["pix", "card", "boleto"],
      platform_fee_status: ["pending", "paid", "deducted_from_balance"],
      subscription_plan: ["free", "basic", "pro", "enterprise"],
      subscription_status: [
        "active",
        "cancelled",
        "expired",
        "trial",
        "pending",
      ],
    },
  },
} as const
