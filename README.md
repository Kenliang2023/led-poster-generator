# LED灯带产品海报生成应用

基于Vue 3 + Vite构建的LED灯带产品海报自动生成工具，通过多模态LLM API将产品图片转换为专业营销海报。

## 功能特点

- **一键生成**：上传产品图片，输入关键特点，自动生成专业营销海报
- **多场景适配**：支持选择不同应用场景，生成针对性海报
- **实时预览**：即时查看生成的海报效果
- **提示词透明**：显示发送给LLM的完整提示词内容
- **历史管理**：便捷查看、下载和删除历史生成记录

## 技术架构

- **前端**：Vue 3 + Vite，部署在Vercel
- **后端**：Vercel Serverless Functions (Node.js)
- **数据存储**：Supabase (PostgreSQL数据库 + Storage)

## 快速开始

### 本地开发

```bash
# 克隆仓库
git clone <repository-url>

# 进入项目目录
cd poster

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 环境变量配置

在项目根目录创建`.env.local`文件并配置以下环境变量：

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
LLM_API_KEY=<your-llm-api-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

## 部署

本项目配置为使用Vercel进行部署：

1. 在Vercel上导入GitHub仓库
2. 配置环境变量
3. 部署应用

## 项目结构

```
/
├── public/             # 静态资源
├── src/                # 前端源代码
│   ├── assets/         # 资源文件
│   ├── components/     # Vue组件
│   ├── composables/    # 可复用的组合式函数
│   ├── services/       # API服务
│   ├── App.vue         # 主应用组件
│   └── main.js         # 应用入口
├── api/                # Vercel Serverless Functions
│   ├── generate-poster.js  # 海报生成API
│   ├── get-history.js      # 获取历史记录API
│   └── delete-history-item.js  # 删除历史记录API
└── ...
```

## 许可证

[MIT](LICENSE)
