import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端（使用服务角色密钥）- 修正环境变量访问方式
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 获取历史记录的Serverless函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('缺少必要的环境变量');
      return res.status(500).json({ error: '服务器配置错误 - 缺少环境变量' });
    }
    
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
