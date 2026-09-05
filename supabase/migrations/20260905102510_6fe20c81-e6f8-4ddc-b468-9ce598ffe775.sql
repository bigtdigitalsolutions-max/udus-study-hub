ALTER TABLE public.handouts ADD COLUMN department TEXT;
GRANT SELECT ON public.handouts TO anon;
GRANT SELECT ON public.handouts TO authenticated;
GRANT ALL ON public.handouts TO service_role;