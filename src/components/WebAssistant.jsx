import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, Sparkles, User, HelpCircle } from 'lucide-react'
import { getWebAssistantResponse } from '../lib/aiHelpers'

export default function WebAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()
  const chatEndRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Welcome message when opening or changing page
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          id: 'welcome', 
          type: 'bot', 
          text: "Hi! I'm your AgriSmart Assistant. I can help you understand what you can do on this page or answer any questions about the mission. How can I help today?" 
        }
      ])
    }
  }, [location.pathname])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userMessage }])
    setIsLoading(true)

    try {
      const response = await getWebAssistantResponse(userMessage, location.pathname)
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: response }])
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "I'm having a little trouble connecting. Please try again in a moment." }])
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    { label: "What can I do here?", query: "What can I do on this page?" },
    { label: "About AgriSmart", query: "What is the Digital Agriculture Mission?" },
    { label: "How to Apply?", query: "How do I apply for schemes?" },
  ]

  return (
    <div className="web-assistant-container" style={{ position: 'fixed', top: '84px', right: '32px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--green-600), var(--green-800))',
          color: 'white',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <HelpCircle size={30} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#34d399',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '2px solid white'
            }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20, transformOrigin: 'top right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="chat-window"
            style={{
              width: '380px',
              height: '550px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15), var(--shadow-glow)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, var(--green-700), var(--green-900))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <Bot size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>AgriSmart AI</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', opacity: 0.8 }}>
                    <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }}></span>
                    Always here to help
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', color: 'white', opacity: 0.7 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ 
                  alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.65rem', 
                    fontWeight: '600',
                    color: 'var(--slate-500)',
                    flexDirection: msg.type === 'user' ? 'row-reverse' : 'row'
                  }}>
                    {msg.type === 'user' ? <User size={10} /> : <Sparkles size={10} color="var(--green-600)" />}
                    {msg.type === 'user' ? 'You' : 'AgriSmart AI'}
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: msg.type === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    background: msg.type === 'user' ? 'var(--green-600)' : 'white',
                    color: msg.type === 'user' ? 'white' : 'var(--slate-800)',
                    fontSize: '0.88rem',
                    boxShadow: msg.type === 'user' ? '0 4px 12px rgba(5,150,105,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                    border: msg.type === 'user' ? 'none' : '1px solid var(--slate-100)',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px' }}>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', background: 'var(--green-400)', borderRadius: '50%' }}></motion.div>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', background: 'var(--green-400)', borderRadius: '50%' }}></motion.div>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', background: 'var(--green-400)', borderRadius: '50%' }}></motion.div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Actions */}
            <div style={{ padding: '0 20px 10px', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap', scrolbarWidth: 'none' }}>
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(action.query)
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '99px',
                    background: 'var(--green-50)',
                    color: 'var(--green-700)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid var(--green-200)',
                    cursor: 'pointer'
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--slate-100)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid var(--slate-200)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--green-600)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition)'
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
