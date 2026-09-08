-- Migration 3: Expand 8-Category Taxonomy & E-Waste Hierarchy
SET search_path = public, extensions;

-- 1. Create the 8 top-level material groups
CREATE TABLE IF NOT EXISTS public.material_groups (
    code text PRIMARY KEY CHECK (code IN ('E_WASTE','PAPER','PLASTIC','METAL_FERROUS','METAL_NONFERROUS','GLASS','TEXTILE','RUBBER_OTHER')),
    name text NOT NULL UNIQUE CHECK (length(btrim(name)) > 0)
);

INSERT INTO public.material_groups (code, name) VALUES
    ('E_WASTE', 'E-Waste'),
    ('PAPER', 'Paper & Cardboard'),
    ('PLASTIC', 'Plastic'),
    ('METAL_FERROUS', 'Metal — Ferrous'),
    ('METAL_NONFERROUS', 'Metal — Non-Ferrous'),
    ('GLASS', 'Glass'),
    ('TEXTILE', 'Textile / Cloth'),
    ('RUBBER_OTHER', 'Rubber & Other')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- 2. Create material_families to enforce the 8 E-Waste families + 7 General families
CREATE TABLE IF NOT EXISTS public.material_families (
    parent_code text PRIMARY KEY,
    group_code text NOT NULL REFERENCES public.material_groups(code) ON DELETE RESTRICT,
    name text NOT NULL,
    UNIQUE(parent_code, group_code)
);

INSERT INTO public.material_families (parent_code, group_code, name) VALUES
    ('LARGE_APPLIANCE', 'E_WASTE', 'Large Appliances'),
    ('DISPLAY', 'E_WASTE', 'Display & Screens'),
    ('COMPUTING', 'E_WASTE', 'Computing & IT'),
    ('MOBILE', 'E_WASTE', 'Mobile Devices'),
    ('PCB', 'E_WASTE', 'Printed Circuit Boards'),
    ('CABLE', 'E_WASTE', 'Cables & Wires'),
    ('BATTERY', 'E_WASTE', 'Batteries & Cells'),
    ('SMALL_APPLIANCE', 'E_WASTE', 'Small Appliances'),
    ('PAPER', 'PAPER', 'Paper & Cardboard'),
    ('PLASTIC', 'PLASTIC', 'Plastic'),
    ('METAL_FERROUS', 'METAL_FERROUS', 'Metal — Ferrous'),
    ('METAL_NONFERROUS', 'METAL_NONFERROUS', 'Metal — Non-Ferrous'),
    ('GLASS', 'GLASS', 'Glass'),
    ('TEXTILE', 'TEXTILE', 'Textile / Cloth'),
    ('RUBBER_OTHER', 'RUBBER_OTHER', 'Rubber & Other')
ON CONFLICT (parent_code) DO UPDATE SET group_code = EXCLUDED.group_code, name = EXCLUDED.name;

-- 3. Alter material_categories for group scoping & active status
ALTER TABLE public.material_categories ADD COLUMN IF NOT EXISTS group_code text;
ALTER TABLE public.material_categories ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- 4. Preserve unclassified mixed metal casing in classification review
CREATE TABLE IF NOT EXISTS public.material_classification_review (
    source_parent_code text NOT NULL,
    source_sub_code text NOT NULL,
    source_record jsonb NOT NULL,
    reason text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY(source_parent_code, source_sub_code)
);

INSERT INTO public.material_classification_review (source_parent_code, source_sub_code, source_record, reason)
SELECT parent_code, sub_code, to_jsonb(mc) - 'group_code' - 'active',
       'Mixed composition: verify ferrous/non-ferrous before publishing a category or rate.'
FROM public.material_categories mc
WHERE parent_code = 'METAL_SCRAP' AND sub_code = 'mixed_metal_casing'
ON CONFLICT (source_parent_code, source_sub_code) DO NOTHING;

-- 5. Insert all 50 canonical categories across 8 groups & 8 e-waste families
INSERT INTO public.material_categories (parent_code, parent_name, sub_code, sub_name, group_code, is_hazardous, active) VALUES
    ('LARGE_APPLIANCE', 'Large Appliances', 'refrigerator', 'Refrigerator', 'E_WASTE', false, true),
    ('LARGE_APPLIANCE', 'Large Appliances', 'air_conditioner', 'Air Conditioner', 'E_WASTE', false, true),
    ('LARGE_APPLIANCE', 'Large Appliances', 'washing_machine', 'Washing Machine', 'E_WASTE', false, true),
    ('LARGE_APPLIANCE', 'Large Appliances', 'dishwasher', 'Dishwasher', 'E_WASTE', false, true),
    ('LARGE_APPLIANCE', 'Large Appliances', 'water_cooler', 'Water Cooler', 'E_WASTE', false, true),
    ('DISPLAY', 'Display & Screens', 'television', 'Television', 'E_WASTE', false, true),
    ('DISPLAY', 'Display & Screens', 'monitor', 'Monitor', 'E_WASTE', false, true),
    ('DISPLAY', 'Display & Screens', 'crt', 'CRT', 'E_WASTE', true, true),
    ('COMPUTING', 'Computing & IT', 'laptop', 'Laptop', 'E_WASTE', false, true),
    ('COMPUTING', 'Computing & IT', 'desktop', 'Desktop', 'E_WASTE', false, true),
    ('COMPUTING', 'Computing & IT', 'keyboard', 'Keyboard', 'E_WASTE', false, true),
    ('COMPUTING', 'Computing & IT', 'mouse', 'Mouse', 'E_WASTE', false, true),
    ('MOBILE', 'Mobile Devices', 'smartphone', 'Smartphone', 'E_WASTE', false, true),
    ('MOBILE', 'Mobile Devices', 'tablet', 'Tablet', 'E_WASTE', false, true),
    ('MOBILE', 'Mobile Devices', 'feature_phone', 'Feature Phone', 'E_WASTE', false, true),
    ('PCB', 'Printed Circuit Boards', 'motherboard', 'Motherboard', 'E_WASTE', true, true),
    ('PCB', 'Printed Circuit Boards', 'appliance_pcb', 'Appliance PCB', 'E_WASTE', true, true),
    ('PCB', 'Printed Circuit Boards', 'other_pcb', 'Other PCB', 'E_WASTE', true, true),
    ('CABLE', 'Cables & Wires', 'copper_cable', 'Copper Cable', 'E_WASTE', false, true),
    ('CABLE', 'Cables & Wires', 'power_cable', 'Power Cable', 'E_WASTE', false, true),
    ('CABLE', 'Cables & Wires', 'data_cable', 'Data Cable', 'E_WASTE', false, true),
    ('BATTERY', 'Batteries & Cells', 'lead_acid', 'Lead Acid', 'E_WASTE', true, true),
    ('BATTERY', 'Batteries & Cells', 'lithium_ion', 'Lithium Ion', 'E_WASTE', true, true),
    ('BATTERY', 'Batteries & Cells', 'other_battery', 'Other Battery', 'E_WASTE', true, true),
    ('SMALL_APPLIANCE', 'Small Appliances', 'mixer', 'Mixer', 'E_WASTE', false, true),
    ('SMALL_APPLIANCE', 'Small Appliances', 'iron', 'Iron', 'E_WASTE', false, true),
    ('SMALL_APPLIANCE', 'Small Appliances', 'vacuum_cleaner', 'Vacuum Cleaner', 'E_WASTE', false, true),
    ('SMALL_APPLIANCE', 'Small Appliances', 'electric_kettle', 'Electric Kettle', 'E_WASTE', false, true),
    ('SMALL_APPLIANCE', 'Small Appliances', 'fan', 'Fan', 'E_WASTE', false, true),
    ('PAPER', 'Paper & Cardboard', 'newspaper', 'Newspaper', 'PAPER', false, true),
    ('PAPER', 'Paper & Cardboard', 'cardboard_carton', 'Cardboard Carton', 'PAPER', false, true),
    ('PAPER', 'Paper & Cardboard', 'books_magazines', 'Books Magazines', 'PAPER', false, true),
    ('PAPER', 'Paper & Cardboard', 'mixed_waste_paper', 'Mixed Waste Paper', 'PAPER', false, true),
    ('PLASTIC', 'Plastic', 'pet_bottle', 'Pet Bottle', 'PLASTIC', false, true),
    ('PLASTIC', 'Plastic', 'mixed_plastic', 'Mixed Plastic', 'PLASTIC', false, true),
    ('PLASTIC', 'Plastic', 'hard_plastic', 'Hard Plastic', 'PLASTIC', false, true),
    ('PLASTIC', 'Plastic', 'soft_plastic_film', 'Soft Plastic Film', 'PLASTIC', false, true),
    ('METAL_FERROUS', 'Metal — Ferrous', 'iron', 'Iron', 'METAL_FERROUS', false, true),
    ('METAL_FERROUS', 'Metal — Ferrous', 'steel', 'Steel', 'METAL_FERROUS', false, true),
    ('METAL_FERROUS', 'Metal — Ferrous', 'tin', 'Tin', 'METAL_FERROUS', false, true),
    ('METAL_NONFERROUS', 'Metal — Non-Ferrous', 'aluminium', 'Aluminium', 'METAL_NONFERROUS', false, true),
    ('METAL_NONFERROUS', 'Metal — Non-Ferrous', 'copper', 'Copper', 'METAL_NONFERROUS', false, true),
    ('METAL_NONFERROUS', 'Metal — Non-Ferrous', 'copper_wire_insulated', 'Copper Wire Insulated', 'METAL_NONFERROUS', false, true),
    ('METAL_NONFERROUS', 'Metal — Non-Ferrous', 'brass', 'Brass', 'METAL_NONFERROUS', false, true),
    ('GLASS', 'Glass', 'glass_bottle', 'Glass Bottle', 'GLASS', false, true),
    ('GLASS', 'Glass', 'broken_mixed_glass', 'Broken Mixed Glass', 'GLASS', false, true),
    ('TEXTILE', 'Textile / Cloth', 'cotton_cloth', 'Cotton Cloth', 'TEXTILE', false, true),
    ('TEXTILE', 'Textile / Cloth', 'mixed_fabric_rags', 'Mixed Fabric Rags', 'TEXTILE', false, true),
    ('RUBBER_OTHER', 'Rubber & Other', 'tyre', 'Tyre', 'RUBBER_OTHER', false, true),
    ('RUBBER_OTHER', 'Rubber & Other', 'misc_other', 'Misc Other', 'RUBBER_OTHER', false, true)
ON CONFLICT (parent_code, sub_code) DO UPDATE SET
    parent_name = EXCLUDED.parent_name,
    sub_name = EXCLUDED.sub_name,
    group_code = EXCLUDED.group_code,
    active = true;

-- 6. Remap existing records in lots, price_history, and recycler_rate_cards
UPDATE public.lots SET parent_code = 'PCB', sub_code = 'other_pcb' WHERE parent_code = 'PCB' AND sub_code = 'mobile_pcb';

UPDATE public.price_history SET parent_code = 'BATTERY', sub_code = 'lead_acid' WHERE parent_code = 'BATTERY' AND sub_code = 'lead_acid_ups_inverter_auto';
UPDATE public.price_history SET parent_code = 'BATTERY', sub_code = 'lithium_ion' WHERE parent_code = 'BATTERY' AND sub_code = 'li_ion_mobile_laptop';
UPDATE public.price_history SET parent_code = 'CABLE', sub_code = 'copper_cable' WHERE parent_code = 'CABLE_WIRE' AND sub_code = 'copper_wire';
UPDATE public.price_history SET parent_code = 'DISPLAY', sub_code = 'monitor' WHERE parent_code = 'LCD_LED_PANEL' AND sub_code = 'laptop_panel';
UPDATE public.price_history SET parent_code = 'METAL_NONFERROUS', sub_code = 'copper' WHERE parent_code = 'METAL_SCRAP' AND sub_code = 'copper_scrap';
UPDATE public.price_history SET parent_code = 'LARGE_APPLIANCE', sub_code = 'refrigerator' WHERE parent_code = 'MOTOR_MAGNET' AND sub_code = 'compressor_motor';
UPDATE public.price_history SET parent_code = 'PCB', sub_code = 'motherboard' WHERE parent_code = 'PCB' AND sub_code = 'computer_motherboard';
UPDATE public.price_history SET parent_code = 'PCB', sub_code = 'other_pcb' WHERE parent_code = 'PCB' AND sub_code = 'mobile_pcb';
UPDATE public.price_history SET parent_code = 'COMPUTING', sub_code = 'laptop' WHERE parent_code = 'WHOLE_DEVICE' AND sub_code = 'laptop';
UPDATE public.price_history SET parent_code = 'MOBILE', sub_code = 'smartphone' WHERE parent_code = 'WHOLE_DEVICE' AND sub_code = 'mobile_phone';

UPDATE public.recycler_rate_cards SET parent_code = 'BATTERY', sub_code = 'lead_acid' WHERE parent_code = 'BATTERY' AND sub_code = 'lead_acid_ups_inverter_auto';
UPDATE public.recycler_rate_cards SET parent_code = 'BATTERY', sub_code = 'lithium_ion' WHERE parent_code = 'BATTERY' AND sub_code = 'li_ion_mobile_laptop';
UPDATE public.recycler_rate_cards SET parent_code = 'CABLE', sub_code = 'copper_cable' WHERE parent_code = 'CABLE_WIRE' AND sub_code = 'copper_wire';
UPDATE public.recycler_rate_cards SET parent_code = 'DISPLAY', sub_code = 'monitor' WHERE parent_code = 'LCD_LED_PANEL' AND sub_code = 'laptop_panel';
UPDATE public.recycler_rate_cards SET parent_code = 'LARGE_APPLIANCE', sub_code = 'refrigerator' WHERE parent_code = 'MOTOR_MAGNET' AND sub_code = 'compressor_motor';
UPDATE public.recycler_rate_cards SET parent_code = 'PCB', sub_code = 'motherboard' WHERE parent_code = 'PCB' AND sub_code = 'computer_motherboard';
UPDATE public.recycler_rate_cards SET parent_code = 'PCB', sub_code = 'other_pcb' WHERE parent_code = 'PCB' AND sub_code = 'mobile_pcb';
UPDATE public.recycler_rate_cards SET parent_code = 'COMPUTING', sub_code = 'laptop' WHERE parent_code = 'WHOLE_DEVICE' AND sub_code = 'laptop';

-- 7. Update safety_content
UPDATE public.safety_content SET parent_code = 'DISPLAY' WHERE parent_code = 'CRT';
UPDATE public.safety_content SET parent_code = 'SMALL_APPLIANCE' WHERE parent_code = 'LIGHTING';
UPDATE public.safety_content SET parent_code = 'CABLE' WHERE parent_code = 'CABLE_WIRE';

-- 8. Clean up non-canonical rows from material_categories
DELETE FROM public.material_categories WHERE group_code IS NULL;

-- 9. Enforce constraints
ALTER TABLE public.material_categories ALTER COLUMN group_code SET NOT NULL;

ALTER TABLE public.material_categories DROP CONSTRAINT IF EXISTS material_group_fk;
ALTER TABLE public.material_categories ADD CONSTRAINT material_group_fk 
    FOREIGN KEY(group_code) REFERENCES public.material_groups(code) ON DELETE RESTRICT;

ALTER TABLE public.material_categories DROP CONSTRAINT IF EXISTS material_group_parent_check;
ALTER TABLE public.material_categories ADD CONSTRAINT material_group_parent_check CHECK (
    (group_code = 'E_WASTE' AND parent_code IN ('LARGE_APPLIANCE','DISPLAY','COMPUTING','MOBILE','PCB','CABLE','BATTERY','SMALL_APPLIANCE'))
    OR (group_code <> 'E_WASTE' AND parent_code = group_code)
);

ALTER TABLE public.material_categories DROP CONSTRAINT IF EXISTS epr_ewaste_only;
ALTER TABLE public.material_categories ADD CONSTRAINT epr_ewaste_only 
    CHECK (group_code = 'E_WASTE' OR epr_schedule1_hint IS NULL);

ALTER TABLE public.material_categories DROP CONSTRAINT IF EXISTS category_family_fk;
ALTER TABLE public.material_categories ADD CONSTRAINT category_family_fk 
    FOREIGN KEY(parent_code, group_code) REFERENCES public.material_families(parent_code, group_code) 
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public.safety_content DROP CONSTRAINT IF EXISTS safety_family_fk;
ALTER TABLE public.safety_content ADD CONSTRAINT safety_family_fk 
    FOREIGN KEY(parent_code) REFERENCES public.material_families(parent_code) 
    ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS material_categories_group_idx ON public.material_categories(group_code);

-- 10. Link users auth_user_id column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;