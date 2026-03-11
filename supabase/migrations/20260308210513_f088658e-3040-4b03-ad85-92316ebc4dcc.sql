
-- Create storage bucket for uploaded clothing images (public so n8n can access the URL)
INSERT INTO storage.buckets (id, name, public) VALUES ('clothing-images', 'clothing-images', true);

-- Allow anyone to upload to clothing-images bucket
CREATE POLICY "Anyone can upload clothing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clothing-images');

-- Allow public read access
CREATE POLICY "Public read access for clothing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'clothing-images');
