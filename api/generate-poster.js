import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// 初始化Supabase客户端 - 修正环境变量访问方式
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 初始化Google Generative AI
const geminiApiKey = process.env.LLM_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApiKey);
const modelName = process.env.LLM_MODEL || 'gemini-2.0-flash-exp';

/**
 * 生成产品海报的Serverless函数
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
  
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      console.error('缺少必要的环境变量');
      return res.status(500).json({ error: '服务器配置错误 - 缺少环境变量' });
    }

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
    console.log("产品图片URL:", productImageUrl);

    // 调用Gemini API生成海报
    const posterData = await generatePosterWithGemini(prompt, productImageUrl);
    
    // 保存到Supabase
    const { data: savedData, error: saveError } = await saveToDatabase({
      productName,
      productFeatures,
      productCategory,
      productScene,
      sceneDescription,
      productImageUrl,
      generatedPrompt: prompt,
      generatedPosterUrl: posterData.posterUrl
    });

    if (saveError) {
      console.error('保存到数据库失败:', saveError);
      // 继续执行，不因保存失败而中断整个流程
    }

    // 返回结果
    return res.status(200).json({
      success: true,
      posterUrl: posterData.posterUrl,
      prompt: prompt,
      id: savedData?.id
    });
  } catch (error) {
    console.error('生成海报失败:', error);
    return res.status(500).json({ error: '生成海报失败', details: error.message });
  }
}

/**
 * 构建LLM提示词
 */
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

/**
 * 调用Gemini API生成海报
 */
async function generatePosterWithGemini(prompt, imageUrl) {
  try {
    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('获取图片请求超时')), 30000)
    );
    
    // 获取图片作为二进制数据
    let imageData;
    try {
      const imageResponsePromise = fetch(imageUrl);
      const imageResponse = await Promise.race([imageResponsePromise, timeoutPromise]);
      const imageBuffer = await imageResponse.arrayBuffer();
      imageData = Buffer.from(imageBuffer);
    } catch (imageError) {
      console.error('获取图片失败:', imageError);
      throw new Error('无法获取产品图片: ' + imageError.message);
    }

    // 使用Google Generative AI SDK
    const model = genAI.getGenerativeModel({ model: modelName });

    // 将图片转换为FileObject格式
    const imageFileObject = {
      data: imageData,
      mimeType: "image/jpeg" // 假设是JPEG，可能需要根据实际情况调整
    };

    // 添加API请求重试逻辑
    const MAX_RETRIES = 2;
    let retries = 0;
    let result;
    
    while (retries <= MAX_RETRIES) {
      try {
        // 准备请求
        result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                { inlineData: imageFileObject }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
            responseModalities: ["TEXT", "IMAGE"]
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE
            }
          ]
        });
        
        // 如果请求成功，跳出重试循环
        break;
      } catch (apiError) {
        retries++;
        console.error(`API调用失败 (尝试 ${retries}/${MAX_RETRIES}):`, apiError);
        
        if (retries > MAX_RETRIES) {
          throw new Error('Gemini API多次调用失败: ' + apiError.message);
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    const response = await result.response;
    console.log("Gemini API响应:", response);

    // 从响应中提取生成的图像
    let generatedImageData = null;
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
            generatedImageData = {
              data: Buffer.from(part.inlineData.data, 'base64'),
              mimeType: part.inlineData.mimeType
            };
            break;
          }
        }
      }
    }

    // 如果生成了图像，上传到Supabase Storage
    let posterUrl = '';
    if (generatedImageData) {
      const fileExt = generatedImageData.mimeType.split('/')[1] || 'png';
      const fileName = `poster_${Date.now()}.${fileExt}`;
      
      // 上传到Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('generated-posters')
        .upload(fileName, generatedImageData.data, {
          contentType: generatedImageData.mimeType,
          cacheControl: '3600'
        });
        
      if (uploadError) {
        console.error('上传生成的海报失败:', uploadError);
        throw new Error('上传生成的海报失败: ' + uploadError.message);
      } else {
        // 获取公共URL
        const { data: publicUrlData } = supabase
          .storage
          .from('generated-posters')
          .getPublicUrl(fileName);
          
        posterUrl = publicUrlData.publicUrl;
      }
    } else {
      console.warn('Gemini API没有返回图像');
      // 开发测试时，如果没有生成图像，使用原始图片
      posterUrl = imageUrl;
    }

    return { posterUrl };
  } catch (error) {
    console.error('Gemini API调用失败:', error);
    // 开发测试时，如果API调用失败，返回原始图片
    return { posterUrl: imageUrl };
  }
}

/**
 * 保存生成记录到Supabase数据库
 */
async function saveToDatabase(data) {
  try {
    const {
      productName,
      productFeatures,
      productCategory,
      productScene,
      sceneDescription,
      productImageUrl,
      generatedPrompt,
      generatedPosterUrl
    } = data;

    // 插入数据到generations表
    return await supabase
      .from('generations')
      .insert({
        product_name: productName,
        product_features: productFeatures,
        product_category: productCategory,
        product_scene: `${productScene || ''}${productScene && sceneDescription ? ' - ' : ''}${sceneDescription || ''}`,
        product_image_url: productImageUrl,
        generated_prompt: generatedPrompt,
        generated_poster_url: generatedPosterUrl,
        created_at: new Date().toISOString()
      })
      .select();
  } catch (error) {
    console.error('保存到数据库失败:', error);
    throw error;
  }
}
