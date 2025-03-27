/**
 * 获取海报生成历史记录
 * @returns {Promise<Array>} 历史记录数组
 */
export const fetchHistory = async () => {
  try {
    const response = await fetch('/api/get-history');
    
    if (!response.ok) {
      throw new Error(`获取历史记录失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('获取历史记录出错:', error);
    throw error;
  }
};

/**
 * 删除海报历史记录
 * @param {string} id - 要删除的记录ID
 * @returns {Promise<Object>} 删除操作结果
 */
export const deleteHistory = async (id) => {
  try {
    const response = await fetch(`/api/delete-history-item?id=${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`删除历史记录失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('删除历史记录出错:', error);
    throw error;
  }
};
