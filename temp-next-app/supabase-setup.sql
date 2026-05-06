-- Run this SQL in your Supabase SQL Editor to set up the profiles table and trigger

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'customer'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- quote_requests table RLS policies
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Add new columns if they don't exist
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;

DROP POLICY IF EXISTS "Anyone can view all quote requests" ON public.quote_requests;
CREATE POLICY "Anyone can view all quote requests"
  ON public.quote_requests FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own quote requests" ON public.quote_requests;
CREATE POLICY "Users can insert their own quote requests"
  ON public.quote_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own quote requests" ON public.quote_requests;
CREATE POLICY "Authenticated users can update quote requests"
  ON public.quote_requests FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create quote-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-files', 'quote-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for quote-files bucket
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'quote-files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'quote-files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'quote-files'
    AND auth.role() = 'authenticated'
  );
