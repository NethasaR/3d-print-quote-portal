-- Run this SQL in your Supabase SQL Editor to create the quote_requests table

CREATE TABLE public.quote_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_title TEXT NOT NULL,
  description TEXT NOT NULL,
  material TEXT,
  color TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  deadline DATE,
  delivery_method TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quote requests"
  ON public.quote_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quote requests"
  ON public.quote_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quote requests"
  ON public.quote_requests FOR UPDATE
  USING (auth.uid() = user_id);
