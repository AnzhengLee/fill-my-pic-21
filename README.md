# 医疗信息识别系统

基于AI技术的医疗文档智能识别与信息提取系统，能够自动识别医疗图片并填写结构化医疗信息记录表。

## 功能特性

- 📷 **图片上传识别**: 支持上传医疗文档图片，自动识别提取信息
- 🤖 **AI智能填表**: 使用Dify API智能识别并自动填充表单字段
- 📋 **完整信息记录**: 支持基本信息、联系信息、入出院、诊断、病理等全方位记录
- 💾 **数据存储**: 基于Supabase的可靠数据存储
- 📱 **响应式设计**: 支持桌面端和移动端访问
- 🔍 **记录管理**: 查看、搜索和管理所有医疗记录

## 技术栈

- **前端框架**: React 18 + TypeScript + Vite
- **UI组件库**: shadcn/ui + Tailwind CSS
- **后端服务**: Supabase Edge Functions (Deno)
- **数据库**: Supabase PostgreSQL
- **AI服务**: Dify API集成
- **表单处理**: React Hook Form + Zod验证
- **状态管理**: TanStack Query
- **路由**: React Router

## 本地开发

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:8080

## 部署

### Supabase配置

1. 创建Supabase项目
2. 配置数据库表结构（参考 `supabase/migrations/`）
3. 部署Edge Functions
4. 配置环境变量（DIFY_API_KEY等）

### 前端部署

支持部署到：
- Vercel
- Netlify
- 其他静态托管平台

## 项目结构

```
src/
├── components/
│   ├── ui/              # shadcn/ui组件库
│   ├── ImageUploader.tsx    # 图片上传组件
│   └── InfoRecognitionForm.tsx  # 医疗信息表单
├── pages/
│   ├── Home.tsx         # 主页面
│   ├── RecordList.tsx   # 记录列表
│   └── NotFound.tsx     # 404页面
├── lib/
│   ├── supabase.ts      # Supabase客户端
│   └── utils.ts         # 工具函数
└── hooks/               # 自定义Hooks
supabase/
├── functions/
│   └── image-recognition/   # AI识别服务
└── migrations/          # 数据库迁移
```

## 主要功能

### 图片识别流程

1. 用户上传医疗文档图片
2. 调用Supabase Edge Function处理图片
3. 集成Dify API进行智能识别
4. 返回结构化数据并自动填充表单
5. 用户确认后保存到数据库

### 表单字段

支持识别和填写以下信息：
- 基本信息：姓名、性别、年龄、出生日期等
- 联系信息：地址、电话、联系人等
- 入出院信息：入院时间、科室、病房等
- 诊断信息：主要诊断、其他诊断、疾病编码等
- 病理信息：血型、过敏史、病理诊断等
- 医务人员：主治医师、住院医师等

## 开发指南

### 添加新的识别字段

1. 更新 `InfoRecognitionForm.tsx` 中的表单schema
2. 修改 `supabase/functions/image-recognition/index.ts` 中的映射逻辑
3. 更新数据库表结构（如需要）

### 自定义UI组件

基于shadcn/ui组件库，支持完全自定义：
- 修改 `src/index.css` 中的设计系统变量
- 更新 `tailwind.config.ts` 中的主题配置
- 使用语义化的颜色token

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 支持

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至项目维护者