/**
 * 请求生成海报
 * @param {Object} productData - 产品数据
 * @returns {Promise<Object>} 生成的海报数据
 */
export const generatePosterRequest = async (productData) => {
  try {
    const response = await fetch('/api/generate-poster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      throw new Error(`生成海报失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('生成海报请求出错:', error);
    throw error;
  }
};
