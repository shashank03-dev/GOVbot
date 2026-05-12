-- GOVbot Supabase Schema
-- Run this in the Supabase SQL Editor to recreate all tables from scratch.
-- Generated 2026-05-11 from code inspection.
--
-- OTP fix note:
-- If /auth/send-otp logs PGRST205 or says otp_rate_limits / otp_codes is
-- missing, run the otp_codes and otp_rate_limits CREATE TABLE blocks below in
-- the Supabase SQL Editor, then restart the backend so PostgREST refreshes its
-- schema cache.

-- ------------------------------------------------------------
-- 1. sessions — per-phone FSM state
-- ------------------------------------------------------------
create table if not exists sessions (
    phone        text primary key,
    state        text        not null default 'greeting',
    collected_data jsonb     not null default '{}',
    updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. applications — submitted scholarship applications
-- ------------------------------------------------------------
create table if not exists applications (
    id                  uuid        primary key default gen_random_uuid(),
    phone               text        not null,
    confirmation_number text        not null unique,
    service             text        not null,
    status              text        not null default 'submitted',
    portal              text        not null default 'nsp',
    timeline_steps      jsonb       not null default '[]',
    submitted_at        timestamptz not null default now()
);
create index if not exists applications_phone_idx on applications(phone);

-- ------------------------------------------------------------
-- 3. otp_codes — one-time passwords (stored hashed)
-- ------------------------------------------------------------
create table if not exists otp_codes (
    id          uuid        primary key default gen_random_uuid(),
    phone       text        not null,
    code        text        not null,   -- SHA-256 hex digest
    expires_at  timestamptz not null,
    used        boolean     not null default false
);
create index if not exists otp_codes_phone_idx on otp_codes(phone);

-- ------------------------------------------------------------
-- 4. eligibility_checks — screener audit log
-- ------------------------------------------------------------
create table if not exists eligibility_checks (
    id          uuid        primary key default gen_random_uuid(),
    income      integer     not null,
    caste       text        not null,
    course_level text       not null,
    marks_pct   numeric(5,2) not null,
    eligible    boolean     not null,
    schemes     text[]      not null default '{}',
    reasons     text[]      not null default '{}',
    created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. ocr_extractions — Aadhaar OCR results
--    NOTE: field_map stores extracted fields; aadhaar_number
--    is masked to last-4 digits before insert (PII mitigation).
-- ------------------------------------------------------------
create table if not exists ocr_extractions (
    id          uuid        primary key default gen_random_uuid(),
    session_id  text,
    phone       text,
    raw_text    text,
    field_map   jsonb       not null default '{}',
    confidence  numeric(4,3) not null default 0
);
create index if not exists ocr_extractions_phone_idx on ocr_extractions(phone);

-- ------------------------------------------------------------
-- 6. document_checks — doc validity results
-- ------------------------------------------------------------
create table if not exists document_checks (
    id          uuid        primary key default gen_random_uuid(),
    session_id  text,
    phone       text,
    doc_type    text        not null,
    issue_date  date,
    expiry_date date,
    valid       boolean     not null default false,
    flags       text[]      not null default '{}'
);
create index if not exists document_checks_phone_idx on document_checks(phone);

-- ------------------------------------------------------------
-- 7. live_sessions — real-time form-fill progress
-- ------------------------------------------------------------
create table if not exists live_sessions (
    session_id  text        primary key,
    phone       text        not null,
    portal      text        not null default 'nsp',
    step        integer     not null default 1,
    total_steps integer     not null default 5,
    form_state  jsonb       not null default '{}',
    status      text        not null default 'in_progress',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
create index if not exists live_sessions_phone_idx on live_sessions(phone);

-- ------------------------------------------------------------
-- 8. renewal_reminders — upcoming scholarship renewal alerts
-- ------------------------------------------------------------
create table if not exists renewal_reminders (
    id                uuid        primary key default gen_random_uuid(),
    phone             text        not null,
    portal            text        not null,
    renewal_due_date  date        not null,
    sent_at           timestamptz,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now(),
    unique (phone, portal)
);
create index if not exists renewal_reminders_due_idx on renewal_reminders(renewal_due_date);

-- ------------------------------------------------------------
-- 10. otp_rate_limits — cross-worker OTP rate limiting
--     One row per phone. window_start resets when > 10 min old.
-- ------------------------------------------------------------
create table if not exists otp_rate_limits (
    phone         text        primary key,
    request_count integer     not null default 0,
    window_start  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 9. fraud_flags — duplicate-Aadhaar detection
--    aadhaar_hash is SHA-256 of the 12-digit Aadhaar number.
-- ------------------------------------------------------------
create table if not exists fraud_flags (
    id           uuid        primary key default gen_random_uuid(),
    aadhaar_hash text        not null unique,
    phones       text[]      not null default '{}',
    portal       text        not null default 'nsp',
    flagged_at   timestamptz not null default now()
);
create index if not exists fraud_flags_hash_idx on fraud_flags(aadhaar_hash);

-- ------------------------------------------------------------
-- 11. digilocker_consents — mock DigiLocker OAuth consent tracking
-- ------------------------------------------------------------
create table if not exists digilocker_consents (
    id               uuid        primary key default gen_random_uuid(),
    consent_id       text        not null unique,
    phone            text        not null references sessions(phone),
    status           text        not null default 'pending', -- pending, completed, rejected, expired
    scope            text[]      not null default '{}',
    redirect_url     text,
    documents_fetched integer     default 0,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    expires_at       timestamptz default (now() + interval '30 minutes')
);
create index if not exists digilocker_consents_phone_idx on digilocker_consents(phone);
create index if not exists digilocker_consents_status_idx on digilocker_consents(status);

-- ------------------------------------------------------------
-- 12. digilocker_docs — mock documents fetched from DigiLocker
-- ------------------------------------------------------------
create table if not exists digilocker_docs (
    id                uuid        primary key default gen_random_uuid(),
    consent_id        text        references digilocker_consents(consent_id),
    phone             text        not null references sessions(phone),
    doc_type          text        not null, -- aadhaar, income_certificate, caste_certificate
    name              text        not null,
    digilocker_uri    text        not null,
    size              integer,
    mime_type         text        default 'application/pdf',
    raw_data          text,       -- base64 encoded document (mock)
    extracted_data    jsonb       default '{}',
    fetched_at        timestamptz not null default now(),
    used_in_application boolean   default false
);
create index if not exists digilocker_docs_phone_idx on digilocker_docs(phone);
create index if not exists digilocker_docs_type_idx on digilocker_docs(doc_type);

-- ------------------------------------------------------------
-- 13. bank_verifications — NPCI bank account verification
-- ------------------------------------------------------------
create table if not exists bank_verifications (
    id                uuid        primary key default gen_random_uuid(),
    phone             text        not null references sessions(phone),
    account_hash      text        not null,  -- SHA256 of account number
    account_last4     text,       -- Last 4 digits for display
    ifsc_code         text        not null,
    status            text        not null default 'pending', -- pending, verified, failed
    verified          boolean     default false,
    beneficiary_name  text,
    account_status    text,
    mock_response     jsonb       default '{}',
    error_message     text,
    verified_at       timestamptz,
    attempted_at      timestamptz not null default now()
);
create index if not exists bank_verifications_phone_idx on bank_verifications(phone);
create index if not exists bank_verifications_status_idx on bank_verifications(status);

-- ------------------------------------------------------------
-- 14. disbursement_tracking — Scholarship disbursement status
-- ------------------------------------------------------------
create table if not exists disbursement_tracking (
    id                uuid        primary key default gen_random_uuid(),
    confirmation_number text      references applications(confirmation_number),
    phone             text        not null,
    amount            decimal(10, 2) not null,
    bank_verification_id uuid     references bank_verifications(id),
    npci_txn_id       text,
    status            text        not null default 'pending', -- pending, processing, credited, failed
    credited_at       timestamptz,
    notified          boolean     default false,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);
create index if not exists disbursement_tracking_phone_idx on disbursement_tracking(phone);
create index if not exists disbursement_tracking_status_idx on disbursement_tracking(status);
create index if not exists disbursement_tracking_confirmation_idx on disbursement_tracking(confirmation_number);

-- ------------------------------------------------------------
-- 15. verifiable_credentials — Blockchain W3C credentials
-- ------------------------------------------------------------
create table if not exists verifiable_credentials (
    id                uuid        primary key default gen_random_uuid(),
    credential_id     text        not null unique,
    confirmation_number text      not null,
    phone             text        not null references sessions(phone),
    blockchain_tx_hash text       not null,
    credential_hash   text        not null,
    ipfs_hash         text,
    credential_json   jsonb       not null,
    issued_at         timestamptz not null default now(),
    revoked           boolean     default false,
    revoked_at        timestamptz,
    revoke_reason     text
);
create index if not exists verifiable_credentials_phone_idx on verifiable_credentials(phone);
create index if not exists verifiable_credentials_confirmation_idx on verifiable_credentials(confirmation_number);
create index if not exists verifiable_credentials_tx_hash_idx on verifiable_credentials(blockchain_tx_hash);

-- ------------------------------------------------------------
-- 16. citizen_profiles — persistent citizen profile (source of truth for auto-fill)
-- ------------------------------------------------------------
create table if not exists citizen_profiles (
    phone             text        primary key,
    full_name         text,
    dob               date,
    gender            text,
    aadhaar_last4     text,
    address           text,
    state             text,
    district          text,
    pincode           text,
    income            integer,
    caste             text,        -- general / obc / sc / st / ews
    religion          text,
    course_level      text,
    institution       text,
    marks_pct         numeric(5,2),
    bank_account      text,
    bank_ifsc         text,
    bank_name         text,
    father_name       text,
    mother_name       text,
    email             text,
    digilocker_connected boolean  default false,
    profile_complete  boolean     default false,
    updated_at        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 17. form_fill_sessions — auto-fill history for any portal URL
-- ------------------------------------------------------------
create table if not exists form_fill_sessions (
    id              uuid        primary key default gen_random_uuid(),
    phone           text        not null,
    url             text        not null,
    field_map       jsonb       not null default '{}',
    filled_count    integer     not null default 0,
    missing_fields  text[]      not null default '{}',
    screenshot_path text,
    status          text        not null default 'pending', -- pending, filled, failed
    created_at      timestamptz not null default now()
);
create index if not exists form_fill_sessions_phone_idx on form_fill_sessions(phone);
