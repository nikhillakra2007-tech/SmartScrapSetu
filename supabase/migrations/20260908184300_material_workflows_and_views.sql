-- Migration 4: Material Workflows, Aliases, Recycler Acceptance, PostGIS Geo-Matching & Catalog Views
SET search_path = public, extensions;

-- 1. Material aliases table
CREATE TABLE IF NOT EXISTS public.material_aliases (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_code text NOT NULL,
    sub_code text NOT NULL,
    language text NOT NULL,
    alias text NOT NULL,
    FOREIGN KEY (parent_code, sub_code) REFERENCES public.material_categories(parent_code, sub_code) ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE(parent_code, sub_code, language, alias)
);

-- 2. Recycler material acceptance table
CREATE TABLE IF NOT EXISTS public.recycler_material_acceptance (
    recycler_id uuid NOT NULL REFERENCES public.recyclers(id) ON DELETE CASCADE,
    parent_code text NOT NULL,
    sub_code text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    min_lot_kg numeric DEFAULT 0,
    max_lot_kg numeric,
    PRIMARY KEY (recycler_id, parent_code, sub_code),
    FOREIGN KEY (parent_code, sub_code) REFERENCES public.material_categories(parent_code, sub_code) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Seed recycler material acceptance from existing rate cards
INSERT INTO public.recycler_material_acceptance (recycler_id, parent_code, sub_code, is_active)
SELECT DISTINCT recycler_id, parent_code, sub_code, true 
FROM public.recycler_rate_cards
ON CONFLICT (recycler_id, parent_code, sub_code) DO NOTHING;

-- 3. WhatsApp messages log table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_message_id text NOT NULL UNIQUE,
    sender_hash text NOT NULL,
    message_type text NOT NULL,
    raw_payload jsonb,
    parent_code text,
    sub_code text,
    created_at timestamptz DEFAULT now() NOT NULL,
    FOREIGN KEY (parent_code, sub_code) REFERENCES public.material_categories(parent_code, sub_code) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_material_pair CHECK (
        (parent_code IS NULL AND sub_code IS NULL) OR (parent_code IS NOT NULL AND sub_code IS NOT NULL)
    )
);

-- 4. Seed multilingual / Hinglish aliases
INSERT INTO public.material_aliases (parent_code, sub_code, language, alias) VALUES
    ('LARGE_APPLIANCE', 'refrigerator', 'hinglish', 'fridge'),
    ('LARGE_APPLIANCE', 'refrigerator', 'hinglish', 'refrigerator'),
    ('LARGE_APPLIANCE', 'refrigerator', 'hinglish', 'purana fridge'),
    ('LARGE_APPLIANCE', 'washing_machine', 'hinglish', 'washing machine'),
    ('LARGE_APPLIANCE', 'washing_machine', 'hinglish', 'kapde dhone ki machine'),
    ('LARGE_APPLIANCE', 'air_conditioner', 'hinglish', 'ac'),
    ('LARGE_APPLIANCE', 'air_conditioner', 'hinglish', 'air conditioner'),
    ('COMPUTING', 'laptop', 'hinglish', 'laptop'),
    ('COMPUTING', 'laptop', 'hinglish', 'computer'),
    ('COMPUTING', 'desktop', 'hinglish', 'desktop'),
    ('COMPUTING', 'desktop', 'hinglish', 'cpu'),
    ('MOBILE', 'smartphone', 'hinglish', 'mobile'),
    ('MOBILE', 'smartphone', 'hinglish', 'phone'),
    ('MOBILE', 'smartphone', 'hinglish', 'smartphone'),
    ('PCB', 'motherboard', 'hinglish', 'motherboard'),
    ('PCB', 'motherboard', 'hinglish', 'circuit board'),
    ('PCB', 'motherboard', 'hinglish', 'pcb'),
    ('CABLE', 'copper_cable', 'hinglish', 'copper wire'),
    ('CABLE', 'copper_cable', 'hinglish', 'tamba taar'),
    ('CABLE', 'copper_cable', 'hinglish', 'wire'),
    ('BATTERY', 'lead_acid', 'hinglish', 'inverter battery'),
    ('BATTERY', 'lead_acid', 'hinglish', 'battery'),
    ('BATTERY', 'lithium_ion', 'hinglish', 'mobile battery'),
    ('SMALL_APPLIANCE', 'mixer', 'hinglish', 'mixer'),
    ('SMALL_APPLIANCE', 'mixer', 'hinglish', 'mixi'),
    ('SMALL_APPLIANCE', 'fan', 'hinglish', 'fan'),
    ('SMALL_APPLIANCE', 'fan', 'hinglish', 'pankha'),
    ('PAPER', 'newspaper', 'hinglish', 'newspaper'),
    ('PAPER', 'newspaper', 'hinglish', 'akhbar'),
    ('PAPER', 'newspaper', 'hinglish', 'purana akhbar'),
    ('PAPER', 'cardboard_carton', 'hinglish', 'cardboard'),
    ('PAPER', 'cardboard_carton', 'hinglish', 'carton'),
    ('PAPER', 'cardboard_carton', 'hinglish', 'box'),
    ('PAPER', 'cardboard_carton', 'hinglish', 'galla'),
    ('PAPER', 'cardboard_carton', 'hinglish', 'peti'),
    ('PAPER', 'books_magazines', 'hinglish', 'books'),
    ('PAPER', 'books_magazines', 'hinglish', 'kitab'),
    ('PAPER', 'books_magazines', 'hinglish', 'magazine'),
    ('PAPER', 'books_magazines', 'hinglish', 'copy'),
    ('PAPER', 'mixed_waste_paper', 'hinglish', 'raddi'),
    ('PAPER', 'mixed_waste_paper', 'hinglish', 'kagaz'),
    ('PAPER', 'mixed_waste_paper', 'hinglish', 'waste paper'),
    ('PLASTIC', 'pet_bottle', 'hinglish', 'plastic bottle'),
    ('PLASTIC', 'pet_bottle', 'hinglish', 'bottle'),
    ('PLASTIC', 'pet_bottle', 'hinglish', 'pet bottle'),
    ('PLASTIC', 'pet_bottle', 'hinglish', 'botal'),
    ('PLASTIC', 'mixed_plastic', 'hinglish', 'plastic'),
    ('PLASTIC', 'mixed_plastic', 'hinglish', 'plastic scrap'),
    ('PLASTIC', 'mixed_plastic', 'hinglish', 'mix plastic'),
    ('PLASTIC', 'hard_plastic', 'hinglish', 'kadak plastic'),
    ('PLASTIC', 'hard_plastic', 'hinglish', 'hard plastic'),
    ('PLASTIC', 'soft_plastic_film', 'hinglish', 'polythene'),
    ('PLASTIC', 'soft_plastic_film', 'hinglish', 'plastic bag'),
    ('PLASTIC', 'soft_plastic_film', 'hinglish', 'packaging film'),
    ('METAL_FERROUS', 'iron', 'hinglish', 'iron'),
    ('METAL_FERROUS', 'iron', 'hinglish', 'loha'),
    ('METAL_FERROUS', 'iron', 'hinglish', 'sariya'),
    ('METAL_FERROUS', 'steel', 'hinglish', 'steel'),
    ('METAL_FERROUS', 'steel', 'hinglish', 'stainless steel'),
    ('METAL_FERROUS', 'tin', 'hinglish', 'tin'),
    ('METAL_FERROUS', 'tin', 'hinglish', 'dabba'),
    ('METAL_NONFERROUS', 'aluminium', 'hinglish', 'aluminium'),
    ('METAL_NONFERROUS', 'aluminium', 'hinglish', 'elmonium'),
    ('METAL_NONFERROUS', 'copper', 'hinglish', 'copper'),
    ('METAL_NONFERROUS', 'copper', 'hinglish', 'tamba'),
    ('METAL_NONFERROUS', 'brass', 'hinglish', 'brass'),
    ('METAL_NONFERROUS', 'brass', 'hinglish', 'peetal'),
    ('GLASS', 'glass_bottle', 'hinglish', 'glass'),
    ('GLASS', 'glass_bottle', 'hinglish', 'kaanch'),
    ('GLASS', 'glass_bottle', 'hinglish', 'sheesha'),
    ('GLASS', 'glass_bottle', 'hinglish', 'botal'),
    ('TEXTILE', 'cotton_cloth', 'hinglish', 'cloth'),
    ('TEXTILE', 'cotton_cloth', 'hinglish', 'kapda'),
    ('TEXTILE', 'cotton_cloth', 'hinglish', 'purane kapde'),
    ('TEXTILE', 'mixed_fabric_rags', 'hinglish', 'rags'),
    ('TEXTILE', 'mixed_fabric_rags', 'hinglish', 'chindi'),
    ('TEXTILE', 'mixed_fabric_rags', 'hinglish', 'mix kapda'),
    ('RUBBER_OTHER', 'tyre', 'hinglish', 'tyre'),
    ('RUBBER_OTHER', 'tyre', 'hinglish', 'tayar'),
    ('RUBBER_OTHER', 'misc_other', 'hinglish', 'other'),
    ('RUBBER_OTHER', 'misc_other', 'hinglish', 'mix scrap'),
    ('RUBBER_OTHER', 'misc_other', 'hinglish', 'ispe kuch nahi')
ON CONFLICT (parent_code, sub_code, language, alias) DO NOTHING;

-- 5. PostGIS Geo-Matching Function
CREATE OR REPLACE FUNCTION public.fn_match_recyclers_for_lot(p_lot_id uuid, p_limit integer DEFAULT 5)
RETURNS TABLE(recycler_id uuid, business_name text, distance_km numeric, offered_rate_per_kg numeric, match_score numeric, match_rank integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public, extensions
AS 
 WITH candidates AS (
     SELECT r.id, r.business_name,
            round((extensions.ST_Distance(l.location, r.facility_location) / 1000.0)::numeric, 2) AS distance_km,
            rc.rate_per_kg, r.pickup_available
     FROM public.lots l
     JOIN public.recycler_material_acceptance a ON a.parent_code = l.parent_code AND a.sub_code = l.sub_code AND a.is_active = true
     JOIN public.recyclers r ON r.id = a.recycler_id
     JOIN LATERAL (
         SELECT x.rate_per_kg FROM public.recycler_rate_cards x
         WHERE x.recycler_id = r.id AND x.parent_code = l.parent_code AND x.sub_code = l.sub_code AND x.effective_date <= CURRENT_DATE
         ORDER BY x.effective_date DESC, x.created_at DESC, x.id LIMIT 1
     ) rc ON true
     WHERE l.id = p_lot_id AND l.location IS NOT NULL
       AND r.authorization_status = 'verified'
       AND (r.authorization_expiry IS NULL OR r.authorization_expiry >= CURRENT_DATE)
       AND (r.service_area IS NULL OR extensions.ST_Covers(r.service_area, l.location::extensions.geometry))
 ), scored AS (
     SELECT c.*, round((40.0 / (1.0 + c.distance_km * 0.1) + 30.0 + 20.0 + CASE WHEN c.pickup_available THEN 10.0 ELSE 0.0 END)::numeric, 2) AS score
     FROM candidates c
 )
 SELECT s.id, s.business_name, s.distance_km, s.rate_per_kg, s.score,
        row_number() OVER(ORDER BY s.score DESC, s.distance_km, s.id)::integer
 FROM scored s
 ORDER BY s.score DESC, s.distance_km, s.id
 LIMIT least(greatest(coalesce(p_limit, 5), 1), 50);
;

-- 6. The 8 Dedicated Category Catalog Views
CREATE OR REPLACE VIEW public.catalog_e_waste WITH (security_invoker=true) AS
SELECT parent_code, sub_code, parent_name, sub_name, is_hazardous, epr_schedule1_hint
FROM public.material_categories WHERE group_code = 'E_WASTE' AND active = true;

CREATE OR REPLACE VIEW public.catalog_paper WITH (security_invoker=true) AS
SELECT parent_code, sub_code, parent_name, sub_name
FROM public.material_categories WHERE group_code = 'PAPER' AND active = true;

CREATE OR REPLACE VIEW public.catalog_plastic WITH (security_invoker=true) AS
SELECT parent_code, sub_code, parent_name, sub_name
FROM public.material_categories WHERE group_code = 'PLASTIC' AND active = true;

CREATE OR REPLACE VIEW public.catalog_metal_ferrous WITH (security_invoker=true) AS
SELECT parent_code, sub_code, parent_name, sub_name
FROM public.material_categories WHERE group_code = 'METAL_FERROUS' AND active = true;

CREATE OR REPLACE VIEW public.catalog_metal_nonferrous WITH (security_invoker=true) AS
SELECT parent_code, sub_code, parent_name, sub_name
FROM public.material_categories WHERE group_code = 'METAL_NONFERROUS' AND active = true;

CREATE OR REPLACE VIEW public.catalog_glass WITH (security_invoker=true) AS
SELECT parent_code, sub_code, parent_name, sub_name
FROM public.material_categories WHERE group_code = 'GLASS' AND active = true;

CREATE OR REPLACE VIEW public.catalog_textile WITH (security_invoker=true) AS
SELECT parent_code, sub_code, parent_name, sub_name
FROM public.material_categories WHERE group_code = 'TEXTILE' AND active = true;

CREATE OR REPLACE VIEW public.catalog_rubber_other WITH (security_invoker=true) AS
SELECT parent_code, sub_code, parent_name, sub_name
FROM public.material_categories WHERE group_code = 'RUBBER_OTHER' AND active = true;

-- 7. Operational Views
CREATE OR REPLACE VIEW public.price_board WITH (security_invoker=true) AS
WITH recent_prices AS (
    SELECT DISTINCT ON (parent_code, sub_code)
           parent_code, sub_code, price_per_kg, price_date, ward_id, source_type
    FROM public.price_history
    ORDER BY parent_code, sub_code, price_date DESC, created_at DESC
)
SELECT mc.group_code, mc.parent_code, mc.parent_name, mc.sub_code, mc.sub_name,
       rp.price_per_kg, rp.price_date, w.ward_name, rp.source_type
FROM public.material_categories mc
LEFT JOIN recent_prices rp ON rp.parent_code = mc.parent_code AND rp.sub_code = mc.sub_code
LEFT JOIN public.delhi_wards w ON w.id = rp.ward_id
WHERE mc.active = true;

CREATE OR REPLACE VIEW public.collector_earnings_summary WITH (security_invoker=true) AS
SELECT c.id AS collector_id, c.display_name,
       count(t.id) AS completed_transactions,
       coalesce(sum(t.final_price), 0) AS total_earnings,
       coalesce(sum(l.weight_kg), 0) AS total_weight_kg
FROM public.collectors c
LEFT JOIN public.lots l ON l.collector_id = c.id
LEFT JOIN public.transactions t ON t.lot_id = l.id AND t.transaction_status = 'confirmed'
GROUP BY c.id, c.display_name;

CREATE OR REPLACE VIEW public.ai_training_export WITH (security_invoker=true) AS
SELECT l.id AS lot_id, l.parent_code, l.sub_code, l.condition, l.ai_confidence,
       l.ai_suggested_rate_per_kg, l.weight_kg, li.storage_path
FROM public.lots l
JOIN public.lot_images li ON li.lot_id = l.id
WHERE l.ai_confidence IS NOT NULL;