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
      bot_messages: {
        Row: {
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
      client_settings: {
        Row: {
          auto_delivery: boolean | null
          cart_reminder_enabled: boolean | null
          cart_reminder_hours: number | null
          client_id: string
          closing_time: string | null
          created_at: string | null
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
          updated_at: string | null
          upsell_enabled: boolean | null
          working_days: string[] | null
        }
        Insert: {
          auto_delivery?: boolean | null
          cart_reminder_enabled?: boolean | null
          cart_reminder_hours?: number | null
          client_id: string
          closing_time?: string | null
          created_at?: string | null
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
          updated_at?: string | null
          upsell_enabled?: boolean | null
          working_days?: string[] | null
        }
        Update: {
          auto_delivery?: boolean | null
          cart_reminder_enabled?: boolean | null
          cart_reminder_hours?: number | null
          client_id?: string
          closing_time?: string | null
          created_at?: string | null
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
          id: string
          is_active: boolean | null
          onboarding_completed: boolean | null
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
          id?: string
          is_active?: boolean | null
          onboarding_completed?: boolean | null
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
          id?: string
          is_active?: boolean | null
          onboarding_completed?: boolean | null
          telegram_bot_token?: string | null
          telegram_bot_username?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_configured?: boolean | null
        }
        Relationships: []
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
          updated_at: string | null
        }
        Insert: {
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
          updated_at?: string | null
        }
        Update: {
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
          updated_at?: string | null
        }
        Relationships: [
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
      [_ in never]: never
    }
    Functions: {
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
      app_role: "admin" | "client"
      billing_cycle: "monthly" | "yearly"
      order_status: "pending" | "paid" | "delivered" | "cancelled" | "refunded"
      payment_method: "pix" | "card" | "boleto"
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
      app_role: ["admin", "client"],
      billing_cycle: ["monthly", "yearly"],
      order_status: ["pending", "paid", "delivered", "cancelled", "refunded"],
      payment_method: ["pix", "card", "boleto"],
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
