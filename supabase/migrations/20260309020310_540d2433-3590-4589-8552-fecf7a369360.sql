ALTER TABLE public.contacts ADD COLUMN links text[] DEFAULT '{}';
ALTER TABLE public.contacts ADD COLUMN foto_urls text[] DEFAULT '{}';