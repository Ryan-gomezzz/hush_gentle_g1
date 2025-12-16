-- ============================================
-- Supabase Storage Setup for Product Images
-- ============================================
-- This migration file documents the required Supabase Storage setup.
-- Run these commands in your Supabase SQL Editor or via Supabase CLI.
--
-- Note: Storage buckets must be created via Supabase Dashboard or CLI,
-- as they cannot be created via SQL migrations.
--
-- ============================================
-- STEP 1: Create Storage Bucket
-- ============================================
-- Go to Supabase Dashboard > Storage > Create Bucket
-- Bucket Name: product-images
-- Public: Yes (so images can be accessed via public URLs)
-- File Size Limit: 5242880 (5MB)
-- Allowed MIME Types: image/jpeg, image/png, image/gif, image/webp
--
-- OR use Supabase CLI:
-- supabase storage create product-images --public
--
-- ============================================
-- STEP 2: Set Storage Policies (RLS)
-- ============================================
-- These policies allow:
-- - Admins to upload/delete images
-- - Everyone to read/view images (public bucket)

-- Policy: Allow authenticated admins to upload files
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- Policy: Allow authenticated admins to delete files
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- Policy: Allow everyone to read/view images (public bucket)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- ============================================
-- ALTERNATIVE: If using service role (admin client)
-- ============================================
-- If you're using the admin client (createAdminClient) in the upload route,
-- the above policies are not strictly necessary as the service role
-- bypasses RLS. However, it's still good practice to have them for
-- additional security layers.

