# AI智能聊天助手

一个基于React和OpenAI API的智能聊天网页应用。

## 功能特点

- 🤖 支持OpenAI GPT模型对话
- 💬 实时聊天界面
- ⚙️ 可配置API Key和模型选择
- 🎨 现代化UI设计，支持深色模式
- 📱 响应式布局，适配移动端
- 💾 本地存储API配置

## 使用方法

1. 打开应用后，点击右上角的设置按钮
2. 输入您的OpenAI API Key
3. 选择想要使用的模型（GPT-3.5 Turbo、GPT-4等）
4. 点击"保存设置"
5. 在输入框中输入您的问题，开始对话

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

- React 18
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- OpenAI API

## 注意事项

- 需要有效的OpenAI API Key才能使用
- API Key存储在浏览器本地存储中
- 请妥善保管您的API Key，不要分享给他人

## License

MIT
