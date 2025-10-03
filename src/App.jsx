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
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState(localStorage.getItem('openai_base_url') || 'https://api.openai.com/v1')
  
  // Google settings
  const [googleApiKey, setGoogleApiKey] = useState(localStorage.getItem('google_api_key') || '')
  const [googleModel, setGoogleModel] = useState(localStorage.getItem('google_model') || 'gemini-pro')
  const [googleBaseUrl, setGoogleBaseUrl] = useState(localStorage.getItem('google_base_url') || 'https://generativelanguage.googleapis.com/v1beta')
  
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
    localStorage.setItem('openai_base_url', openaiBaseUrl)
    localStorage.setItem('google_api_key', googleApiKey)
    localStorage.setItem('google_model', googleModel)
    localStorage.setItem('google_base_url', googleBaseUrl)
    setShowSettings(false)
  }

  const callOpenAI = async (userMessage) => {
    const response = await fetch(`${openaiBaseUrl}/chat/completions`, {
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
    const response = await fetch(`${googleBaseUrl}/models/${googleModel}:generateContent?key=${googleApiKey}`, {
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
        content: `错误: ${error.message}。请检查您的API配置是否正确。`
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
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      {/* Header - MD3 Style */}
      <header className="border-b border-outline-variant dark:border-outline-variant-dark bg-surface-container dark:bg-surface-container-dark sticky top-0 z-10 elevation-1">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary dark:bg-primary-dark flex items-center justify-center">
              <Bot className="w-6 h-6 text-on-primary dark:text-on-primary-dark" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-on-surface dark:text-on-surface-dark">AI智能聊天助手</h1>
              <p className="text-xs text-on-surface-variant dark:text-on-surface-variant-dark">当前使用: {getProviderName()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={clearChat}
              className="rounded-full hover:bg-error-container dark:hover:bg-error-container-dark hover:text-error dark:hover:text-error-dark transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Panel - MD3 Style */}
      {showSettings && (
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="bg-surface-container-low dark:bg-surface-container-low-dark rounded-3xl shadow-md p-6 border border-outline-variant dark:border-outline-variant-dark">
            <h2 className="text-2xl font-medium mb-6 text-on-surface dark:text-on-surface-dark">设置</h2>
            <div className="space-y-5">
              {/* API Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-on-surface dark:text-on-surface-dark mb-2">
                  API提供商
                </label>
                <select
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                  className="w-full px-4 py-3 border border-outline dark:border-outline-dark rounded-xl bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent transition-all"
                >
                  <option value="openai">OpenAI</option>
                  <option value="google">Google Gemini</option>
                </select>
              </div>

              {/* OpenAI Settings */}
              {apiProvider === 'openai' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-on-surface dark:text-on-surface-dark mb-2">
                      OpenAI API地址
                    </label>
                    <input
                      type="text"
                      value={openaiBaseUrl}
                      onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                      placeholder="https://api.openai.com/v1"
                      className="w-full px-4 py-3 border border-outline dark:border-outline-dark rounded-xl bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface dark:text-on-surface-dark mb-2">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 border border-outline dark:border-outline-dark rounded-xl bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface dark:text-on-surface-dark mb-2">
                      OpenAI模型
                    </label>
                    <select
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      className="w-full px-4 py-3 border border-outline dark:border-outline-dark rounded-xl bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent transition-all"
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
                    <label className="block text-sm font-medium text-on-surface dark:text-on-surface-dark mb-2">
                      Google API地址
                    </label>
                    <input
                      type="text"
                      value={googleBaseUrl}
                      onChange={(e) => setGoogleBaseUrl(e.target.value)}
                      placeholder="https://generativelanguage.googleapis.com/v1beta"
                      className="w-full px-4 py-3 border border-outline dark:border-outline-dark rounded-xl bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface dark:text-on-surface-dark mb-2">
                      Google API Key
                    </label>
                    <input
                      type="password"
                      value={googleApiKey}
                      onChange={(e) => setGoogleApiKey(e.target.value)}
                      placeholder="AIza..."
                      className="w-full px-4 py-3 border border-outline dark:border-outline-dark rounded-xl bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface dark:text-on-surface-dark mb-2">
                      Google模型
                    </label>
                    <select
                      value={googleModel}
                      onChange={(e) => setGoogleModel(e.target.value)}
                      className="w-full px-4 py-3 border border-outline dark:border-outline-dark rounded-xl bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent transition-all"
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
                className="w-full bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90 rounded-full py-3 font-medium transition-all elevation-1 hover:elevation-2"
              >
                保存设置
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container - MD3 Style */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-surface-container-lowest dark:bg-surface-container-lowest-dark rounded-3xl shadow-md border border-outline-variant dark:border-outline-variant-dark overflow-hidden">
          {/* Messages */}
          <div className="h-[calc(100vh-280px)] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary-container dark:bg-primary-container-dark flex items-center justify-center mb-6 animate-pulse">
                  <Bot className="w-12 h-12 text-on-primary-container dark:text-on-primary-container-dark" />
                </div>
                <h2 className="text-3xl font-medium text-on-surface dark:text-on-surface-dark mb-3">
                  开始对话
                </h2>
                <p className="text-on-surface-variant dark:text-on-surface-variant-dark max-w-md leading-relaxed">
                  我是你的AI助手，支持OpenAI和Google Gemini两种API，并可自定义API地址。可以帮你解答问题、提供建议、进行创作等。请在下方输入你的问题开始对话。
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-tertiary-container dark:bg-tertiary-container-dark'
                        : 'bg-secondary-container dark:bg-secondary-container-dark'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-on-tertiary-container dark:text-on-tertiary-container-dark" />
                    ) : (
                      <Bot className="w-5 h-5 text-on-secondary-container dark:text-on-secondary-container-dark" />
                    )}
                  </div>
                  <div
                    className={`flex-1 px-5 py-4 rounded-3xl ${
                      message.role === 'user'
                        ? 'bg-primary-container dark:bg-primary-container-dark text-on-primary-container dark:text-on-primary-container-dark'
                        : 'bg-surface-container-high dark:bg-surface-container-high-dark text-on-surface dark:text-on-surface-dark'
                    } shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-secondary-container dark:bg-secondary-container-dark flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-on-secondary-container dark:text-on-secondary-container-dark" />
                </div>
                <div className="flex-1 px-5 py-4 rounded-3xl bg-surface-container-high dark:bg-surface-container-high-dark">
                  <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant dark:text-on-surface-variant-dark" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - MD3 Style */}
          <div className="border-t border-outline-variant dark:border-outline-variant-dark p-4 bg-surface-container dark:bg-surface-container-dark">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息... (Shift+Enter换行)"
                rows="1"
                className="flex-1 px-5 py-3 border border-outline dark:border-outline-dark rounded-full resize-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark transition-all max-h-32"
                style={{ minHeight: '48px' }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all elevation-1 hover:elevation-2"
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
