import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Send, Bot, User, Loader2, Trash2, Settings } from 'lucide-react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // API Provider settings
  const [apiProvider, setApiProvider] = useState(localStorage.getItem('api_provider') || 'openai')
  
  // OpenAI settings
  const [openaiApiKey, setOpenaiApiKey] = useState(localStorage.getItem('openai_api_key') || '')
  const [openaiModel, setOpenaiModel] = useState(localStorage.getItem('openai_model') || 'gpt-3.5-turbo')
  
  // Google settings
  const [googleApiKey, setGoogleApiKey] = useState(localStorage.getItem('google_api_key') || '')
  const [googleModel, setGoogleModel] = useState(localStorage.getItem('google_model') || 'gemini-pro')
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // 检查是否有API Key，如果没有则显示设置
    if (!openaiApiKey && !googleApiKey) {
      setShowSettings(true)
    }
  }, [])

  const handleSaveSettings = () => {
    localStorage.setItem('api_provider', apiProvider)
    localStorage.setItem('openai_api_key', openaiApiKey)
    localStorage.setItem('openai_model', openaiModel)
    localStorage.setItem('google_api_key', googleApiKey)
    localStorage.setItem('google_model', googleModel)
    setShowSettings(false)
  }

  const callOpenAI = async (userMessage) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: [...messages, userMessage],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || '请求失败')
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  const callGoogle = async (userMessage) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userMessage.content
          }]
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || '请求失败')
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    // 检查当前选择的API是否配置了Key
    if (apiProvider === 'openai' && !openaiApiKey) {
      alert('请先在设置中配置OpenAI API Key')
      setShowSettings(true)
      return
    }
    
    if (apiProvider === 'google' && !googleApiKey) {
      alert('请先在设置中配置Google API Key')
      setShowSettings(true)
      return
    }

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      let assistantContent
      
      if (apiProvider === 'openai') {
        assistantContent = await callOpenAI(userMessage)
      } else if (apiProvider === 'google') {
        assistantContent = await callGoogle(userMessage)
      }
      
      const assistantMessage = {
        role: 'assistant',
        content: assistantContent
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `错误: ${error.message}。请检查您的API Key是否正确。`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const getProviderName = () => {
    return apiProvider === 'openai' ? 'OpenAI' : 'Google Gemini'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI智能聊天助手</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">当前使用: {getProviderName()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={clearChat}
              className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">设置</h2>
            <div className="space-y-4">
              {/* API Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API提供商
                </label>
                <select
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="openai">OpenAI</option>
                  <option value="google">Google Gemini</option>
                </select>
              </div>

              {/* OpenAI Settings */}
              {apiProvider === 'openai' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      OpenAI模型
                    </label>
                    <select
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                      <option value="gpt-4o">GPT-4o</option>
                    </select>
                  </div>
                </>
              )}

              {/* Google Settings */}
              {apiProvider === 'google' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Google API Key
                    </label>
                    <input
                      type="password"
                      value={googleApiKey}
                      onChange={(e) => setGoogleApiKey(e.target.value)}
                      placeholder="AIza..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Google模型
                    </label>
                    <select
                      value={googleModel}
                      onChange={(e) => setGoogleModel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    >
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    </select>
                  </div>
                </>
              )}

              <Button
                onClick={handleSaveSettings}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                保存设置
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Messages */}
          <div className="h-[calc(100vh-280px)] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 animate-pulse">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  开始对话
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  我是你的AI助手，支持OpenAI和Google Gemini两种API。可以帮你解答问题、提供建议、进行创作等。请在下方输入你的问题开始对话。
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  } animate-fade-in`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div
                    className={`flex-1 px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    } shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息... (Shift+Enter换行)"
                rows="1"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all max-h-32"
                style={{ minHeight: '48px' }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
