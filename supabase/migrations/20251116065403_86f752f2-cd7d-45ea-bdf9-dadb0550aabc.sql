-- Add photo_url columns to enrollees and dependants tables
ALTER TABLE public.enrollees ADD COLUMN photo_url TEXT;
ALTER TABLE public.dependants ADD COLUMN photo_url TEXT;

-- Create storage bucket for enrollee photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('enrollee-photos', 'enrollee-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for enrollee-photos bucket
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'enrollee-photos');

CREATE POLICY "Authenticated users can update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'enrollee-photos');

CREATE POLICY "Authenticated users can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'enrollee-photos');

CREATE POLICY "Public can view photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'enrollee-photos');