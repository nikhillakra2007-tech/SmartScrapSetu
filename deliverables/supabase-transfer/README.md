# SmartScrapSetu database transfer

Status: **prepared and locally tested; NOT applied to Supabase**. The destination connection reports `transaction_read_only=on`, and its public schema remains empty.

Source: `kabadiwala-sih` (`nyohejyiqiccttaobhjd`).
Destination: `SmartScrapSetu` (`hdlynafbuybvjbdcftjb`).

## Prepared changes

- Copies 17 application tables and all 105 source records, preserving business UUIDs, dates, geometry, monetary values, and relationships.
- Copies four bucket configurations, ten enum types, existing indexes, seven triggers, four functions, and three views. No Auth users, stored objects, Edge Functions, or public/storage RLS policies existed in the source.
- Adds eight top-level material groups and 16 parent families: nine e-waste families plus seven general categories.
- Removes `METAL_SCRAP` from the active taxonomy. Copper and aluminium move to `METAL_NONFERROUS`; iron/steel scrap moves to `METAL_FERROUS`. Historical copper-price keys update through cascading foreign keys.
- Classifies all existing plastic entries under general `PLASTIC`, outside e-waste. Existing material descriptions are retained.
- Preserves the unlinked mixed-metal-casing catalog entry in `material_classification_review`; composition requires review before assigning a ferrous/non-ferrous category. No linked business record is discarded.
- Produces 61 active catalog entries, eight category-specific SQL views, 55 Hinglish alias entries, explicit recycler/material acceptance, and voice/WhatsApp material relationships.
- Adds a nullable unique Auth-user link to existing users. Does not fabricate Auth accounts for the nine legacy business identities.
- Enables RLS on all 23 application tables. Catalog/prices/safety content are readable; operational records remain accessible only through the trusted backend. Client-side user workflows require proper Auth identity linkage and scoped policies before opening access.
- Matching requires an accepted material, a dated rate, verified/non-expired recycler authorization, and applicable service area. It excludes unrelated buyers and does not substitute a fabricated zero rate.

New category tables use a shared normalized catalog. The eight `catalog_*` views provide separate category browsing without duplicating lots, prices, or recycler relationships.

No new market prices were invented from the PRD's illustrative rates. Existing price dates are preserved, so categories without fresh observations return no current rate.

## Files and apply sequence

`private/` is ignored by Git and contains application data. Do not publish it.

1. `private/source-snapshot.json`: source application records and schema metadata.
2. `private/bootstrap.sql`: source reconstruction with protected access.
3. `expand-categories.sql`: category changes, new entities, relationships and constraints.
4. `link-material-workflows.sql`: parent-family, safety, acceptance, alias and matching links.
5. `private/apply-transfer.sql`: the three SQL files combined into one transaction. Use this for the actual transfer into the verified empty destination.
6. `verify-transfer.py` and `verify-constraints.sql`: data reconciliation and behavioral checks.

Before applying, reconnect Supabase with destination write access, re-check destination identity/emptiness, and refresh the source snapshot if its data has changed. Apply the combined SQL using a trusted connection scoped to the destination. Do not apply it to the source. Schema creation intentionally fails on existing conflicting objects rather than overwriting them.

After applying, run verification against the destination and run Supabase security/performance advisors. Do not switch application URLs or publishable keys until those checks pass. Application environment changes, provider settings and deployment are pending; no existing frontend was redirected.

## Verification completed

Tested on an isolated local PostgreSQL 18 server with PostGIS and minimal Supabase role/Auth/Storage schema stubs. Cloud projects run PostgreSQL 17; cloud verification remains required.

- All 105 source records reconciled, including the preserved review entry.
- 17 source tables copied; 61 active catalog entries; eight groups; nine e-waste parents.
- All 38 foreign keys validated.
- Negative prices, invalid material references, e-waste/plastic mixing, general-scrap EPR hints, incomplete message material keys and duplicate provider message IDs rejected.
- Anonymous catalog/price reads succeeded; anonymous user/transaction reads and catalog writes were denied.
- Existing matching function executes with the revised eligibility logic.

The source cloud project has not been changed. The destination cloud project has not been changed.
