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

// 可选：在开发环境下，验证连接
if (import.meta.env.DEV) {
  (async function checkConnection() {
    try {
      const { data, error } = await supabase.from('generations').select('count', { count: 'exact' }).limit(0);
      
      if (error) {
        console.error('Supabase连接错误:', error);
      } else {
        console.log('Supabase连接成功');
      }
    } catch (err) {
      console.error('检查Supabase连接时发生错误:', err);
    }
  })();
}
