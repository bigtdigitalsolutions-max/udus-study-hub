CREATE TABLE public.handouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code TEXT NOT NULL,
  course_title TEXT,
  level TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.handouts TO anon;
GRANT SELECT ON public.handouts TO authenticated;
GRANT ALL ON public.handouts TO service_role;
ALTER TABLE public.handouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Handouts are publicly listable" ON public.handouts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.observations TO anon;
GRANT INSERT ON public.observations TO authenticated;
GRANT ALL ON public.observations TO service_role;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an observation" ON public.observations FOR INSERT TO anon, authenticated WITH CHECK (true);