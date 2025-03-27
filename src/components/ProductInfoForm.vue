<template>
  <div class="product-form">
    <h2 class="form-title">产品信息</h2>
    
    <!-- 产品名称 -->
    <div class="form-section">
      <h3 class="section-title">产品名称</h3>
      <el-input v-model="productName" placeholder="LED灯带"></el-input>
      
      <div class="tag-group">
        <el-tag
          v-for="tag in productTags"
          :key="tag"
          class="product-tag"
          @click="selectProductTag(tag)"
          :effect="selectedTags.includes(tag) ? 'dark' : 'plain'"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
    
    <!-- 产品特点 -->
    <div class="form-section">
      <h3 class="section-title">产品特点</h3>
      <el-input
        v-model="productFeatures"
        type="textarea"
        :rows="4"
        placeholder="高亮度、高效、高性价比..."
      ></el-input>
    </div>
    
    <!-- 产品使用场景 -->
    <div class="form-section">
      <h3 class="section-title">产品使用场景</h3>
      <div class="scene-selection">
        <el-select v-model="productScene" placeholder="工程项目">
          <el-option
            v-for="scene in sceneOptions"
            :key="scene.value"
            :label="scene.label"
            :value="scene.value"
          ></el-option>
        </el-select>
        
        <el-select v-model="sceneDetail" placeholder="场景">
          <el-option
            v-for="detail in sceneDetailOptions"
            :key="detail.value"
            :label="detail.label"
            :value="detail.value"
          ></el-option>
        </el-select>
      </div>
    </div>
    
    <!-- 使用场景详细描述 -->
    <div class="form-section">
      <h3 class="section-title">使用场景详细描述</h3>
      <el-input
        v-model="sceneDescription"
        type="textarea"
        :rows="4"
        placeholder="客厅吊顶照明等..."
      ></el-input>
    </div>
    
    <!-- 产品图片 -->
    <div class="form-section">
      <h3 class="section-title">产品图片</h3>
      <el-upload
        class="image-uploader"
        :http-request="customUpload"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :class="{ 'image-uploaded': imageUrl }"
      >
        <img v-if="imageUrl" :src="imageUrl" class="uploaded-image" />
        <div v-else class="upload-placeholder">
          <div class="upload-icon">+</div>
          <div class="upload-text">
            <div>拖拽图片到此处，或</div>
            <el-button type="primary" size="small">点击上传</el-button>
          </div>
          <div class="upload-hint">
            建议上传产品主图，JPEG/PNG格式，小于5MB
          </div>
        </div>
      </el-upload>
    </div>
    
    <!-- 生成按钮 -->
    <div class="form-actions">
      <el-button @click="resetForm" plain>重置</el-button>
      <el-button 
        type="primary" 
        @click="submitForm" 
        :loading="isLoading"
      >
        生成海报
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { uploadImage } from '../services/uploadService';

// Props
const props = defineProps({
  isLoading: Boolean
});

// Emits
const emit = defineEmits(['generate-poster']);

// 表单数据
const productName = ref('LED灯带');
const productFeatures = ref('');
const productScene = ref('');
const sceneDetail = ref('');
const sceneDescription = ref('');
const imageUrl = ref('');
const imageFile = ref(null);

// 标签选择
const selectedTags = ref([]);
const productTags = ['灯带', '吸顶灯', '厂家定制照明'];

// 场景选项
const sceneOptions = [
  { value: 'project', label: '工程项目' },
  { value: 'home', label: '家装' },
  { value: 'commercial', label: '商业' },
  { value: 'outdoor', label: '户外' }
];

// 场景详细选项 (基于选择的场景动态变化)
const sceneDetailOptions = computed(() => {
  switch (productScene.value) {
    case 'project':
      return [
        { value: 'hotel', label: '酒店' },
        { value: 'office', label: '办公室' },
        { value: 'mall', label: '商场' }
      ];
    case 'home':
      return [
        { value: 'living_room', label: '客厅' },
        { value: 'bedroom', label: '卧室' },
        { value: 'kitchen', label: '厨房' }
      ];
    case 'commercial':
      return [
        { value: 'shop', label: '商店' },
        { value: 'restaurant', label: '餐厅' },
        { value: 'entertainment', label: '娱乐场所' }
      ];
    case 'outdoor':
      return [
        { value: 'garden', label: '花园' },
        { value: 'street', label: '街道' },
        { value: 'facade', label: '建筑外墙' }
      ];
    default:
      return [];
  }
});

// 选择产品标签
const selectProductTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag);
  } else {
    selectedTags.value.push(tag);
    
    // 更新产品名称
    if (productName.value === 'LED灯带' && tag !== '灯带') {
      productName.value = 'LED' + tag;
    }
  }
};

// 图片上传前验证
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isJpgOrPng) {
    alert('只能上传JPG或PNG格式的图片!');
    return false;
  }
  
  if (!isLt5M) {
    alert('图片大小不能超过5MB!');
    return false;
  }
  
  imageFile.value = file;
  return true;
};

// 自定义上传处理
const customUpload = async (options) => {
  try {
    const file = options.file;
    const url = await uploadImage(file);
    imageUrl.value = url;
  } catch (error) {
    console.error('上传失败:', error);
    alert('图片上传失败，请重试');
  }
};

// 重置表单
const resetForm = () => {
  productName.value = 'LED灯带';
  productFeatures.value = '';
  productScene.value = '';
  sceneDetail.value = '';
  sceneDescription.value = '';
  imageUrl.value = '';
  imageFile.value = null;
  selectedTags.value = [];
};

// 提交表单
const submitForm = () => {
  if (!imageUrl.value) {
    alert('请上传产品图片');
    return;
  }
  
  const formData = {
    productName: productName.value,
    productFeatures: productFeatures.value,
    productCategory: selectedTags.value.join(','),
    productScene: productScene.value,
    sceneDetail: sceneDetail.value,
    sceneDescription: sceneDescription.value,
    productImageUrl: imageUrl.value
  };
  
  emit('generate-poster', formData);
};
</script>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.form-section {
  margin-bottom: 15px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #1677ff;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.product-tag {
  cursor: pointer;
  font-size: 12px;
}

.scene-selection {
  display: flex;
  gap: 10px;
}

.scene-selection .el-select {
  width: 50%;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.image-uploader.image-uploaded {
  border: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;
  text-align: center;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 10px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.upload-hint {
  color: #909399;
  font-size: 12px;
}

.uploaded-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
</style>
