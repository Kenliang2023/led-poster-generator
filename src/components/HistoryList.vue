<template>
  <div class="history-list-container">
    <div v-if="historyItems.length === 0" class="empty-history">
      <p>暂无历史记录</p>
    </div>
    
    <div v-else class="history-items">
      <div
        v-for="item in historyItems"
        :key="item.id"
        class="history-item"
        @click="selectItem(item)"
      >
        <div class="poster-thumbnail">
          <img :src="item.generated_poster_url" alt="历史海报" />
        </div>
        <div class="item-info">
          <p class="item-name">{{ item.product_name || '未命名海报' }}</p>
          <p class="item-date">{{ formatDate(item.created_at) }}</p>
        </div>
        <div class="item-actions">
          <el-tooltip content="下载海报" placement="top">
            <el-button
              size="small"
              circle
              @click.stop="downloadPoster(item)"
              icon="Download"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
              size="small"
              circle
              type="danger"
              @click.stop="confirmDelete(item)"
              icon="Delete"
            ></el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';

// Props
const props = defineProps({
  historyItems: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['select-item', 'delete-item']);

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 选择项目
const selectItem = (item) => {
  emit('select-item', item);
};

// 下载海报
const downloadPoster = (item) => {
  // 创建一个隐形的a标签来触发下载
  const a = document.createElement('a');
  a.href = item.generated_poster_url;
  a.download = `LED海报_${item.product_name || '未命名'}_${new Date().getTime()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 确认删除
const confirmDelete = (item) => {
  ElMessageBox.confirm(
    '确定要删除这个历史记录吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('delete-item', item.id);
  }).catch(() => {
    // 用户取消删除
  });
};
</script>

<style scoped>
.history-list-container {
  width: 100%;
  height: 100%;
}

.empty-history {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

.history-items {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  height: 100%;
}

.history-items::-webkit-scrollbar {
  height: 6px;
}

.history-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.history-items::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.history-items::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.history-item {
  flex: 0 0 auto;
  width: 150px;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f5f7fa;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.poster-thumbnail {
  height: 70%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.poster-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  padding: 4px 8px;
  height: 30%;
}

.item-name {
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-date {
  font-size: 10px;
  color: #909399;
  margin: 4px 0 0 0;
}

.item-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: none;
  gap: 4px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 2px;
}

.history-item:hover .item-actions {
  display: flex;
}
</style>
