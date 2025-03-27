import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少Supabase环境变量。请确保在.env.local文件中设置VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY。');
}

// 创建客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    fetch: (...args) => fetch(...args)
  }
});

// 检查存储桶是否已设置
const checkStorageBuckets = async () => {
  try {
    // 检查product-images存储桶
    const { data: bucketExists, error } = await supabase.storage.getBucket('product-images');
    
    if (error) {
      if (error.message.includes('not found')) {
        console.error('存储桶 "product-images" 不存在，请在Supabase中创建');
      } else {
        console.error('检查存储桶时出错:', error);
      }
    } else {
      console.log('存储桶 "product-images" 存在');
    }
    
    // 检查generated-posters存储桶
    const { data: posterBucketExists, error: posterError } = await supabase.storage.getBucket('generated-posters');
    
    if (posterError) {
      if (posterError.message.includes('not found')) {
        console.error('存储桶 "generated-posters" 不存在，请在Supabase中创建');
      } else {
        console.error('检查存储桶时出错:', posterError);
      }
    } else {
      console.log('存储桶 "generated-posters" 存在');
    }
  } catch (err) {
    console.error('检查存储桶时发生错误:', err);
  }
};

// 验证数据库表是否存在
const checkDatabaseTables = async () => {
  try {
    const { data, error } = await supabase.from('generations').select('count', { count: 'exact' }).limit(0);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('数据表 "generations" 不存在，请运行数据库迁移脚本');
      } else {
        console.error('检查数据表时出错:', error);
      }
    } else {
      console.log('数据表 "generations" 存在');
    }
  } catch (err) {
    console.error('检查数据表时发生错误:', err);
  }
};

// 在开发环境下，验证连接
if (import.meta.env.DEV) {
  (async function checkConnection() {
    try {
      // 检查数据库连接
      const { data, error } = await supabase.from('generations').select('count', { count: 'exact' }).limit(0);
      
      if (error) {
        console.error('Supabase连接错误:', error);
      } else {
        console.log('Supabase连接成功');
        
        // 如果连接成功，检查存储桶和数据表
        await checkStorageBuckets();
        await checkDatabaseTables();
      }
    } catch (err) {
      console.error('检查Supabase连接时发生错误:', err);
    }
  })();
}
