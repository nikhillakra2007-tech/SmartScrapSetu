-- Migration 5: Row Level Security & Access Policies
SET search_path = public, extensions;

-- 1. Enable RLS on all 23 application tables
ALTER TABLE public.material_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_classification_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delhi_wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycler_rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycler_material_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recyclers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handover_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- 2. Grant read access to anon & authenticated on reference catalog tables
REVOKE ALL ON public.material_groups FROM anon, authenticated;
GRANT SELECT ON public.material_groups TO anon, authenticated;
DROP POLICY IF EXISTS catalog_groups_read ON public.material_groups;
CREATE POLICY catalog_groups_read ON public.material_groups FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON public.material_families FROM anon, authenticated;
GRANT SELECT ON public.material_families TO anon, authenticated;
DROP POLICY IF EXISTS catalog_families_read ON public.material_families;
CREATE POLICY catalog_families_read ON public.material_families FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON public.material_categories FROM anon, authenticated;
GRANT SELECT ON public.material_categories TO anon, authenticated;
DROP POLICY IF EXISTS catalog_categories_read ON public.material_categories;
CREATE POLICY catalog_categories_read ON public.material_categories FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON public.material_aliases FROM anon, authenticated;
GRANT SELECT ON public.material_aliases TO anon, authenticated;
DROP POLICY IF EXISTS catalog_aliases_read ON public.material_aliases;
CREATE POLICY catalog_aliases_read ON public.material_aliases FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON public.delhi_wards FROM anon, authenticated;
GRANT SELECT ON public.delhi_wards TO anon, authenticated;
DROP POLICY IF EXISTS wards_read ON public.delhi_wards;
CREATE POLICY wards_read ON public.delhi_wards FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON public.safety_content FROM anon, authenticated;
GRANT SELECT ON public.safety_content TO anon, authenticated;
DROP POLICY IF EXISTS safety_read ON public.safety_content;
CREATE POLICY safety_read ON public.safety_content FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON public.price_history FROM anon, authenticated;
GRANT SELECT ON public.price_history TO anon, authenticated;
DROP POLICY IF EXISTS price_history_read ON public.price_history;
CREATE POLICY price_history_read ON public.price_history FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON public.recycler_rate_cards FROM anon, authenticated;
GRANT SELECT ON public.recycler_rate_cards TO anon, authenticated;
DROP POLICY IF EXISTS rate_cards_read ON public.recycler_rate_cards;
CREATE POLICY rate_cards_read ON public.recycler_rate_cards FOR SELECT TO anon, authenticated USING (true);

-- 3. Grant read access to catalog views for anon & authenticated
GRANT SELECT ON 
    public.catalog_e_waste,
    public.catalog_paper,
    public.catalog_plastic,
    public.catalog_metal_ferrous,
    public.catalog_metal_nonferrous,
    public.catalog_glass,
    public.catalog_textile,
    public.catalog_rubber_other,
    public.price_board,
    public.collector_earnings_summary,
    public.ai_training_export
TO anon, authenticated;

-- 4. Revoke direct anon access to sensitive & operational tables
REVOKE ALL ON public.users FROM anon;
REVOKE ALL ON public.collectors FROM anon;
REVOKE ALL ON public.recyclers FROM anon;
REVOKE ALL ON public.lots FROM anon;
REVOKE ALL ON public.lot_images FROM anon;
REVOKE ALL ON public.lot_matches FROM anon;
REVOKE ALL ON public.transactions FROM anon;
REVOKE ALL ON public.handover_records FROM anon;
REVOKE ALL ON public.customer_pickup_requests FROM anon;
REVOKE ALL ON public.voice_calls FROM anon;
REVOKE ALL ON public.reviews FROM anon;
REVOKE ALL ON public.audit_log FROM anon;
REVOKE ALL ON public.whatsapp_messages FROM anon;
REVOKE ALL ON public.material_classification_review FROM anon;

-- 5. Full permissions for service_role (backend trusted service role key)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;