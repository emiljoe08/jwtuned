import { useEffect, useState } from 'react'
import jwLogo from './assets/jwlogo.svg'

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
        width: 'clamp(90px, 12vmin, 160px)', height: 'clamp(90px, 12vmin, 160px)', borderRadius: 'clamp(24px, 3.5vmin, 48px)',
        background: 'rgba(255,255,255,0.1)',
        border: '1.5px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 'clamp(24px, 4vmin, 40px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)', overflow: 'hidden'
      }}>
        <img src={jwLogo} alt="JW Tuned Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '15%' }} />
      </div>

      {/* Brand */}
      <div style={{ color: '#fff', fontSize: 'clamp(32px, 5vmin, 64px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 'clamp(4px, 1vmin, 12px)' }}>
        JW Tuned
      </div>
      <div style={{ color: '#93C5FD', fontSize: 'clamp(14px, 2.2vmin, 26px)', marginBottom: 'clamp(48px, 8vmin, 90px)' }}>
        Garage Management System
      </div>

      {/* Progress bar */}
      <div style={{ width: 'clamp(200px, 30vmin, 500px)', height: 'clamp(4px, 0.6vmin, 10px)', background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 'clamp(12px, 2vmin, 24px)' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #60A5FA, #34D399)',
          width: `${progress}%`,
          transition: 'width 0.35s ease'
        }} />
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(12px, 1.8vmin, 22px)' }}>
        {progress < 100 ? 'Loading...' : 'Ready!'}
      </div>

    </div>
  )
}