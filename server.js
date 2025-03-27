const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 初始化Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 获取历史记录API
app.get('/api/get-history', async (req, res) => {
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
});

// 删除历史记录API
app.delete('/api/delete-history-item', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: '缺少记录ID' });
    }

    // 从数据库中删除记录
    const { error: deleteError } = await supabase
      .from('generations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`删除记录失败: ${deleteError.message}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('删除历史记录错误:', error);
    return res.status(500).json({ error: '删除历史记录失败', details: error.message });
  }
});

// 生成海报API
app.post('/api/generate-poster', async (req, res) => {
  try {
    const {
      productName,
      productFeatures,
      productCategory,
      productScene,
      sceneDetail,
      sceneDescription,
      productImageUrl
    } = req.body;

    // 验证必要的参数
    if (!productName || !productImageUrl) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 构建提示词
    const prompt = buildPrompt({
      productName,
      productFeatures,
      productCategory,
      productScene,
      sceneDetail,
      sceneDescription,
      productImageUrl
    });

    console.log("生成提示词:", prompt);
    
    // 模拟图像生成
    // 在本地开发环境，我们直接返回原图，省略实际的API调用
    const posterUrl = productImageUrl;
    
    // 保存到Supabase
    const { data: savedData, error: saveError } = await supabase
      .from('generations')
      .insert({
        product_name: productName,
        product_features: productFeatures,
        product_category: productCategory,
        product_scene: `${productScene || ''}${productScene && sceneDescription ? ' - ' : ''}${sceneDescription || ''}`,
        product_image_url: productImageUrl,
        generated_prompt: prompt,
        generated_poster_url: posterUrl,
        created_at: new Date().toISOString()
      })
      .select();

    if (saveError) {
      console.error('保存到数据库失败:', saveError);
    }

    // 返回结果
    return res.status(200).json({
      success: true,
      posterUrl: posterUrl,
      prompt: prompt,
      id: savedData?.[0]?.id
    });
  } catch (error) {
    console.error('生成海报失败:', error);
    return res.status(500).json({ error: '生成海报失败', details: error.message });
  }
});

// 从API文件复制的辅助函数
function buildPrompt(data) {
  const {
    productName,
    productFeatures,
    productCategory,
    productScene,
    sceneDetail,
    sceneDescription
  } = data;

  // 将特点拆分为数组
  const features = productFeatures
    ? productFeatures.split(/[,，、\n]+/).filter(Boolean)
    : [];

  // 构建场景描述
  let sceneText = '';
  if (productScene) {
    sceneText += productScene;
    if (sceneDetail) {
      sceneText += `/${sceneDetail}`;
    }
  }

  // 完整提示词模板
  return `
请为以下LED灯带产品设计一张专业营销海报。在设计海报时使用图像生成能力:

产品名称: ${productName}
产品类别: ${productCategory || ''}
${features.length > 0 ? `产品特点:
${features.map(f => `- ${f}`).join('\n')}` : ''}
${sceneText ? `使用场景: ${sceneText}` : ''}
${sceneDescription ? `场景描述: ${sceneDescription}` : ''}

海报要求:
- 现代专业的设计风格
- 突出产品特点和优势
- 包含产品名称和简洁标语
- 搭配合适的应用场景
- 高质量的图像分辨率
- 比例为9:16的竖版海报

请生成一张高质量的LED灯带产品营销海报图片。
`.trim();
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`本地API服务器运行在: http://localhost:${PORT}`);
});
