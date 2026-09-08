-- Migration 1: Core Extensions, Enums, Tables, Buckets, Indexes, Functions, and Triggers
SET search_path = public, extensions;

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

CREATE TYPE public."authorization_status" AS ENUM ('verified','pending_verification','expired','suspended');
CREATE TYPE public."collector_type" AS ENUM ('individual','collection_point');
CREATE TYPE public."lot_condition" AS ENUM ('working','damaged','scrap','burnt_unsafe');
CREATE TYPE public."lot_status" AS ENUM ('draft','submitted','matched','quoted','accepted','handed_over','confirmed','paid','disputed','cancelled');
CREATE TYPE public."payment_mode" AS ENUM ('cash','upi');
CREATE TYPE public."payment_status" AS ENUM ('pending','partial','paid');
CREATE TYPE public."pickup_request_status" AS ENUM ('pending','assigned','scheduled','collected','cancelled');
CREATE TYPE public."source_channel" AS ENUM ('app','voice','admin');
CREATE TYPE public."transaction_status" AS ENUM ('pending','quoted','accepted','handed_over','confirmed','paid','disputed','cancelled');
CREATE TYPE public."user_role" AS ENUM ('collector','recycler','admin');
CREATE TABLE public."audit_log" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"actor_id" uuid,
"action" text NOT NULL,
"entity_type" text NOT NULL,
"entity_id" uuid,
"before" jsonb,
"after" jsonb,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."audit_log" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."audit_log" FROM anon,authenticated;
GRANT ALL ON public."audit_log" TO service_role;
CREATE TABLE public."collectors" (
"id" uuid NOT NULL,
"collector_type" collector_type DEFAULT 'individual'::collector_type NOT NULL,
"display_name" text,
"preferred_language" text DEFAULT 'hi'::text NOT NULL,
"primary_ward_id" uuid,
"onboarded_via" source_channel DEFAULT 'app'::source_channel NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."collectors" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."collectors" FROM anon,authenticated;
GRANT ALL ON public."collectors" TO service_role;
CREATE TABLE public."customer_pickup_requests" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"customer_phone" text NOT NULL,
"pickup_address" text NOT NULL,
"pickup_location" geography(Point,4326),
"ward_id" uuid,
"material_description" text NOT NULL,
"parent_code" text,
"sub_code" text,
"approx_weight_kg" numeric(6,2),
"photo_url" text,
"preferred_date" date DEFAULT (CURRENT_DATE + '1 day'::interval) NOT NULL,
"preferred_time_window" text,
"is_bulk" boolean DEFAULT false NOT NULL,
"status" pickup_request_status DEFAULT 'pending'::pickup_request_status NOT NULL,
"assigned_collector_id" uuid,
"linked_lot_id" uuid,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."customer_pickup_requests" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."customer_pickup_requests" FROM anon,authenticated;
GRANT ALL ON public."customer_pickup_requests" TO service_role;
CREATE TABLE public."delhi_wards" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"ward_name" text NOT NULL,
"zone_name" text,
"geometry" geometry(MultiPolygon,4326) NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."delhi_wards" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."delhi_wards" FROM anon,authenticated;
GRANT ALL ON public."delhi_wards" TO service_role;
CREATE TABLE public."handover_records" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"transaction_id" uuid NOT NULL,
"lot_id" uuid NOT NULL,
"weight_at_handover" numeric(6,2) NOT NULL,
"gps_point" geography(Point,4326),
"handover_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
"unique_reference_code" text NOT NULL,
"recycler_confirmed_by" uuid,
"confirmation_method" text DEFAULT 'app_tap'::text NOT NULL,
"status" text DEFAULT 'confirmed'::text NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."handover_records" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."handover_records" FROM anon,authenticated;
GRANT ALL ON public."handover_records" TO service_role;
CREATE TABLE public."lot_images" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"lot_id" uuid NOT NULL,
"storage_path" text NOT NULL,
"is_primary" boolean DEFAULT false NOT NULL,
"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."lot_images" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."lot_images" FROM anon,authenticated;
GRANT ALL ON public."lot_images" TO service_role;
CREATE TABLE public."lot_matches" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"lot_id" uuid NOT NULL,
"recycler_id" uuid NOT NULL,
"score" numeric(5,2) NOT NULL,
"rank" integer DEFAULT 1 NOT NULL,
"offered_at" timestamp with time zone DEFAULT now() NOT NULL,
"status" text DEFAULT 'offered'::text NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."lot_matches" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."lot_matches" FROM anon,authenticated;
GRANT ALL ON public."lot_matches" TO service_role;
CREATE TABLE public."lots" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"collector_id" uuid NOT NULL,
"parent_code" text NOT NULL,
"sub_code" text NOT NULL,
"condition" lot_condition DEFAULT 'scrap'::lot_condition NOT NULL,
"weight_kg" numeric(6,2) NOT NULL,
"hazard_flags" text[] DEFAULT ARRAY[]::text[],
"ai_raw_response" jsonb,
"ai_suggested_rate_per_kg" numeric(8,2),
"ai_confidence" numeric(3,2),
"estimated_value" numeric(10,2),
"quoted_price" numeric(10,2),
"final_price" numeric(10,2),
"location" geography(Point,4326),
"ward_id" uuid,
"status" lot_status DEFAULT 'draft'::lot_status NOT NULL,
"source_channel" source_channel DEFAULT 'app'::source_channel NOT NULL,
"primary_image_path" text,
"client_created_at" timestamp with time zone DEFAULT now() NOT NULL,
"synced_at" timestamp with time zone,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."lots" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."lots" FROM anon,authenticated;
GRANT ALL ON public."lots" TO service_role;
CREATE TABLE public."material_categories" (
"parent_code" text NOT NULL,
"parent_name" text NOT NULL,
"sub_code" text NOT NULL,
"sub_name" text NOT NULL,
"is_hazardous" boolean DEFAULT false NOT NULL,
"epr_schedule1_hint" text,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."material_categories" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."material_categories" FROM anon,authenticated;
GRANT ALL ON public."material_categories" TO service_role;
CREATE TABLE public."price_history" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"parent_code" text NOT NULL,
"sub_code" text NOT NULL,
"ward_id" uuid,
"price_date" date DEFAULT CURRENT_DATE NOT NULL,
"price_per_kg" numeric(8,2) NOT NULL,
"source_type" text DEFAULT 'recycler_quote'::text NOT NULL,
"source_id" uuid,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."price_history" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."price_history" FROM anon,authenticated;
GRANT ALL ON public."price_history" TO service_role;
CREATE TABLE public."recycler_rate_cards" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"recycler_id" uuid NOT NULL,
"parent_code" text NOT NULL,
"sub_code" text NOT NULL,
"rate_per_kg" numeric(8,2) NOT NULL,
"effective_date" date DEFAULT CURRENT_DATE NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."recycler_rate_cards" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."recycler_rate_cards" FROM anon,authenticated;
GRANT ALL ON public."recycler_rate_cards" TO service_role;
CREATE TABLE public."recyclers" (
"id" uuid NOT NULL,
"business_name" text NOT NULL,
"facility_location" geography(Point,4326) NOT NULL,
"service_area" geometry(Polygon,4326),
"registration_number" text NOT NULL,
"registration_authority" text DEFAULT 'DPCC'::text NOT NULL,
"authorization_status" authorization_status DEFAULT 'verified'::authorization_status NOT NULL,
"authorization_expiry" date,
"pickup_available" boolean DEFAULT true NOT NULL,
"avg_rating" numeric(2,1) DEFAULT 5.0,
"verified_by_admin_id" uuid,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."recyclers" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."recyclers" FROM anon,authenticated;
GRANT ALL ON public."recyclers" TO service_role;
CREATE TABLE public."reviews" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"request_id" uuid,
"transaction_id" uuid,
"collector_id" uuid NOT NULL,
"rating" integer NOT NULL,
"comment_text" text,
"voice_review_url" text,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."reviews" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."reviews" FROM anon,authenticated;
GRANT ALL ON public."reviews" TO service_role;
CREATE TABLE public."safety_content" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"parent_code" text,
"language" text DEFAULT 'hi'::text NOT NULL,
"media_type" text NOT NULL,
"storage_path" text NOT NULL,
"title" text NOT NULL,
"description" text,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."safety_content" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."safety_content" FROM anon,authenticated;
GRANT ALL ON public."safety_content" TO service_role;
CREATE TABLE public."transactions" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"lot_id" uuid NOT NULL,
"recycler_id" uuid NOT NULL,
"quoted_price" numeric(10,2) NOT NULL,
"final_price" numeric(10,2),
"payment_mode" payment_mode DEFAULT 'cash'::payment_mode NOT NULL,
"payment_status" payment_status DEFAULT 'pending'::payment_status NOT NULL,
"transaction_status" transaction_status DEFAULT 'pending'::transaction_status NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"completed_at" timestamp with time zone,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."transactions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."transactions" FROM anon,authenticated;
GRANT ALL ON public."transactions" TO service_role;
CREATE TABLE public."users" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"role" user_role DEFAULT 'collector'::user_role NOT NULL,
"phone_number" text,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."users" FROM anon,authenticated;
GRANT ALL ON public."users" TO service_role;
CREATE TABLE public."voice_calls" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"exotel_call_sid" text,
"caller_phone" text NOT NULL,
"collector_id" uuid,
"detected_language" text DEFAULT 'hi'::text,
"transcript_text" text,
"gemini_intent_json" jsonb,
"created_lot_id" uuid,
"call_status" text DEFAULT 'completed'::text NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."voice_calls" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."voice_calls" FROM anon,authenticated;
GRANT ALL ON public."voice_calls" TO service_role;
ALTER TABLE public."delhi_wards" ADD CONSTRAINT "delhi_wards_pkey" PRIMARY KEY (id);
ALTER TABLE public."material_categories" ADD CONSTRAINT "material_categories_pkey" PRIMARY KEY (parent_code, sub_code);
ALTER TABLE public."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY (id);
ALTER TABLE public."users" ADD CONSTRAINT "users_phone_number_key" UNIQUE (phone_number);
ALTER TABLE public."collectors" ADD CONSTRAINT "collectors_pkey" PRIMARY KEY (id);
ALTER TABLE public."recyclers" ADD CONSTRAINT "recyclers_pkey" PRIMARY KEY (id);
ALTER TABLE public."recycler_rate_cards" ADD CONSTRAINT "recycler_rate_cards_rate_per_kg_check" CHECK ((rate_per_kg >= (0)::numeric));
ALTER TABLE public."recycler_rate_cards" ADD CONSTRAINT "recycler_rate_cards_pkey" PRIMARY KEY (id);
ALTER TABLE public."price_history" ADD CONSTRAINT "price_history_price_per_kg_check" CHECK ((price_per_kg >= (0)::numeric));
ALTER TABLE public."price_history" ADD CONSTRAINT "price_history_pkey" PRIMARY KEY (id);
ALTER TABLE public."lots" ADD CONSTRAINT "lots_weight_kg_check" CHECK ((weight_kg > (0)::numeric));
ALTER TABLE public."lots" ADD CONSTRAINT "lots_ai_confidence_check" CHECK (((ai_confidence >= 0.0) AND (ai_confidence <= 1.0)));
ALTER TABLE public."lots" ADD CONSTRAINT "lots_pkey" PRIMARY KEY (id);
ALTER TABLE public."lot_images" ADD CONSTRAINT "lot_images_pkey" PRIMARY KEY (id);
ALTER TABLE public."lot_matches" ADD CONSTRAINT "lot_matches_pkey" PRIMARY KEY (id);
ALTER TABLE public."lot_matches" ADD CONSTRAINT "unique_lot_recycler_match" UNIQUE (lot_id, recycler_id);
ALTER TABLE public."transactions" ADD CONSTRAINT "transactions_quoted_price_check" CHECK ((quoted_price >= (0)::numeric));
ALTER TABLE public."transactions" ADD CONSTRAINT "transactions_final_price_check" CHECK ((final_price >= (0)::numeric));
ALTER TABLE public."transactions" ADD CONSTRAINT "transactions_pkey" PRIMARY KEY (id);
ALTER TABLE public."transactions" ADD CONSTRAINT "transactions_lot_id_key" UNIQUE (lot_id);
ALTER TABLE public."handover_records" ADD CONSTRAINT "handover_records_weight_at_handover_check" CHECK ((weight_at_handover > (0)::numeric));
ALTER TABLE public."handover_records" ADD CONSTRAINT "handover_records_pkey" PRIMARY KEY (id);
ALTER TABLE public."handover_records" ADD CONSTRAINT "handover_records_unique_reference_code_key" UNIQUE (unique_reference_code);
ALTER TABLE public."customer_pickup_requests" ADD CONSTRAINT "customer_pickup_requests_pkey" PRIMARY KEY (id);
ALTER TABLE public."reviews" ADD CONSTRAINT "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5)));
ALTER TABLE public."reviews" ADD CONSTRAINT "reviews_pkey" PRIMARY KEY (id);
ALTER TABLE public."voice_calls" ADD CONSTRAINT "voice_calls_pkey" PRIMARY KEY (id);
ALTER TABLE public."safety_content" ADD CONSTRAINT "safety_content_pkey" PRIMARY KEY (id);
ALTER TABLE public."audit_log" ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY (id);

-- Create standard storage buckets
INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types) VALUES
    ('lot-images', 'lot-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/heic']),
    ('handover-photos', 'handover-photos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
    ('pickup-photos', 'pickup-photos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
    ('safety-media', 'safety-media', true, 20971520, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml','audio/mpeg','audio/wav','audio/webm'])
ON CONFLICT (id) DO NOTHING;


CREATE INDEX idx_reviews_collector ON public.reviews USING btree (collector_id);
CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);
CREATE INDEX idx_voice_calls_phone ON public.voice_calls USING btree (caller_phone);
CREATE INDEX idx_voice_calls_collector ON public.voice_calls USING btree (collector_id);
CREATE INDEX idx_users_role ON public.users USING btree (role);
CREATE INDEX idx_users_phone ON public.users USING btree (phone_number);
CREATE INDEX idx_collectors_ward ON public.collectors USING btree (primary_ward_id);
CREATE INDEX idx_collectors_type ON public.collectors USING btree (collector_type);
CREATE INDEX idx_delhi_wards_geom ON public.delhi_wards USING gist (geometry);
CREATE INDEX idx_delhi_wards_zone ON public.delhi_wards USING btree (zone_name);
CREATE INDEX idx_recyclers_facility_loc ON public.recyclers USING gist (facility_location);
CREATE INDEX idx_recyclers_service_area ON public.recyclers USING gist (service_area);
CREATE INDEX idx_recyclers_auth_status ON public.recyclers USING btree (authorization_status);
CREATE INDEX idx_rate_cards_recycler ON public.recycler_rate_cards USING btree (recycler_id);
CREATE INDEX idx_rate_cards_category ON public.recycler_rate_cards USING btree (parent_code, sub_code);
CREATE INDEX idx_rate_cards_effective ON public.recycler_rate_cards USING btree (effective_date DESC);
CREATE INDEX idx_material_categories_parent ON public.material_categories USING btree (parent_code);
CREATE INDEX idx_material_categories_hazardous ON public.material_categories USING btree (is_hazardous);
CREATE INDEX idx_price_history_cat_date ON public.price_history USING btree (parent_code, sub_code, price_date DESC);
CREATE INDEX idx_price_history_ward ON public.price_history USING btree (ward_id);
CREATE INDEX idx_price_history_date ON public.price_history USING btree (price_date DESC);
CREATE INDEX idx_lots_collector ON public.lots USING btree (collector_id);
CREATE INDEX idx_lots_status ON public.lots USING btree (status);
CREATE INDEX idx_lots_category ON public.lots USING btree (parent_code, sub_code);
CREATE INDEX idx_lots_ward ON public.lots USING btree (ward_id);
CREATE INDEX idx_lots_location ON public.lots USING gist (location);
CREATE INDEX idx_lots_client_created ON public.lots USING btree (client_created_at DESC);
CREATE INDEX idx_lot_images_lot ON public.lot_images USING btree (lot_id);
CREATE INDEX idx_lot_matches_lot ON public.lot_matches USING btree (lot_id);
CREATE INDEX idx_lot_matches_recycler ON public.lot_matches USING btree (recycler_id, status);
CREATE INDEX idx_transactions_lot ON public.transactions USING btree (lot_id);
CREATE INDEX idx_transactions_recycler ON public.transactions USING btree (recycler_id);
CREATE INDEX idx_transactions_status ON public.transactions USING btree (transaction_status);
CREATE INDEX idx_transactions_payment ON public.transactions USING btree (payment_status);
CREATE INDEX idx_handover_txn ON public.handover_records USING btree (transaction_id);
CREATE INDEX idx_handover_lot ON public.handover_records USING btree (lot_id);
CREATE INDEX idx_handover_ref ON public.handover_records USING btree (unique_reference_code);
CREATE INDEX idx_handover_gps ON public.handover_records USING gist (gps_point);
CREATE INDEX idx_pickup_status ON public.customer_pickup_requests USING btree (status);
CREATE INDEX idx_pickup_collector ON public.customer_pickup_requests USING btree (assigned_collector_id);
CREATE INDEX idx_pickup_location ON public.customer_pickup_requests USING gist (pickup_location);
CREATE INDEX idx_pickup_is_bulk ON public.customer_pickup_requests USING btree (is_bulk);
CREATE INDEX idx_safety_content_category ON public.safety_content USING btree (parent_code, language);
CREATE INDEX idx_audit_entity ON public.audit_log USING btree (entity_type, entity_id);
CREATE OR REPLACE FUNCTION public.fn_match_recyclers_for_lot(p_lot_id uuid, p_limit integer DEFAULT 5)
 RETURNS TABLE(recycler_id uuid, business_name text, distance_km numeric, offered_rate_per_kg numeric, match_score numeric, match_rank integer)
 LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
DECLARE
    v_lot_location GEOGRAPHY(Point, 4326);
    v_parent_code TEXT;
    v_sub_code TEXT;
BEGIN
    SELECT location, parent_code, sub_code
    INTO v_lot_location, v_parent_code, v_sub_code
    FROM lots
    WHERE id = p_lot_id;

    IF v_lot_location IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    WITH candidates AS (
        SELECT 
            r.id AS rec_id,
            r.business_name AS b_name,
            ROUND((ST_Distance(v_lot_location, r.facility_location) / 1000.0)::NUMERIC, 2) AS dist_km,
            rc.rate_per_kg AS rate,
            r.authorization_status,
            r.pickup_available
        FROM recyclers r
        LEFT JOIN recycler_rate_cards rc 
            ON rc.recycler_id = r.id 
            AND rc.parent_code = v_parent_code 
            AND rc.sub_code = v_sub_code
        WHERE r.authorization_status IN ('verified', 'pending_verification')
    ),
    scored AS (
        SELECT 
            c.rec_id,
            c.b_name,
            c.dist_km,
            COALESCE(c.rate, 0.00) AS rate,
            ROUND((
                (40.0 / (1.0 + (c.dist_km * 0.1)))
                + (CASE WHEN c.rate IS NOT NULL AND c.rate > 0 THEN 30.0 ELSE 0.0 END)
                + (CASE WHEN c.authorization_status = 'verified' THEN 20.0 ELSE 5.0 END)
                + (CASE WHEN c.pickup_available THEN 10.0 ELSE 0.0 END)
            )::NUMERIC, 2) AS calc_score
        FROM candidates c
    )
    SELECT 
        s.rec_id,
        s.b_name,
        s.dist_km,
        s.rate,
        s.calc_score,
        DENSE_RANK() OVER (ORDER BY s.calc_score DESC, s.dist_km ASC)::INT AS m_rank
    FROM scored s
    ORDER BY s.calc_score DESC, s.dist_km ASC
    LIMIT p_limit;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_generate_handover_ref_code()
 RETURNS text
 LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
BEGIN
    RETURN 'KC-DL-' || UPPER(SUBSTR(MD5(gen_random_uuid()::TEXT), 1, 6));
END;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_calculate_lot_estimated_value()
 RETURNS trigger
 LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
BEGIN
    IF NEW.weight_kg IS NOT NULL AND NEW.ai_suggested_rate_per_kg IS NOT NULL THEN
        NEW.estimated_value := ROUND((NEW.weight_kg * NEW.ai_suggested_rate_per_kg)::NUMERIC, 2);
    END IF;
    RETURN NEW;
END;
$function$
;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_collectors_updated_at BEFORE UPDATE ON public.collectors FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_recyclers_updated_at BEFORE UPDATE ON public.recyclers FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_lots_updated_at BEFORE UPDATE ON public.lots FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_pickup_updated_at BEFORE UPDATE ON public.customer_pickup_requests FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_lot_estimated_value BEFORE INSERT OR UPDATE OF weight_kg, ai_suggested_rate_per_kg ON public.lots FOR EACH ROW EXECUTE FUNCTION fn_calculate_lot_estimated_value();