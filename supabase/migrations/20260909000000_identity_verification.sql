-- Migration 6: Identity Verifications for Aadhaar Flow
SET search_path = public, extensions;

CREATE TYPE public."identity_verification_status" AS ENUM (
    'NOT_STARTED',
    'PENDING',
    'VERIFIED',
    'FAILED',
    'CANCELLED',
    'EXPIRED'
);

CREATE TABLE IF NOT EXISTS public."identity_verifications" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" uuid REFERENCES public."users"("id") ON DELETE SET NULL,
    "provider" text NOT NULL DEFAULT 'mock',
    "provider_verification_id" text NOT NULL,
    "status" public."identity_verification_status" DEFAULT 'PENDING' NOT NULL,
    "masked_identifier" text,
    "consent_given_at" timestamp with time zone DEFAULT now() NOT NULL,
    "verified_at" timestamp with time zone,
    "failure_reason_code" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indices for rapid lookup by verification reference
CREATE INDEX IF NOT EXISTS "idx_identity_verifications_prov_id" 
    ON public."identity_verifications"("provider_verification_id");

CREATE INDEX IF NOT EXISTS "idx_identity_verifications_user_id" 
    ON public."identity_verifications"("user_id");

-- Security: RLS enabled with service_role access only
ALTER TABLE public."identity_verifications" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."identity_verifications" FROM anon, authenticated;
GRANT ALL ON public."identity_verifications" TO service_role;
