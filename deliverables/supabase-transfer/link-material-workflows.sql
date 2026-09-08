BEGIN;
SET LOCAL search_path=public,extensions;
CREATE TABLE public.material_families (
 parent_code text PRIMARY KEY,
 group_code text NOT NULL REFERENCES public.material_groups(code) ON DELETE RESTRICT,
 UNIQUE(parent_code,group_code)
);
INSERT INTO public.material_families SELECT DISTINCT parent_code,group_code FROM public.material_categories;
ALTER TABLE public.material_categories ADD CONSTRAINT category_family_fk FOREIGN KEY(parent_code,group_code)
 REFERENCES public.material_families(parent_code,group_code) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.safety_content ADD CONSTRAINT safety_family_fk FOREIGN KEY(parent_code) REFERENCES public.material_families(parent_code) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.material_families ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.material_families FROM anon,authenticated;
GRANT SELECT ON public.material_families TO anon,authenticated;
GRANT ALL ON public.material_families TO service_role;
CREATE POLICY catalog_read ON public.material_families FOR SELECT TO anon,authenticated USING(true);
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','newspaper','hinglish','newspaper');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','newspaper','hinglish','akhbar');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','newspaper','hinglish','purana akhbar');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','cardboard_carton','hinglish','cardboard');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','cardboard_carton','hinglish','carton');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','cardboard_carton','hinglish','box');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','cardboard_carton','hinglish','galla');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','cardboard_carton','hinglish','peti');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','books_magazines','hinglish','books');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','books_magazines','hinglish','kitab');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','books_magazines','hinglish','magazine');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','books_magazines','hinglish','copy');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','mixed_waste_paper','hinglish','raddi');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','mixed_waste_paper','hinglish','kagaz');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PAPER','mixed_waste_paper','hinglish','waste paper');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','pet_bottle','hinglish','plastic bottle');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','pet_bottle','hinglish','bottle');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','pet_bottle','hinglish','pet bottle');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','pet_bottle','hinglish','botal');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','mixed_plastic','hinglish','plastic');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','mixed_plastic','hinglish','plastic scrap');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','mixed_plastic','hinglish','mix plastic');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','hard_plastic','hinglish','kadak plastic');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','hard_plastic','hinglish','hard plastic');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','soft_plastic_film','hinglish','polythene');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','soft_plastic_film','hinglish','plastic bag');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('PLASTIC','soft_plastic_film','hinglish','packaging film');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_FERROUS','iron','hinglish','iron');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_FERROUS','iron','hinglish','loha');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_FERROUS','iron','hinglish','sariya');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_FERROUS','steel','hinglish','steel');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_FERROUS','steel','hinglish','stainless steel');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_FERROUS','tin','hinglish','tin');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_FERROUS','tin','hinglish','dabba');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_NONFERROUS','aluminium','hinglish','aluminium');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_NONFERROUS','aluminium','hinglish','elmonium');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_NONFERROUS','copper','hinglish','copper');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_NONFERROUS','copper','hinglish','tamba');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_NONFERROUS','brass','hinglish','brass');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('METAL_NONFERROUS','brass','hinglish','peetal');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('GLASS','glass_bottle','hinglish','glass');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('GLASS','glass_bottle','hinglish','kaanch');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('GLASS','glass_bottle','hinglish','sheesha');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('GLASS','glass_bottle','hinglish','botal');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('TEXTILE','cotton_cloth','hinglish','cloth');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('TEXTILE','cotton_cloth','hinglish','kapda');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('TEXTILE','cotton_cloth','hinglish','purane kapde');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('TEXTILE','mixed_fabric_rags','hinglish','rags');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('TEXTILE','mixed_fabric_rags','hinglish','chindi');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('TEXTILE','mixed_fabric_rags','hinglish','mix kapda');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('RUBBER_OTHER','tyre','hinglish','tyre');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('RUBBER_OTHER','tyre','hinglish','tayar');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('RUBBER_OTHER','misc_other','hinglish','other');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('RUBBER_OTHER','misc_other','hinglish','mix scrap');
INSERT INTO public.material_aliases(parent_code,sub_code,language,alias) VALUES ('RUBBER_OTHER','misc_other','hinglish','ispe kuch nahi');

-- An ambiguous alias such as "botal" deliberately returns multiple candidates.
-- The resolver must ask which material, rather than silently selecting one.
CREATE OR REPLACE FUNCTION public.fn_match_recyclers_for_lot(p_lot_id uuid,p_limit integer DEFAULT 5)
RETURNS TABLE(recycler_id uuid,business_name text,distance_km numeric,offered_rate_per_kg numeric,match_score numeric,match_rank integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public,extensions
AS $$
 WITH candidates AS (
 SELECT r.id,r.business_name,
 round((extensions.ST_Distance(l.location,r.facility_location)/1000.0)::numeric,2) AS distance_km,
 rc.rate_per_kg,r.pickup_available
 FROM public.lots l
 JOIN public.recycler_material_acceptance a ON a.parent_code=l.parent_code AND a.sub_code=l.sub_code
 JOIN public.recyclers r ON r.id=a.recycler_id
 JOIN LATERAL (
 SELECT x.rate_per_kg FROM public.recycler_rate_cards x
 WHERE x.recycler_id=r.id AND x.parent_code=l.parent_code AND x.sub_code=l.sub_code AND x.effective_date<=CURRENT_DATE
 ORDER BY x.effective_date DESC,x.created_at DESC,x.id LIMIT 1
 ) rc ON true
 WHERE l.id=p_lot_id AND l.location IS NOT NULL
 AND r.authorization_status='verified'
 AND (r.authorization_expiry IS NULL OR r.authorization_expiry>=CURRENT_DATE)
 AND (r.service_area IS NULL OR extensions.ST_Covers(r.service_area,l.location::extensions.geometry))
 ), scored AS (
 SELECT c.*,round((40.0/(1.0+c.distance_km*0.1)+30.0+20.0+CASE WHEN c.pickup_available THEN 10.0 ELSE 0.0 END)::numeric,2) score
 FROM candidates c
 )
 SELECT s.id,s.business_name,s.distance_km,s.rate_per_kg,s.score,
 row_number() OVER(ORDER BY s.score DESC,s.distance_km,s.id)::integer
 FROM scored s ORDER BY s.score DESC,s.distance_km,s.id
 LIMIT least(greatest(coalesce(p_limit,5),1),50)
$$;
REVOKE ALL ON FUNCTION public.fn_match_recyclers_for_lot(uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fn_match_recyclers_for_lot(uuid,integer) TO service_role;
COMMIT;

