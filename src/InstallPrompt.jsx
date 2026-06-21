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
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Already installed — never show
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (navigator.standalone) return // Safari iOS

    // Recently dismissed — don't nag
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const diff = Date.now() - Number(dismissed)
      if (diff < DISMISS_DAYS * 24 * 60 * 60 * 1000) return
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

  if (!visible) return null

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

        {/* Actions */}
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
      </div>
    </div>
  )
}
