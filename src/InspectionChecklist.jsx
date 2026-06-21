import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import jwLogo from './assets/jjw.svg'
import { INSPECTION_TEMPLATE, STATUS_CONFIG, printInspection, downloadInspection, getInspectionWhatsAppUrl } from './PrintInspection'

/**
 * Full-page vehicle inspection checklist form.
 * Mechanic ticks pass/warn/fail for each item, adds notes, then saves to Supabase.
 */
export default function InspectionChecklist({ job, onSave, onBack }) {
  const template = INSPECTION_TEMPLATE[job.vehicleType] || INSPECTION_TEMPLATE['4W']

  const [categories, setCategories] = useState(() => {
    if (job.inspection?.categories) return job.inspection.categories
    return JSON.parse(JSON.stringify(template))
  })
  const [overallNotes, setOverallNotes] = useState(job.inspection?.overallNotes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!job.inspection)
  const [expandedNotes, setExpandedNotes] = useState({})

  // Stats
  const allItems = categories.flatMap(c => c.items)
  const passCount = allItems.filter(i => i.status === 'pass').length
  const warnCount = allItems.filter(i => i.status === 'warn').length
  const failCount = allItems.filter(i => i.status === 'fail').length
  const checkedCount = passCount + warnCount + failCount
  const totalCount = allItems.length
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  function toggleStatus(catIdx, itemIdx, status) {
    setCategories(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const item = next[catIdx].items[itemIdx]
      item.status = item.status === status ? null : status
      return next
    })
    setSaved(false)
  }

  function setItemNotes(catIdx, itemIdx, notes) {
    setCategories(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next[catIdx].items[itemIdx].notes = notes
      return next
    })
    setSaved(false)
  }

  function markAllPass(catIdx) {
    setCategories(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next[catIdx].items.forEach(item => { item.status = 'pass' })
      return next
    })
    setSaved(false)
  }

  function toggleNoteExpand(key) {
    setExpandedNotes(p => ({ ...p, [key]: !p[key] }))
  }

  async function handleSave() {
    setSaving(true)
    const inspection = {
      completedAt: new Date().toISOString(),
      completedBy: job.mechanic || '',
      overallNotes,
      categories,
    }
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ inspection })
        .eq('id', job.id)
      if (error) throw error
      onSave(job.id, inspection)
      setSaved(true)
    } catch (err) {
      alert('Failed to save inspection: ' + (err.message || err))
    }
    setSaving(false)
  }

  // Build a temporary job object with the current inspection data for sharing
  const jobWithInspection = { ...job, inspection: { completedAt: new Date().toISOString(), completedBy: job.mechanic || '', overallNotes, categories } }

  return (
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh', background: '#050505' }}>
      <style>{`
        @keyframes progressGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(34,197,94,0.3); }
          50% { box-shadow: 0 0 16px rgba(34,197,94,0.5); }
        }
        .insp-chip {
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;
          cursor: pointer; transition: all 0.15s; border: 1.5px solid; font-family: inherit;
          white-space: nowrap;
        }
        .note-toggle {
          background: none; border: none; color: rgba(255,255,255,0.3); font-size: 11px;
          cursor: pointer; padding: 2px 0; font-family: inherit;
        }
        .note-toggle:hover { color: rgba(255,255,255,0.6); }
      `}</style>

      {/* Header */}
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 5% 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>🔍 Vehicle Inspection</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{job.id} · {job.customerName} · {job.regNumber}</div>
          </div>
          {saved && <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#6EE7B7', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>✅ Saved</span>}
        </div>

        {/* Progress Bar */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: progress === 100 ? '#22C55E' : 'linear-gradient(90deg, #E8310A, #F59E0B)',
            borderRadius: 99,
            transition: 'width 0.3s ease',
            animation: progress === 100 ? 'progressGlow 2s ease infinite' : 'none',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          <span>{checkedCount}/{totalCount} items checked</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ color: '#6EE7B7' }}>✅ {passCount}</span>
            <span style={{ color: '#FCD34D' }}>⚠️ {warnCount}</span>
            <span style={{ color: '#F87171' }}>❌ {failCount}</span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ padding: '12px 5% 32px' }}>
        {categories.map((cat, catIdx) => {
          const catChecked = cat.items.filter(i => i.status).length
          const allPassed = cat.items.every(i => i.status === 'pass')
          return (
            <div key={cat.name} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14, overflow: 'hidden' }}>
              {/* Category header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{cat.name}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 99 }}>
                    {catChecked}/{cat.items.length}
                  </span>
                </div>
                <button
                  onClick={() => markAllPass(catIdx)}
                  style={{
                    background: allPassed ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${allPassed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: allPassed ? '#6EE7B7' : 'rgba(255,255,255,0.4)',
                    borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  ✅ All Pass
                </button>
              </div>

              {/* Items */}
              <div style={{ padding: '8px 16px 12px' }}>
                {cat.items.map((item, itemIdx) => {
                  const noteKey = `${catIdx}-${itemIdx}`
                  const showNote = expandedNotes[noteKey] || !!item.notes
                  return (
                    <div key={item.name} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: itemIdx < cat.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: item.status ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                            {item.name}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          {['pass', 'warn', 'fail'].map(s => {
                            const cfg = STATUS_CONFIG[s]
                            const active = item.status === s
                            return (
                              <button
                                key={s}
                                className="insp-chip"
                                onClick={() => toggleStatus(catIdx, itemIdx, s)}
                                style={{
                                  background: active ? cfg.bg : 'rgba(255,255,255,0.02)',
                                  borderColor: active ? cfg.border : 'rgba(255,255,255,0.08)',
                                  color: active ? cfg.color : 'rgba(255,255,255,0.35)',
                                }}
                              >
                                {s === 'pass' ? '✅' : s === 'warn' ? '⚠️' : '❌'}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      {/* Notes */}
                      {!showNote && (
                        <button className="note-toggle" onClick={() => toggleNoteExpand(noteKey)}>
                          + Add note
                        </button>
                      )}
                      {showNote && (
                        <input
                          placeholder="Add a note..."
                          value={item.notes}
                          onChange={e => setItemNotes(catIdx, itemIdx, e.target.value)}
                          style={{
                            marginTop: 6, width: '100%', height: 32, fontSize: 12,
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 6, color: '#fff', padding: '0 10px', fontFamily: 'inherit',
                            outline: 'none',
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Overall Notes */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            📝 Overall Notes
          </div>
          <div style={{ padding: 16 }}>
            <textarea
              placeholder="Overall vehicle condition, recommendations, next service notes..."
              value={overallNotes}
              onChange={e => { setOverallNotes(e.target.value); setSaved(false) }}
              rows={3}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, color: '#fff', padding: '12px 14px', fontFamily: 'inherit', fontSize: 13,
                outline: 'none', resize: 'none',
              }}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', height: 52,
            background: saving ? 'rgba(255,255,255,0.1)' : saved ? 'rgba(34,197,94,0.15)' : '#fff',
            color: saving ? 'rgba(255,255,255,0.5)' : saved ? '#6EE7B7' : '#050505',
            border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
            borderRadius: 100, fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving || saved ? 'none' : '0 8px 24px rgba(255,255,255,0.15)',
            marginBottom: 12,
          }}
        >
          {saving ? (
            <><img src={jwLogo} alt="" style={{ width: 20, height: 20, animation: 'spin 1.2s linear infinite', objectFit: 'contain' }} /> Saving...</>
          ) : saved ? '✅ Inspection Saved' : '💾 Save Inspection'}
        </button>

        {/* Share Actions */}
        {saved && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12,
            animation: 'fadeUp 0.3s ease forwards',
          }}>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <button
              onClick={() => printInspection(jobWithInspection)}
              style={{ height: 44, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'inherit' }}
            >
              🖨️ Print
            </button>
            <button
              onClick={() => downloadInspection(jobWithInspection)}
              style={{ height: 44, borderRadius: 10, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.1)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#93C5FD', fontFamily: 'inherit' }}
            >
              📄 PDF
            </button>
            <a
              href={getInspectionWhatsAppUrl(jobWithInspection)}
              target="_blank"
              rel="noreferrer"
              style={{ height: 44, borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#6EE7B7', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              💬 WhatsApp
            </a>
          </div>
        )}

        <button onClick={onBack} style={{ width: '100%', height: 44, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}
