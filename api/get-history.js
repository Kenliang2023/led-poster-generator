import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端（使用服务角色密钥）
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 获取历史记录的Serverless函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export default async function handler(req, res) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 从Supabase获取历史记录
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`获取历史记录失败: ${error.message}`);
    }

    return res.status(200).json({ items: data });
  } catch (error) {
    console.error('获取历史记录错误:', error);
    return res.status(500).json({ error: '获取历史记录失败', details: error.message });
  }
}
