import React, { useState, useRef, useEffect } from 'react';
import { Send, Thermometer, TreePalm, Stethoscope, AlertTriangle, CheckCircle, ArrowLeft, Mic, RefreshCw } from 'lucide-react';
import { diagnoseCrop } from '../lib/aiHelpers';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CropDoctor() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([
    { role: 'doctor', text: 'Namaste! I am your AI Crop Doctor. Describe the problems you see on your plant (e.g., "Yellow leaves on my wheat crop") or upload a photo of the symptoms.' }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const diagResponse = await diagnoseCrop(userMsg);
      setResult(diagResponse);
      const docMsg = `I've analyzed your description. Based on the symptoms, the likely condition is: **${diagResponse.diagnosis}**. (Confidence: ${diagResponse.confidence}%).`;
      setHistory(prev => [...prev, { role: 'doctor', text: docMsg, data: diagResponse }]);
    } catch (err) {
      toast.error('Could not complete diagnosis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Navigation / Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button 
            onClick={() => navigate('/farmer')}
            style={{ 
              background: 'white', border: '1px solid var(--slate-200)', 
              padding: 10, borderRadius: '50%', cursor: 'pointer', color: 'var(--slate-600)' 
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>AI Crop Doctor</h1>
            <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem' }}>Instant disease diagnosis and treatment suggestions</p>
          </div>
        </div>

        {/* Chat Interface */}
        <div 
          className="card" 
          style={{ 
            height: '600px', display: 'flex', flexDirection: 'column', 
            background: 'white', borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: 'none', position: 'relative', overflow: 'hidden'
          }}
        >
          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {history.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ 
                  padding: '16px 20px', 
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: msg.role === 'user' ? 'var(--green-600)' : 'var(--slate-100)',
                  color: msg.role === 'user' ? 'white' : 'var(--slate-900)',
                  fontSize: '0.95rem', lineHeight: 1.5,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                }}>
                  {msg.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}

                  {msg.data && (
                    <div style={{ 
                      marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)',
                      display: 'flex', flexDirection: 'column', gap: 12
                    }}>
                      <div style={{ fontWeight: 800, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Stethoscope size={16} /> Recommended Actions:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {msg.data.remedies.map((rem, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.85rem' }}>
                            <CheckCircle size={14} color="var(--green-600)" style={{ marginTop: 4, flexShrink: 0 }} />
                            <span>{rem}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--slate-100)', padding: '12px 20px', borderRadius: '20px 20px 20px 4px' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div className="dot-bounce" style={{ animationDelay: '0s' }}>.</div>
                  <div className="dot-bounce" style={{ animationDelay: '0.2s' }}>.</div>
                  <div className="dot-bounce" style={{ animationDelay: '0.4s' }}>.</div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSubmit}
            style={{ 
              padding: '20px', borderTop: '1px solid var(--slate-100)', 
              display: 'flex', gap: 12, alignItems: 'center' 
            }}
          >
            <input 
              type="text" 
              placeholder="Type your crop problem here..." 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={loading}
              style={{ 
                flex: 1, padding: '14px 20px', borderRadius: 12, border: '1px solid var(--slate-200)',
                background: '#f8fafc', fontSize: '0.95rem', outline: 'none'
              }}
            />
            <button 
              type="submit" 
              disabled={loading || !inputText.trim()}
              style={{ 
                width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--green-600)', color: 'white', border: 'none', cursor: 'pointer',
                opacity: loading || !inputText.trim() ? 0.6 : 1
              }}
            >
              <Send size={20} />
            </button>
          </form>
        </div>

        {/* Feature Hints */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
          <div style={{ background: 'white', padding: '16px', borderRadius: 16, display: 'flex', gap: 12 }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Avoid spraying pesticides in heavy wind or rain. Check Weather Widget.
            </div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: 16, display: 'flex', gap: 12 }}>
            <TreePalm size={20} color="var(--green-600)" />
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Identify 20+ crop diseases using our AI vision-based model.
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .dot-bounce { font-weight: 800; font-size: 1.5rem; animation: bounce 1s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
}
