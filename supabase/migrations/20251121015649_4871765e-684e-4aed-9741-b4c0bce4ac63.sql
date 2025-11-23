-- Make enrollee-photos bucket private for better security
UPDATE storage.buckets 
SET public = false 
WHERE id = 'enrollee-photos';

-- Update RLS policies for enrollee-photos bucket to ensure authenticated access only
CREATE POLICY "Authenticated users can view their own enrollee photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'enrollee-photos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can upload enrollee photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'enrollee-photos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update enrollee photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'enrollee-photos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete enrollee photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'enrollee-photos' AND
  auth.uid() IS NOT NULL
);