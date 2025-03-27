import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * 上传图片到Supabase Storage
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<string>} - 返回上传后的图片URL
 */
export const uploadImage = async (file) => {
  try {
    // 生成唯一文件名
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // 上传到Supabase
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        contentType: file.type, // 设置正确的内容类型
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('图片上传错误详情:', error);
      throw new Error('图片上传失败: ' + error.message);
    }
    
    // 获取公共URL
    const { data: publicUrl } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
      
    if (!publicUrl || !publicUrl.publicUrl) {
      throw new Error('无法获取上传图片的公共URL');
    }
    
    return publicUrl.publicUrl;
  } catch (error) {
    console.error('上传服务错误:', error);
    throw error;
  }
};
