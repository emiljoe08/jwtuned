import { useEffect, useState } from 'react'
import jwLogo from './assets/jwlogo.svg'

export default function LoadingScreen({ onDone }) {
  const [step, setStep]         = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    'Starting engine...',
    'Loading job cards...',
    'Connecting to database...',
    'Syncing vehicles...',
    'Ready to roll.',
  ]

  useEffect(() => {
    const targets = [18, 40, 65, 85, 100]
    let i = 0
    const interval = setInterval(() => {
      if (i < targets.length) {
        setProgress(targets[i])
        setStep(i)
        i++
      } else {
        clearInterval(interval)
        setTimeout(onDone, 600)
      }
    }, 420)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0A0A0A',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      fontFamily: "'Barlow', 'Segoe UI', sans-serif",
      overflow: 'hidden',
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;700;800;900&display=swap');

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: #E8310A;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(232,49,10,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Large bg text */}
      <div style={{ position: 'absolute', bottom: '-4%', right: '-2%', fontSize: 'clamp(80px, 18vw, 200px)', fontWeight: 900, color: 'rgba(255,255,255,0.02)', letterSpacing: '-8px', userSelect: 'none', pointerEvents: 'none', lineHeight: 1 }}>
        TUNED
      </div>

      {/* Logo */}
      <img src={jwLogo} alt="JW Tuned" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 24 }} />

      {/* Brand */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#E8310A', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
        Staff Dashboard
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 48 }}>
        JW TUNED
      </div>

      {/* Progress bar */}
      <div style={{ width: 280, marginBottom: 16 }}>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #E8310A, #FF6B35)',
            borderRadius: 99,
            width: `${progress}%`,
            transition: 'width 0.42s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
      </div>

      {/* Step text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 24 }}>
        {progress < 100
          ? <div className="spinner" />
          : <span style={{ color: '#22C55E', fontSize: 16 }}>✓</span>
        }
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>
          {steps[step]}
        </span>
      </div>

    </div>
  )
}