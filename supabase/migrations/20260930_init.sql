-- =========================================================
-- OFONITECH AI ACADEMY - DATABASE SCHEMA FOR SUPABASE
-- Run this in Supabase Dashboard -> SQL Editor (or via GitHub Migrations)
-- =========================================================

-- 1. Create Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    program_id VARCHAR(50) NOT NULL,
    program_title VARCHAR(255) NOT NULL,
    learning_mode VARCHAR(50) NOT NULL,
    tuition_amount NUMERIC NOT NULL,
    payment_option VARCHAR(50) DEFAULT 'Full Payment',
    promo_code VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Pending Payment Confirmation',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous inserts from the academy website (Students enrolling & submitting inquiries)
CREATE POLICY "Allow public insert into enrollments" 
ON public.enrollments 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow public insert into contact_inquiries" 
ON public.contact_inquiries 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- 5. Read policies restricted to service_role or authenticated admins
CREATE POLICY "Admins can view all enrollments" 
ON public.enrollments 
FOR SELECT 
TO service_role 
USING (true);

CREATE POLICY "Admins can view all inquiries" 
ON public.contact_inquiries 
FOR SELECT 
TO service_role 
USING (true);
