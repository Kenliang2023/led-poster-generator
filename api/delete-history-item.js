import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端（使用服务角色密钥）- 修正环境变量访问方式
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 删除历史记录的Serverless函数
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
  
  // 只允许DELETE请求
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('缺少必要的环境变量');
      return res.status(500).json({ error: '服务器配置错误 - 缺少环境变量' });
    }
    
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: '缺少记录ID' });
    }

    // 首先获取要删除的记录信息
    const { data: record, error: fetchError } = await supabase
      .from('generations')
      .select('product_image_url, generated_poster_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`获取记录信息失败: ${fetchError.message}`);
    }

    // 从数据库中删除记录
    const { error: deleteError } = await supabase
      .from('generations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`删除记录失败: ${deleteError.message}`);
    }

    // 可选：从Storage中删除相关文件
    // 注意：这里假设URL结构包含存储路径，需要根据实际情况调整
    try {
      if (record.generated_poster_url) {
        const posterPath = extractPathFromUrl(record.generated_poster_url);
        if (posterPath) {
          await supabase.storage
            .from('generated-posters')
            .remove([posterPath]);
        }
      }
    } catch (storageError) {
      console.error('删除存储文件失败:', storageError);
      // 继续执行，不因存储删除失败而中断整个流程
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('删除历史记录错误:', error);
    return res.status(500).json({ error: '删除历史记录失败', details: error.message });
  }
}

/**
 * 从Supabase URL中提取存储路径
 * @param {string} url - Supabase存储URL
 * @returns {string|null} 提取的路径或null
 */
function extractPathFromUrl(url) {
  try {
    if (!url) return null;
    
    // 这里的实现取决于具体的URL结构
    // 假设URL结构为: https://<bucket>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // 跳过/storage/v1/object/public/<bucket>/部分
    const bucketIndex = pathParts.indexOf('public') + 2;
    if (bucketIndex < pathParts.length) {
      return pathParts.slice(bucketIndex).join('/');
    }
    
    return null;
  } catch (error) {
    console.error('提取路径失败:', error);
    return null;
  }
}
