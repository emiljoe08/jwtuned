import { useState } from 'react'
import jwLogo from './assets/jjw.svg'

/**
 * Component rendering the Staff Portal login screen.
 * @returns {JSX.Element} The login screen component.
 */
export default function LoginScreen({ onLogin, onBack, error }) {
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [shaking, setShaking]   = useState(false)

  /**
   * Handles the login form submission and applies a shake effect on incorrect attempts.
   * @param {Event} e - The form submission event.
   */
  async function handleSubmit(e) {
    e.preventDefault()
    if (password.trim() === '') return
    const success = await onLogin(password)
    if (!success) {
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Barlow', 'Segoe UI', sans-serif",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&display=swap');
        h1, h2, h3, h4, h5, h6 { color: inherit; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        .shake { animation: shake 0.45s ease; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeIn 0.5s ease forwards; }

        .pass-input {
          width: 100%;
          height: 52px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-family: inherit;
          font-size: 16px;
          padding: 0 48px 0 16px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          letter-spacing: 0.1em;
        }
        .pass-input:focus {
          border-color: #E8310A;
          background: rgba(232,49,10,0.05);
        }
        .pass-input.error-input {
          border-color: #EF4444;
          background: rgba(239,68,68,0.05);
        }
        .login-btn {
          width: 100%; height: 52px;
          background: #E8310A; color: #fff;
          border: none; border-radius: 8px;
          font-family: inherit; font-size: 15px; font-weight: 800;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .login-btn:hover { background: #FF3D0D; transform: translateY(-1px); }
        .login-btn:active { transform: translateY(0); }
        .login-btn:disabled { background: #333; cursor: not-allowed; transform: none; }

        .back-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.35);
          font-family: inherit; font-size: 13px;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: color 0.2s; padding: 0;
        }
        .back-btn:hover { color: rgba(255,255,255,0.7); }
      `}</style>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,49,10,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Large bg text */}
      <div style={{ position: 'absolute', bottom: '-4%', right: '-2%', fontSize: 'clamp(80px, 18vw, 200px)', fontWeight: 900, color: 'rgba(255,255,255,0.02)', letterSpacing: '-8px', userSelect: 'none', pointerEvents: 'none', lineHeight: 1 }}>
        STAFF
      </div>

      {/* Back button */}
      <div style={{ padding: '20px 5%' }}>
        <button className="back-btn" onClick={onBack}>
          ← Back to site
        </button>
      </div>

      {/* Login card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 24px' }}>
        <div className={`login-card${shaking ? ' shake' : ''}`} style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo + title */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <img src={jwLogo} alt="JW Tuned" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 20 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#E8310A', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
              Staff Portal
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 8 }}>
              Welcome back.
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Enter the staff password to access<br />the JW Tuned garage dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div style={{ position: 'relative' }}>
              <input
                className={`pass-input${error ? ' error-input' : ''}`}
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 16, padding: 4 }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#FCA5A5' }}>
                ⚠️ {error}
              </div>
            )}

            <button className="login-btn" type="submit" disabled={!password.trim()}>
              Enter Dashboard →
            </button>
          </form>

          {/* Hint */}
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            Only authorised JW Tuned staff can access this area.
          </div>

        </div>
      </div>

    </div>
  )
}