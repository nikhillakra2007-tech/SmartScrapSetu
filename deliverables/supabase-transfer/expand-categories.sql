-- Category expansion after private/bootstrap.sql; retains business IDs and price dates.
BEGIN;
SET LOCAL search_path=public,extensions;
SET LOCAL timezone='UTC';
CREATE TABLE public.material_groups (
 code text PRIMARY KEY CHECK (code IN ('E_WASTE','PAPER','PLASTIC','METAL_FERROUS','METAL_NONFERROUS','GLASS','TEXTILE','RUBBER_OTHER')),
 name text NOT NULL UNIQUE CHECK (length(btrim(name))>0)
);
INSERT INTO public.material_groups VALUES ('E_WASTE','E-Waste'),('PAPER','Paper & Cardboard'),('PLASTIC','Plastic'),('METAL_FERROUS','Ferrous Metal'),('METAL_NONFERROUS','Non-Ferrous Metal'),('GLASS','Glass'),('TEXTILE','Textile / Cloth'),('RUBBER_OTHER','Rubber & Other');
ALTER TABLE public.material_categories ADD COLUMN group_code text;
ALTER TABLE public.material_categories ADD COLUMN active boolean NOT NULL DEFAULT true;
-- Key updates cascade through every existing material FK, including historical prices.
ALTER TABLE public.recycler_rate_cards DROP CONSTRAINT "recycler_rate_cards_parent_code_sub_code_fkey";
ALTER TABLE public.recycler_rate_cards ADD CONSTRAINT "recycler_rate_cards_parent_code_sub_code_fkey" FOREIGN KEY (parent_code, sub_code) REFERENCES material_categories(parent_code, sub_code) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.price_history DROP CONSTRAINT "price_history_parent_code_sub_code_fkey";
ALTER TABLE public.price_history ADD CONSTRAINT "price_history_parent_code_sub_code_fkey" FOREIGN KEY (parent_code, sub_code) REFERENCES material_categories(parent_code, sub_code) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.lots DROP CONSTRAINT "lots_parent_code_sub_code_fkey";
ALTER TABLE public.lots ADD CONSTRAINT "lots_parent_code_sub_code_fkey" FOREIGN KEY (parent_code, sub_code) REFERENCES material_categories(parent_code, sub_code) ON UPDATE CASCADE;

-- Mixed metal cannot safely be guessed to be ferrous or non-ferrous.
-- Preserve its complete old catalog row for classification review, outside e-waste.
CREATE TABLE public.material_classification_review (
 source_parent_code text NOT NULL,
 source_sub_code text NOT NULL,
 source_record jsonb NOT NULL,
 reason text NOT NULL,
 PRIMARY KEY(source_parent_code,source_sub_code)
);
INSERT INTO public.material_classification_review
 SELECT parent_code,sub_code,to_jsonb(mc)-'group_code'-'active',
 'Mixed composition: verify ferrous/non-ferrous before publishing a category or rate.'
 FROM public.material_categories mc WHERE parent_code='METAL_SCRAP' AND sub_code='mixed_metal_casing';
DELETE FROM public.material_categories WHERE parent_code='METAL_SCRAP' AND sub_code='mixed_metal_casing';
UPDATE public.material_categories SET parent_code='METAL_NONFERROUS',parent_name='Non-Ferrous Metal',sub_code='copper',group_code='METAL_NONFERROUS' WHERE parent_code='METAL_SCRAP' AND sub_code='copper_scrap';
UPDATE public.material_categories SET parent_code='METAL_NONFERROUS',parent_name='Non-Ferrous Metal',sub_code='aluminium',group_code='METAL_NONFERROUS' WHERE parent_code='METAL_SCRAP' AND sub_code='aluminium_scrap';
UPDATE public.material_categories SET parent_code='METAL_FERROUS',parent_name='Ferrous Metal',sub_code='iron',group_code='METAL_FERROUS' WHERE parent_code='METAL_SCRAP' AND sub_code='iron_steel_scrap';
UPDATE public.material_categories SET parent_name='Plastic',group_code='PLASTIC' WHERE parent_code='PLASTIC';
UPDATE public.material_categories SET group_code='E_WASTE' WHERE group_code IS NULL;
ALTER TABLE public.material_categories ALTER COLUMN group_code SET NOT NULL;
ALTER TABLE public.material_categories ADD CONSTRAINT material_group_fk FOREIGN KEY(group_code) REFERENCES public.material_groups(code) ON DELETE RESTRICT;
ALTER TABLE public.material_categories ADD CONSTRAINT material_group_parent_check CHECK (
 (group_code='E_WASTE' AND parent_code IN ('PCB','BATTERY','CRT','LCD_LED_PANEL','CABLE_WIRE','MOTOR_MAGNET','WHOLE_DEVICE','LIGHTING','MISC_COMPONENT'))
 OR (group_code<>'E_WASTE' AND parent_code=group_code)
);
ALTER TABLE public.material_categories ADD CONSTRAINT epr_ewaste_only CHECK (group_code='E_WASTE' OR epr_schedule1_hint IS NULL);
CREATE INDEX material_categories_group_idx ON public.material_categories(group_code);
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('PAPER','Paper & Cardboard','newspaper','Newspaper','PAPER') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('PAPER','Paper & Cardboard','cardboard_carton','Cardboard Carton','PAPER') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('PAPER','Paper & Cardboard','books_magazines','Books Magazines','PAPER') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('PAPER','Paper & Cardboard','mixed_waste_paper','Mixed Waste Paper','PAPER') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('PLASTIC','Plastic','pet_bottle','Pet Bottle','PLASTIC') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('PLASTIC','Plastic','mixed_plastic','Mixed Plastic','PLASTIC') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('PLASTIC','Plastic','hard_plastic','Hard Plastic','PLASTIC') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('PLASTIC','Plastic','soft_plastic_film','Soft Plastic Film','PLASTIC') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('METAL_FERROUS','Ferrous Metal','iron','Iron','METAL_FERROUS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('METAL_FERROUS','Ferrous Metal','steel','Steel','METAL_FERROUS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('METAL_FERROUS','Ferrous Metal','tin','Tin','METAL_FERROUS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('METAL_NONFERROUS','Non-Ferrous Metal','aluminium','Aluminium','METAL_NONFERROUS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('METAL_NONFERROUS','Non-Ferrous Metal','copper','Copper','METAL_NONFERROUS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('METAL_NONFERROUS','Non-Ferrous Metal','copper_wire_insulated','Copper Wire Insulated','METAL_NONFERROUS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('METAL_NONFERROUS','Non-Ferrous Metal','brass','Brass','METAL_NONFERROUS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('METAL_NONFERROUS','Non-Ferrous Metal','aluminium_wire','Aluminium Wire','METAL_NONFERROUS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('GLASS','Glass','glass_bottle','Glass Bottle','GLASS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('GLASS','Glass','broken_mixed_glass','Broken Mixed Glass','GLASS') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('TEXTILE','Textile / Cloth','cotton_cloth','Cotton Cloth','TEXTILE') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('TEXTILE','Textile / Cloth','mixed_fabric_rags','Mixed Fabric Rags','TEXTILE') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('RUBBER_OTHER','Rubber & Other','tyre','Tyre','RUBBER_OTHER') ON CONFLICT(parent_code,sub_code) DO NOTHING;
INSERT INTO public.material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('RUBBER_OTHER','Rubber & Other','misc_other','Misc Other','RUBBER_OTHER') ON CONFLICT(parent_code,sub_code) DO NOTHING;

-- Explicit identity link; legacy public.users rows are NOT fabricated Auth accounts.
ALTER TABLE public.users ADD COLUMN auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
-- Reference links for voice, recycler acceptance, and multilingual material resolution.
CREATE TABLE public.material_aliases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 parent_code text NOT NULL, sub_code text NOT NULL,
 language text NOT NULL CHECK(language IN ('en','hi','hinglish')),
 alias text NOT NULL CHECK(length(btrim(alias))>0 AND alias=lower(btrim(alias))),
 FOREIGN KEY(parent_code,sub_code) REFERENCES public.material_categories(parent_code,sub_code) ON UPDATE CASCADE ON DELETE RESTRICT,
 UNIQUE(language,alias,parent_code,sub_code)
);
CREATE INDEX material_alias_lookup ON public.material_aliases(language,alias);
CREATE TABLE public.recycler_material_acceptance (
 recycler_id uuid NOT NULL REFERENCES public.recyclers(id) ON DELETE CASCADE,
 parent_code text NOT NULL,sub_code text NOT NULL,
 PRIMARY KEY(recycler_id,parent_code,sub_code),
 FOREIGN KEY(parent_code,sub_code) REFERENCES public.material_categories(parent_code,sub_code) ON UPDATE CASCADE ON DELETE RESTRICT
);
INSERT INTO public.recycler_material_acceptance SELECT DISTINCT recycler_id,parent_code,sub_code FROM public.recycler_rate_cards;
ALTER TABLE public.recycler_rate_cards ADD CONSTRAINT rate_card_accepted_material_fk
 FOREIGN KEY(recycler_id,parent_code,sub_code) REFERENCES public.recycler_material_acceptance(recycler_id,parent_code,sub_code) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.voice_calls ADD COLUMN parent_code text, ADD COLUMN sub_code text;
ALTER TABLE public.voice_calls ADD CONSTRAINT voice_material_pair CHECK ((parent_code IS NULL)=(sub_code IS NULL));
ALTER TABLE public.voice_calls ADD CONSTRAINT voice_material_fk FOREIGN KEY(parent_code,sub_code) REFERENCES public.material_categories(parent_code,sub_code) ON UPDATE CASCADE ON DELETE RESTRICT;
CREATE UNIQUE INDEX voice_provider_id_unique ON public.voice_calls(exotel_call_sid) WHERE exotel_call_sid IS NOT NULL;
CREATE TABLE public.whatsapp_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 provider_message_id text NOT NULL UNIQUE CHECK(length(btrim(provider_message_id))>0),
 sender_hash text NOT NULL CHECK(length(sender_hash)>=32),
 message_type text NOT NULL CHECK(message_type IN ('text','voice_note')),
 status text NOT NULL DEFAULT 'received' CHECK(status IN ('received','processing','completed','failed')),
 parent_code text, sub_code text, error_code text,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK((parent_code IS NULL)=(sub_code IS NULL)),
 FOREIGN KEY(parent_code,sub_code) REFERENCES public.material_categories(parent_code,sub_code) ON UPDATE CASCADE ON DELETE RESTRICT
);
-- Restrict new operational tables to the trusted backend until real Auth identities are linked.
ALTER TABLE public.material_groups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.material_groups FROM anon,authenticated;
GRANT ALL ON public.material_groups TO service_role;
ALTER TABLE public.material_classification_review ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.material_classification_review FROM anon,authenticated;
GRANT ALL ON public.material_classification_review TO service_role;
ALTER TABLE public.material_aliases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.material_aliases FROM anon,authenticated;
GRANT ALL ON public.material_aliases TO service_role;
ALTER TABLE public.recycler_material_acceptance ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.recycler_material_acceptance FROM anon,authenticated;
GRANT ALL ON public.recycler_material_acceptance TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.whatsapp_messages FROM anon,authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
GRANT SELECT ON public.material_groups TO anon,authenticated;
CREATE POLICY catalog_read ON public.material_groups FOR SELECT TO anon,authenticated USING (true);
GRANT SELECT ON public.material_categories TO anon,authenticated;
CREATE POLICY catalog_read ON public.material_categories FOR SELECT TO anon,authenticated USING (true);
GRANT SELECT ON public.material_aliases TO anon,authenticated;
CREATE POLICY catalog_read ON public.material_aliases FOR SELECT TO anon,authenticated USING (true);
GRANT SELECT ON public.price_history TO anon,authenticated;
CREATE POLICY catalog_read ON public.price_history FOR SELECT TO anon,authenticated USING (true);
GRANT SELECT ON public.safety_content TO anon,authenticated;
CREATE POLICY catalog_read ON public.safety_content FOR SELECT TO anon,authenticated USING (true);
GRANT SELECT ON public.price_board TO anon,authenticated;
CREATE VIEW public.catalog_e_waste WITH (security_invoker=true) AS SELECT * FROM public.material_categories WHERE group_code='E_WASTE' AND active;
GRANT SELECT ON public.catalog_e_waste TO anon,authenticated,service_role;
CREATE VIEW public.catalog_paper WITH (security_invoker=true) AS SELECT * FROM public.material_categories WHERE group_code='PAPER' AND active;
GRANT SELECT ON public.catalog_paper TO anon,authenticated,service_role;
CREATE VIEW public.catalog_plastic WITH (security_invoker=true) AS SELECT * FROM public.material_categories WHERE group_code='PLASTIC' AND active;
GRANT SELECT ON public.catalog_plastic TO anon,authenticated,service_role;
CREATE VIEW public.catalog_metal_ferrous WITH (security_invoker=true) AS SELECT * FROM public.material_categories WHERE group_code='METAL_FERROUS' AND active;
GRANT SELECT ON public.catalog_metal_ferrous TO anon,authenticated,service_role;
CREATE VIEW public.catalog_metal_nonferrous WITH (security_invoker=true) AS SELECT * FROM public.material_categories WHERE group_code='METAL_NONFERROUS' AND active;
GRANT SELECT ON public.catalog_metal_nonferrous TO anon,authenticated,service_role;
CREATE VIEW public.catalog_glass WITH (security_invoker=true) AS SELECT * FROM public.material_categories WHERE group_code='GLASS' AND active;
GRANT SELECT ON public.catalog_glass TO anon,authenticated,service_role;
CREATE VIEW public.catalog_textile WITH (security_invoker=true) AS SELECT * FROM public.material_categories WHERE group_code='TEXTILE' AND active;
GRANT SELECT ON public.catalog_textile TO anon,authenticated,service_role;
CREATE VIEW public.catalog_rubber_other WITH (security_invoker=true) AS SELECT * FROM public.material_categories WHERE group_code='RUBBER_OTHER' AND active;
GRANT SELECT ON public.catalog_rubber_other TO anon,authenticated,service_role;
-- Invariant: neither old parent appears within e-waste.
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.material_categories WHERE parent_code='METAL_SCRAP' OR (group_code='E_WASTE' AND parent_code='PLASTIC')) THEN RAISE EXCEPTION 'Legacy metal/plastic remains in e-waste'; END IF;
 IF (SELECT count(DISTINCT parent_code) FROM public.material_categories WHERE group_code='E_WASTE')<>9 THEN RAISE EXCEPTION 'Expected nine e-waste parents'; END IF;
END $$;
COMMIT;
