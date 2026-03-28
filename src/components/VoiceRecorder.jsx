import React, { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Trash2, CheckCircle2 } from 'lucide-react'

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone access is not supported by your browser.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob)
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const deleteRecording = () => {
    setAudioURL(null)
    setRecordingTime(0)
    if (onRecordingComplete) {
      onRecordingComplete(null)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px', marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mic size={16} color={isRecording ? '#ef4444' : '#10b981'} />
          {isRecording ? "Recording Voice Note..." : "Voice Note (Optional)"}
        </h4>
        {isRecording && (
          <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      {!audioURL ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          {!isRecording ? (
            <button 
              type="button" 
              onClick={startRecording}
              className="btn btn-primary"
              style={{ background: '#10b981', borderColor: '#059669', gap: 10, borderRadius: 50, padding: '12px 24px' }}
            >
              <Mic size={20} /> Start Recording
            </button>
          ) : (
            <button 
              type="button" 
              onClick={stopRecording}
              className="btn btn-primary"
              style={{ background: '#ef4444', borderColor: '#b91c1c', gap: 10, borderRadius: 50, padding: '12px 24px' }}
            >
              <Square size={20} /> Stop Recording
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 12 }}>
            <audio src={audioURL} controls style={{ flex: 1, height: 40 }} />
            <button 
              type="button" 
              onClick={deleteRecording}
              style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: 10, borderRadius: 10, cursor: 'pointer' }}
              title="Delete and Re-record"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Ready to send!
          </div>
        </div>
      )}
      
      <p style={{ margin: '12px 0 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        Click to record a brief explanation of your case.
      </p>
    </div>
  )
}
