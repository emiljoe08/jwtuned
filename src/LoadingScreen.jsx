import { useEffect, useState } from 'react'

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const steps = [20, 45, 70, 90, 100]
    let i = 0
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i])
        i++
      } else {
        clearInterval(interval)
        setTimeout(onDone, 400)
      }
    }, 350)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #185FA5 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>

      {/* Logo */}
      <div style={{
        width: 90, height: 90, borderRadius: 24,
        background: 'rgba(255,255,255,0.1)',
        border: '1.5px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 42, marginBottom: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        🔧
      </div>

      {/* Brand */}
      <div style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
        JW Tuned
      </div>
      <div style={{ color: '#93C5FD', fontSize: 14, marginBottom: 48 }}>
        Garage Management System
      </div>

      {/* Progress bar */}
      <div style={{ width: 200, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #60A5FA, #34D399)',
          width: `${progress}%`,
          transition: 'width 0.35s ease'
        }} />
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
        {progress < 100 ? 'Loading...' : 'Ready!'}
      </div>

    </div>
  )
}