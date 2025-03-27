import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * 上传图片到Supabase Storage
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<string>} - 返回上传后的图片URL
 */
export const uploadImage = async (file) => {
  try {
    // 验证文件类型和大小
    const isJpgOrPng = ['image/jpeg', 'image/png'].includes(file.type);
    if (!isJpgOrPng) {
      throw new Error('只能上传JPG或PNG格式的图片');
    }
    
    const fileSizeInMB = file.size / 1024 / 1024;
    if (fileSizeInMB > 5) {
      throw new Error('图片大小不能超过5MB');
    }
    
    // 生成唯一文件名
    const fileExt = file.name.split('.').pop().toLowerCase();
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
      
      // 根据错误类型提供更具体的错误消息
      if (error.message.includes('storage bucket not found')) {
        throw new Error('存储桶配置错误，请联系管理员');
      } else if (error.message.includes('permission')) {
        throw new Error('没有权限上传文件，请检查存储桶权限配置');
      } else {
        throw new Error('图片上传失败: ' + error.message);
      }
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
    // 重新抛出错误，以便UI层可以显示正确的错误信息
    throw error;
  }
};
