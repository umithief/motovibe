import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { Button } from './Button';

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Merhaba şampiyon! Ben MotoVibe AI. Senin için en doğru ekipmanı bulmana yardım etmek için buradayım. Bana sürüş tarzından veya aradığın üründen bahset."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Prepare history for the API
    const history = messages.map(m => ({ role: m.role, text: m.text }));

    const responseText = await sendMessageToGemini(userMessage.text, history);

    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-moto-accent/20 flex items-center justify-center border border-moto-accent/30">
            <Sparkles className="w-5 h-5 text-moto-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">MotoVibe Asistan</h2>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Gemini Powered • Online
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-moto-accent" />}
            </div>
            
            <div 
              className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-moto-accent" />
             </div>
             <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700 flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Örn: Yağmurlu havada uzun yol için ne önerirsin?"
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-moto-accent focus:ring-1 focus:ring-moto-accent transition-all placeholder-gray-500"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-moto-accent text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-moto-accent transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-2 text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Yapay zeka hatalı bilgi verebilir. Sürüş güvenliği için her zaman kullanım kılavuzlarına uyun.
        </p>
      </div>
    </div>
  );
};