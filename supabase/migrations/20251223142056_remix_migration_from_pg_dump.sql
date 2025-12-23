CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'client'
);


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'paid',
    'delivered',
    'cancelled',
    'refunded'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'pix',
    'card',
    'boleto'
);


--
-- Name: create_default_bot_messages(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_default_bot_messages() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Insert default messages
  INSERT INTO public.bot_messages (client_id, message_type, message_content) VALUES
    (NEW.id, 'welcome', 'Olá! 👋 Bem-vindo à nossa loja! Use /produtos para ver nosso catálogo.'),
    (NEW.id, 'payment_instructions', 'Escaneie o QR Code ou copie o código PIX para realizar o pagamento.'),
    (NEW.id, 'payment_success', '✅ Pagamento confirmado! Seu produto será entregue em instantes.'),
    (NEW.id, 'order_created', '🛒 Pedido criado com sucesso! Efetue o pagamento para receber seu produto.'),
    (NEW.id, 'order_cancelled', '❌ Pedido cancelado.'),
    (NEW.id, 'cart_reminder', '🛒 Você tem um pedido pendente! Complete seu pagamento para receber seu produto.'),
    (NEW.id, 'upsell', '🔥 Que tal aproveitar e levar mais um produto com desconto especial?'),
    (NEW.id, 'support', '💬 Precisa de ajuda? Estamos aqui para te atender!'),
    (NEW.id, 'product_delivered', '📦 Produto entregue! Obrigado pela compra!'),
    (NEW.id, 'no_products', '😕 Nenhum produto disponível no momento.');
  
  -- Insert default settings
  INSERT INTO public.client_settings (client_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;


--
-- Name: get_my_client_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_client_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id FROM public.clients WHERE user_id = auth.uid()
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: bot_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bot_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    message_type text NOT NULL,
    message_content text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    display_order integer DEFAULT 1 NOT NULL,
    media_url text,
    media_type text,
    buttons jsonb DEFAULT '[]'::jsonb
);


--
-- Name: client_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    auto_delivery boolean DEFAULT true,
    cart_reminder_enabled boolean DEFAULT false,
    cart_reminder_hours integer DEFAULT 24,
    upsell_enabled boolean DEFAULT false,
    support_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    business_name text NOT NULL,
    telegram_bot_token text,
    telegram_bot_username text,
    webhook_configured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    customer_id uuid,
    product_id uuid,
    amount numeric NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status,
    payment_method public.payment_method DEFAULT 'pix'::public.payment_method,
    pix_code text,
    pix_qrcode text,
    payment_id text,
    telegram_message_id bigint,
    paid_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_upsell boolean DEFAULT false,
    is_downsell boolean DEFAULT false,
    parent_order_id uuid
);


--
-- Name: product_upsells; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_upsells (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    upsell_product_id uuid NOT NULL,
    upsell_message text,
    display_order integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    image_url text,
    file_url text,
    is_active boolean DEFAULT true,
    is_hot boolean DEFAULT false,
    views_count integer DEFAULT 0,
    sales_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    telegram_group_id text,
    upsell_product_id uuid,
    downsell_product_id uuid,
    upsell_message text,
    downsell_message text
);


--
-- Name: telegram_customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telegram_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    telegram_id bigint NOT NULL,
    telegram_username text,
    first_name text,
    last_name text,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: telegram_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telegram_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    customer_id uuid,
    telegram_chat_id bigint NOT NULL,
    telegram_message_id bigint,
    direction text NOT NULL,
    message_type text DEFAULT 'text'::text NOT NULL,
    message_content text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT telegram_messages_direction_check CHECK ((direction = ANY (ARRAY['incoming'::text, 'outgoing'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'client'::public.app_role NOT NULL
);


--
-- Name: bot_messages bot_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_messages
    ADD CONSTRAINT bot_messages_pkey PRIMARY KEY (id);


--
-- Name: client_settings client_settings_client_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_settings
    ADD CONSTRAINT client_settings_client_id_key UNIQUE (client_id);


--
-- Name: client_settings client_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_settings
    ADD CONSTRAINT client_settings_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients clients_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_key UNIQUE (user_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_upsells product_upsells_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_upsells
    ADD CONSTRAINT product_upsells_pkey PRIMARY KEY (id);


--
-- Name: product_upsells product_upsells_product_id_upsell_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_upsells
    ADD CONSTRAINT product_upsells_product_id_upsell_product_id_key UNIQUE (product_id, upsell_product_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: telegram_customers telegram_customers_client_id_telegram_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_customers
    ADD CONSTRAINT telegram_customers_client_id_telegram_id_key UNIQUE (client_id, telegram_id);


--
-- Name: telegram_customers telegram_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_customers
    ADD CONSTRAINT telegram_customers_pkey PRIMARY KEY (id);


--
-- Name: telegram_messages telegram_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_messages
    ADD CONSTRAINT telegram_messages_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_bot_messages_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bot_messages_order ON public.bot_messages USING btree (client_id, message_type, display_order);


--
-- Name: idx_orders_is_downsell; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_is_downsell ON public.orders USING btree (is_downsell) WHERE (is_downsell = true);


--
-- Name: idx_orders_is_upsell; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_is_upsell ON public.orders USING btree (is_upsell) WHERE (is_upsell = true);


--
-- Name: idx_orders_parent_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_parent_order_id ON public.orders USING btree (parent_order_id);


--
-- Name: idx_product_upsells_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_upsells_display_order ON public.product_upsells USING btree (product_id, display_order);


--
-- Name: idx_product_upsells_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_upsells_product_id ON public.product_upsells USING btree (product_id);


--
-- Name: idx_products_downsell; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_downsell ON public.products USING btree (downsell_product_id);


--
-- Name: idx_products_upsell; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_upsell ON public.products USING btree (upsell_product_id);


--
-- Name: idx_telegram_messages_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telegram_messages_chat_id ON public.telegram_messages USING btree (telegram_chat_id);


--
-- Name: idx_telegram_messages_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telegram_messages_client_id ON public.telegram_messages USING btree (client_id);


--
-- Name: idx_telegram_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telegram_messages_created_at ON public.telegram_messages USING btree (created_at DESC);


--
-- Name: idx_telegram_messages_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telegram_messages_customer_id ON public.telegram_messages USING btree (customer_id);


--
-- Name: clients on_client_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_client_created AFTER INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.create_default_bot_messages();


--
-- Name: bot_messages update_bot_messages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bot_messages_updated_at BEFORE UPDATE ON public.bot_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_settings update_client_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_client_settings_updated_at BEFORE UPDATE ON public.client_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: clients update_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: product_upsells update_product_upsells_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_product_upsells_updated_at BEFORE UPDATE ON public.product_upsells FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: telegram_customers update_telegram_customers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_telegram_customers_updated_at BEFORE UPDATE ON public.telegram_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bot_messages bot_messages_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_messages
    ADD CONSTRAINT bot_messages_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_settings client_settings_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_settings
    ADD CONSTRAINT client_settings_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: orders orders_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.telegram_customers(id);


--
-- Name: orders orders_parent_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_parent_order_id_fkey FOREIGN KEY (parent_order_id) REFERENCES public.orders(id);


--
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_upsells product_upsells_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_upsells
    ADD CONSTRAINT product_upsells_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_upsells product_upsells_upsell_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_upsells
    ADD CONSTRAINT product_upsells_upsell_product_id_fkey FOREIGN KEY (upsell_product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: products products_downsell_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_downsell_product_id_fkey FOREIGN KEY (downsell_product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: products products_upsell_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_upsell_product_id_fkey FOREIGN KEY (upsell_product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: telegram_customers telegram_customers_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_customers
    ADD CONSTRAINT telegram_customers_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: telegram_messages telegram_messages_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_messages
    ADD CONSTRAINT telegram_messages_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: telegram_messages telegram_messages_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_messages
    ADD CONSTRAINT telegram_messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.telegram_customers(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: bot_messages Clients can delete their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can delete their own messages" ON public.bot_messages FOR DELETE USING ((client_id = public.get_my_client_id()));


--
-- Name: product_upsells Clients can delete their own product upsells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can delete their own product upsells" ON public.product_upsells FOR DELETE USING ((product_id IN ( SELECT products.id
   FROM public.products
  WHERE (products.client_id = public.get_my_client_id()))));


--
-- Name: products Clients can delete their own products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can delete their own products" ON public.products FOR DELETE USING ((client_id = public.get_my_client_id()));


--
-- Name: telegram_customers Clients can insert their own customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can insert their own customers" ON public.telegram_customers FOR INSERT WITH CHECK ((client_id = public.get_my_client_id()));


--
-- Name: bot_messages Clients can insert their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can insert their own messages" ON public.bot_messages FOR INSERT WITH CHECK ((client_id = public.get_my_client_id()));


--
-- Name: telegram_messages Clients can insert their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can insert their own messages" ON public.telegram_messages FOR INSERT WITH CHECK ((client_id = public.get_my_client_id()));


--
-- Name: orders Clients can insert their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can insert their own orders" ON public.orders FOR INSERT WITH CHECK ((client_id = public.get_my_client_id()));


--
-- Name: product_upsells Clients can insert their own product upsells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can insert their own product upsells" ON public.product_upsells FOR INSERT WITH CHECK ((product_id IN ( SELECT products.id
   FROM public.products
  WHERE (products.client_id = public.get_my_client_id()))));


--
-- Name: products Clients can insert their own products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can insert their own products" ON public.products FOR INSERT WITH CHECK ((client_id = public.get_my_client_id()));


--
-- Name: client_settings Clients can insert their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can insert their own settings" ON public.client_settings FOR INSERT WITH CHECK ((client_id = public.get_my_client_id()));


--
-- Name: telegram_customers Clients can update their own customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can update their own customers" ON public.telegram_customers FOR UPDATE USING ((client_id = public.get_my_client_id()));


--
-- Name: bot_messages Clients can update their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can update their own messages" ON public.bot_messages FOR UPDATE USING ((client_id = public.get_my_client_id()));


--
-- Name: orders Clients can update their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can update their own orders" ON public.orders FOR UPDATE USING ((client_id = public.get_my_client_id()));


--
-- Name: product_upsells Clients can update their own product upsells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can update their own product upsells" ON public.product_upsells FOR UPDATE USING ((product_id IN ( SELECT products.id
   FROM public.products
  WHERE (products.client_id = public.get_my_client_id()))));


--
-- Name: products Clients can update their own products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can update their own products" ON public.products FOR UPDATE USING ((client_id = public.get_my_client_id()));


--
-- Name: client_settings Clients can update their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can update their own settings" ON public.client_settings FOR UPDATE USING ((client_id = public.get_my_client_id()));


--
-- Name: telegram_customers Clients can view their own customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view their own customers" ON public.telegram_customers FOR SELECT USING (((client_id = public.get_my_client_id()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: bot_messages Clients can view their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view their own messages" ON public.bot_messages FOR SELECT USING (((client_id = public.get_my_client_id()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: telegram_messages Clients can view their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view their own messages" ON public.telegram_messages FOR SELECT USING (((client_id = public.get_my_client_id()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: orders Clients can view their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view their own orders" ON public.orders FOR SELECT USING (((client_id = public.get_my_client_id()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: product_upsells Clients can view their own product upsells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view their own product upsells" ON public.product_upsells FOR SELECT USING (((product_id IN ( SELECT products.id
   FROM public.products
  WHERE (products.client_id = public.get_my_client_id()))) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: products Clients can view their own products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view their own products" ON public.products FOR SELECT USING (((client_id = public.get_my_client_id()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: client_settings Clients can view their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view their own settings" ON public.client_settings FOR SELECT USING (((client_id = public.get_my_client_id()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: clients Users can insert their own client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own client" ON public.clients FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: clients Users can update their own client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own client" ON public.clients FOR UPDATE USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: clients Users can view their own client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own client" ON public.clients FOR SELECT USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: bot_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bot_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: client_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: product_upsells; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_upsells ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: telegram_customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.telegram_customers ENABLE ROW LEVEL SECURITY;

--
-- Name: telegram_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;