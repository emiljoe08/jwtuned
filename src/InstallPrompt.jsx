import { useState, useEffect } from 'react'

const DISMISS_KEY = 'jw_install_dismissed'
const DISMISS_DAYS = 7

/**
 * "Add to home screen" install prompt banner.
 * - Captures the `beforeinstallprompt` event.
 * - Renders a themed bottom banner with Install / Not now actions.
 * - Remembers dismissal for 7 days via localStorage.
 * - Auto-hides when the app is already running in standalone mode.
 */
export default function InstallPrompt({ isLoggedIn }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [isIosPrompt, setIsIosPrompt] = useState(false)

  useEffect(() => {
    // Already installed — never show
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (navigator.standalone) return // Safari iOS

    // Check if it's iOS
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    if (isIos) {
      setIsIosPrompt(true)
      setVisible(true)
      return
    }

    function onPrompt(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    setInstalling(true)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    } else {
      dismiss()
    }
    setDeferredPrompt(null)
    setInstalling(false)
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  if (!visible || !isLoggedIn) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      padding: '0 12px 12px',
      pointerEvents: 'none',
      animation: 'installSlideUp 0.4s ease-out',
    }}>
      <style>{`
        @keyframes installSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes installPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,49,10,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(232,49,10,0); }
        }
      `}</style>
      <div style={{
        pointerEvents: 'auto',
        maxWidth: 480,
        margin: '0 auto',
        background: 'rgba(20,20,20,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        {/* Icon */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'rgba(232,49,10,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}>📲</div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
            Install JW Tuned
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.4, marginTop: 2 }}>
            Add to your home screen for quick access &amp; offline job viewing
          </div>
        </div>

        {/* Actions or iOS Instructions */}
        {isIosPrompt ? (
          <div style={{ flexShrink: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>
            Tap <span style={{ fontSize: 16 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', margin: '0 2px' }}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg></span><br/>
            then <b>Add to Home Screen</b>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={dismiss}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              disabled={installing}
              style={{
                background: '#E8310A',
                border: 'none',
                color: '#fff',
                borderRadius: 10,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 700,
                cursor: installing ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                animation: 'installPulse 2s infinite',
                opacity: installing ? 0.7 : 1,
              }}
            >
              {installing ? 'Installing…' : 'Install'}
            </button>
          </div>
        )}
      </div>
      {isIosPrompt && (
         <button onClick={dismiss} style={{ position: 'absolute', top: 6, right: 10, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>×</button>
      )}
    </div>
  )
}
