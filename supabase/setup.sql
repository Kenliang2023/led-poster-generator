-- SQL脚本：设置Supabase项目

-- 设置RLS
ALTER DATABASE postgres SET "anon".jwt_secret TO 'super-secret-jwt-token-with-at-least-32-characters';

-- 创建generations表
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  product_features TEXT,
  product_category TEXT,
  product_scene TEXT,
  product_image_url TEXT NOT NULL,
  generated_prompt TEXT NOT NULL,
  generated_poster_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建存储桶 (如果通过UI创建了，可以忽略这部分)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('product-images', 'product-images', true, 52428800),
  ('generated-posters', 'generated-posters', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- 存储桶访问策略
-- 允许任何人读取product-images
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- 允许任何人上传到product-images
CREATE POLICY "product_images_public_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- 允许任何人读取generated-posters
CREATE POLICY "generated_posters_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-posters');

-- 允许任何人上传到generated-posters
CREATE POLICY "generated_posters_public_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated-posters');

-- 允许任何人删除generated-posters中的文件
CREATE POLICY "generated_posters_public_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'generated-posters');
