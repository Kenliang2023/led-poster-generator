-- Supabase数据库初始化脚本

-- 创建generations表
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  product_name TEXT NOT NULL,
  product_features TEXT,
  product_category TEXT,
  product_scene TEXT,
  product_image_url TEXT NOT NULL,
  generated_prompt TEXT NOT NULL,
  generated_poster_url TEXT NOT NULL
);

-- 设置RLS (行级安全策略)
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 创建Storage Buckets
-- 产品图片存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 生成的海报存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-posters', 'generated-posters', true)
ON CONFLICT (id) DO NOTHING;

-- 设置Storage策略
-- 产品图片: 所有用户可读，认证用户可写
CREATE POLICY "产品图片公开访问"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "认证用户可上传产品图片"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- 生成的海报: 所有用户可读，只有服务器端函数可写
CREATE POLICY "生成海报公开访问"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-posters');

CREATE POLICY "服务器端函数可上传生成的海报"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-posters'
    AND auth.role() = 'service_role'
  );
