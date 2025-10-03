# AI智能聊天助手

一个基于React的智能聊天网页应用，支持OpenAI和Google Gemini API，采用Material Design 3设计风格。

## 功能特点

- 🤖 **多API支持**：支持OpenAI和Google Gemini两种AI提供商
- 🔧 **自定义API地址**：可配置自定义API端点，支持第三方API代理
- 💬 **实时聊天界面**：流畅的对话体验
- 🎨 **Material Design 3**：采用最新的MD3设计系统
- ⚙️ **灵活配置**：可配置API Key、模型和API地址
- 🌙 **深色模式支持**：自动适配系统主题
- 📱 **响应式布局**：完美适配移动端和桌面端
- 💾 **本地存储**：API配置安全存储在浏览器本地

## 使用方法

### 1. 配置API

打开应用后，点击右上角的设置按钮：

1. **选择API提供商**：在下拉菜单中选择"OpenAI"或"Google Gemini"
2. **配置API地址**（可选）：
   - OpenAI默认：`https://api.openai.com/v1`
   - Google默认：`https://generativelanguage.googleapis.com/v1beta`
   - 可以修改为自定义的API代理地址
3. **输入API Key**：输入您的API密钥
4. **选择模型**：根据需要选择合适的AI模型
5. **保存设置**：点击"保存设置"按钮

### 2. 开始对话

配置完成后，在输入框中输入您的问题，按Enter键或点击发送按钮开始对话。

## 支持的API提供商

### OpenAI
- **模型选项**：
  - GPT-3.5 Turbo
  - GPT-4
  - GPT-4 Turbo
  - GPT-4o
- **API格式**：兼容OpenAI Chat Completions API

### Google Gemini
- **模型选项**：
  - Gemini Pro
  - Gemini 1.5 Pro
  - Gemini 1.5 Flash
- **API格式**：使用Google Generative AI API

## 自定义API地址

本应用支持使用自定义API地址，这对以下场景特别有用：

- 使用API代理服务
- 使用兼容OpenAI格式的第三方API
- 在企业内网环境中使用自建API服务

只需在设置中修改"API地址"字段为您的自定义端点即可。

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build
```

## 技术栈

- **前端框架**：React 18
- **构建工具**：Vite
- **样式系统**：Tailwind CSS + Material Design 3
- **UI组件**：shadcn/ui
- **图标库**：Lucide Icons
- **API集成**：OpenAI API、Google Generative AI API

## 设计系统

本应用采用Google的Material Design 3 (MD3)设计系统，包括：

- **颜色系统**：Primary、Secondary、Tertiary色调
- **表面层级**：多层次的Surface Container
- **圆角设计**：统一的圆角半径
- **阴影系统**：MD3 Elevation
- **动画效果**：流畅的过渡和微交互

## 隐私与安全

- ✅ API Key存储在浏览器本地存储中，不会上传到任何服务器
- ✅ 所有API调用直接从浏览器发送到AI提供商
- ✅ 不记录任何对话内容
- ⚠️ 请妥善保管您的API Key，不要分享给他人

## 注意事项

- 需要有效的OpenAI API Key或Google API Key才能使用
- API调用费用由您的API提供商账户承担
- 建议在生产环境中使用HTTPS协议
- 某些API代理可能需要额外的认证配置

## License

MIT

## 贡献

欢迎提交Issue和Pull Request！

## 支持

如有问题或建议，请在GitHub上提交Issue。
