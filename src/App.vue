<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="logo-container">
        <img src="./assets/logo.svg" alt="Logo" class="logo" />
        <div class="divider">|</div>
        <h1 class="app-title">LED灯带产品海报生成</h1>
      </div>
      <div class="nav-links">
        <a href="#" class="nav-link active">首页</a>
        <a href="#" class="nav-link">创建海报</a>
        <a href="#" class="nav-link">历史记录</a>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧产品信息输入区 -->
      <section class="product-info-section">
        <ProductInfoForm 
          @generate-poster="generatePoster"
          :isLoading="isGenerating"
        />
      </section>

      <!-- 右侧结果显示区 -->
      <section class="result-section">
        <div class="poster-preview">
          <h2 class="section-title">生成结果</h2>
          <div class="poster-container" v-if="generatedPoster">
            <img :src="generatedPoster" alt="生成的海报" class="poster-image" />
          </div>
          <div class="placeholder-container" v-else>
            <p>海报显示区域</p>
          </div>
        </div>

        <!-- 历史记录区域 -->
        <div class="history-section">
          <h3>历史记录</h3>
          <div class="history-slider">
            <HistoryList
              :historyItems="historyItems"
              @select-item="selectHistoryItem"
              @delete-item="deleteHistoryItem"
            />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProductInfoForm from './components/ProductInfoForm.vue';
import HistoryList from './components/HistoryList.vue';
import { fetchHistory, deleteHistory } from './services/historyService';
import { generatePosterRequest } from './services/posterService';

// 状态变量
const isGenerating = ref(false);
const generatedPoster = ref(null);
const generatedPrompt = ref('');
const historyItems = ref([]);

// 获取历史记录
onMounted(async () => {
  try {
    historyItems.value = await fetchHistory();
  } catch (error) {
    console.error('获取历史记录失败:', error);
  }
});

// 生成海报
const generatePoster = async (productData) => {
  try {
    isGenerating.value = true;
    
    const result = await generatePosterRequest(productData);
    
    generatedPoster.value = result.posterUrl;
    generatedPrompt.value = result.prompt;
    
    // 更新历史记录
    historyItems.value = await fetchHistory();
  } catch (error) {
    console.error('海报生成失败:', error);
  } finally {
    isGenerating.value = false;
  }
};

// 选择历史记录项
const selectHistoryItem = (item) => {
  generatedPoster.value = item.generated_poster_url;
  generatedPrompt.value = item.generated_prompt;
};

// 删除历史记录项
const deleteHistoryItem = async (id) => {
  try {
    await deleteHistory(id);
    historyItems.value = historyItems.value.filter(item => item.id !== id);
  } catch (error) {
    console.error('删除历史记录失败:', error);
  }
};
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 顶部导航栏 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #1677ff;
  color: white;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 36px;
  width: auto;
}

.divider {
  margin: 0 10px;
  font-size: 18px;
}

.app-title {
  font-size: 18px;
  font-weight: 500;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link.active,
.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

/* 主内容区 */
.main-content {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
}

/* 左侧产品信息区 */
.product-info-section {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-width: 400px;
}

/* 右侧结果区 */
.result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.poster-preview {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #333;
}

.poster-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.poster-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ddd;
  border-radius: 8px;
  color: #999;
  font-size: 18px;
}

/* 历史记录区域 */
.history-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 180px;
}

.history-section h3 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #333;
}

.history-slider {
  height: 110px;
  overflow: hidden;
}
</style>
