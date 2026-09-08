BEGIN;
SET LOCAL search_path=public,extensions;
DO $$ BEGIN
 BEGIN
  INSERT INTO material_categories(parent_code,parent_name,sub_code,sub_name,group_code) VALUES ('PLASTIC','Bad','invalid','Bad','E_WASTE');
  RAISE EXCEPTION 'FAIL: plastic accepted within e-waste';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  INSERT INTO price_history(parent_code,sub_code,price_per_kg) VALUES ('PAPER','newspaper',-1);
  RAISE EXCEPTION 'FAIL: negative rate accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  INSERT INTO price_history(parent_code,sub_code,price_per_kg) VALUES ('PAPER','missing',1);
  RAISE EXCEPTION 'FAIL: missing material accepted';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 BEGIN
  INSERT INTO material_categories(parent_code,parent_name,sub_code,sub_name,group_code,epr_schedule1_hint) VALUES ('PAPER','Paper','invalid','Bad','PAPER','invalid');
  RAISE EXCEPTION 'FAIL: general scrap EPR accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  INSERT INTO whatsapp_messages(provider_message_id,sender_hash,message_type,parent_code) VALUES ('test-invalid',repeat('a',64),'text','PAPER');
  RAISE EXCEPTION 'FAIL: incomplete material pair accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 INSERT INTO whatsapp_messages(provider_message_id,sender_hash,message_type) VALUES ('test-idempotency',repeat('a',64),'text');
 BEGIN
  INSERT INTO whatsapp_messages(provider_message_id,sender_hash,message_type) VALUES ('test-idempotency',repeat('a',64),'text');
  RAISE EXCEPTION 'FAIL: duplicate provider message accepted';
 EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;
SET LOCAL ROLE anon;
SELECT count(*) FROM public.catalog_e_waste;
SELECT count(*) FROM public.catalog_paper;
SELECT count(*) FROM public.price_board;
DO $$ BEGIN
 BEGIN
  PERFORM * FROM public.users;
  RAISE EXCEPTION 'FAIL: anonymous access to users';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM * FROM public.transactions;
  RAISE EXCEPTION 'FAIL: anonymous access to transactions';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.material_groups VALUES ('BAD','Bad');
  RAISE EXCEPTION 'FAIL: anonymous catalog writes';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
