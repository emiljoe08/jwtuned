import { useState, memo, useCallback } from 'react'

const STATUS = {
  'Waiting':     { bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', dot: '#F59E0B', col: '#1a1000' },
  'In Progress': { bg: 'rgba(59,130,246,0.1)', color: '#93C5FD', dot: '#3B82F6', col: '#00103a' },
  'Ready':       { bg: 'rgba(34,197,94,0.1)',  color: '#6EE7B7', dot: '#22C55E', col: '#001a0e' },
  'Delivered':   { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', dot: 'rgba(255,255,255,0.3)', col: '#111' },
}

const STATUSES = ['Waiting', 'In Progress', 'Ready', 'Delivered']

export default function ManagerDashboard({ jobs, mechanics, onStatusChange, onAssign, onBill, onBack }) {
  const [view, setView] = useState('kanban') // kanban | workload | unassigned | grouped

  const unassigned = jobs.filter(j => !j.mechanic || j.mechanic.trim() === '')
  const activeJobs = jobs.filter(j => j.status !== 'Delivered')

  const handleWhatsApp = useCallback((job) => {
    const msg = `Hello ${job.customerName} 👋\n\nYour vehicle *${job.regNumber}* (${job.makeModel}) status at *JW Tuned* is now:\n\n*${job.status}* ✅\n\nJob card: ${job.id}\n\nFor any queries, feel free to call us!`
    window.open(`https://wa.me/${job.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }, [])

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#050505', fontFamily: 'inherit' }}>
      <style>{`
        .mgr-tab { padding: 8px 16px; border: none; border-bottom: 2px solid transparent; background: transparent; color: rgba(255,255,255,0.4); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .mgr-tab.active { color: #fff; border-bottom-color: #E8310A; }
        .mgr-tab:hover { color: rgba(255,255,255,0.8); }
        .kanban-col { flex: 1; min-width: 220px; max-width: 300px; }
        .kanban-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; margin-bottom: 8px; transition: border-color 0.2s; }
        .kanban-card:hover { border-color: rgba(255,255,255,0.18); }
        .assign-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; color: #fff; font-size: 12px; padding: 4px 8px; font-family: inherit; outline: none; width: 100%; margin-top: 8px; cursor: pointer; }
        .assign-select:focus { border-color: #E8310A; }
        .assign-select option { background: #1a1a1a; color: #fff; }
        .mgr-stats-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 768px) {
          .mgr-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .kanban-board { flex-direction: column !important; }
          .kanban-col { min-width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ color: '#E8310A', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Manager View</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>JW Tuned Dashboard</div>
          </div>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Back
          </button>
        </div>

        {/* Summary stats */}
        <div className="mgr-stats-grid" style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Total Active', value: activeJobs.length, color: '#fff' },
            { label: 'Unassigned', value: unassigned.length, color: unassigned.length > 0 ? '#FCD34D' : '#6EE7B7' },
            { label: 'Ready', value: jobs.filter(j => j.status === 'Ready').length, color: '#6EE7B7' },
            { label: 'Mechanics', value: mechanics.length, color: '#93C5FD' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 20 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* View tabs */}
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { key: 'kanban', label: '📋 Kanban' },
            { key: 'workload', label: '👨‍🔧 Workload' },
            { key: 'unassigned', label: `🔴 Unassigned${unassigned.length > 0 ? ` (${unassigned.length})` : ''}` },
            { key: 'grouped', label: '📂 By Mechanic' },
          ].map(t => (
            <button key={t.key} className={`mgr-tab${view === t.key ? ' active' : ''}`} onClick={() => setView(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 5% 40px', overflowX: 'auto' }}>

        {/* ── KANBAN VIEW ── */}
        {view === 'kanban' && (
          <div className="kanban-board" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 'fit-content', width: '100%' }}>
            {STATUSES.map(status => {
              const colJobs = jobs.filter(j => j.status === status)
              const sc = STATUS[status]
              return (
                <div key={status} className="kanban-col">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px', background: sc.bg, border: `1px solid ${sc.dot}22`, borderRadius: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                    <span style={{ color: sc.color, fontWeight: 700, fontSize: 13 }}>{status}</span>
                    <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 99 }}>{colJobs.length}</span>
                  </div>

                  {colJobs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 12px', color: 'rgba(255,255,255,0.2)', fontSize: 12, border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 10 }}>
                      No jobs
                    </div>
                  )}

                  {colJobs.map(job => (
                    <KanbanCard key={job.id} job={job} mechanics={mechanics} onStatusChange={onStatusChange} onAssign={onAssign} onBill={onBill} onWhatsApp={handleWhatsApp} statuses={STATUSES} />
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* ── WORKLOAD VIEW ── */}
        {view === 'workload' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Active jobs per mechanic</div>
            </div>
            {/* Unassigned block */}
            {unassigned.length > 0 && (
              <WorkloadBlock
                name="⚠️ Unassigned"
                jobs={unassigned}
                mechanics={mechanics}
                onStatusChange={onStatusChange}
                onAssign={onAssign}
                onBill={onBill}
                onWhatsApp={handleWhatsApp}
                highlight
              />
            )}
            {mechanics.map(m => {
              const mJobs = jobs.filter(j => j.mechanic === m.name && j.status !== 'Delivered')
              return (
                <WorkloadBlock
                  key={m.id}
                  name={m.name}
                  jobs={mJobs}
                  mechanics={mechanics}
                  onStatusChange={onStatusChange}
                  onAssign={onAssign}
                  onBill={onBill}
                  onWhatsApp={handleWhatsApp}
                />
              )
            })}
            {mechanics.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                No mechanics added yet. Add one by typing a name when creating a job.
              </div>
            )}
          </div>
        )}

        {/* ── UNASSIGNED VIEW ── */}
        {view === 'unassigned' && (
          <div>
            {unassigned.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>All jobs assigned!</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Every job has a mechanic assigned to it.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {unassigned.map(job => (
                  <AssignRow key={job.id} job={job} mechanics={mechanics} onAssign={onAssign} onStatusChange={onStatusChange} onBill={onBill} onWhatsApp={handleWhatsApp} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── GROUPED BY MECHANIC VIEW ── */}
        {view === 'grouped' && (
          <div>
            {unassigned.length > 0 && (
              <GroupBlock name="⚠️ Unassigned" jobs={unassigned} mechanics={mechanics} onAssign={onAssign} onStatusChange={onStatusChange} onBill={onBill} onWhatsApp={handleWhatsApp} highlight />
            )}
            {mechanics.map(m => {
              const mJobs = jobs.filter(j => j.mechanic === m.name)
              if (mJobs.length === 0) return null
              return (
                <GroupBlock key={m.id} name={m.name} jobs={mJobs} mechanics={mechanics} onAssign={onAssign} onStatusChange={onStatusChange} onBill={onBill} onWhatsApp={handleWhatsApp} />
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

// ── KANBAN CARD ──────────────────────────────────────────────
const KanbanCard = memo(function KanbanCard({ job, mechanics, onStatusChange, onAssign, onBill, onWhatsApp, statuses }) {
  const sc = STATUS[job.status]
  return (
    <div className="kanban-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 14 }}>{job.vehicleType === '2W' ? '🏍️' : '🚗'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 1 }}>{job.customerName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{job.regNumber}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {job.complaint}
      </div>

      {/* Mechanic assign */}
      <MechanicSelect job={job} mechanics={mechanics} onAssign={onAssign} />

      {/* Quick status move */}
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        {statuses.filter(s => s !== job.status).map(s => {
          const c = STATUS[s]
          return (
            <button key={s} onClick={() => onStatusChange(job.id, s)} title={`Move to ${s}`} style={{ flex: 1, padding: '4px 2px', borderRadius: 6, border: `1px solid ${c.dot}44`, background: c.bg, color: c.color, fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em' }}>
              {s === 'In Progress' ? 'Active' : s}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <button onClick={() => onBill(job)} style={{ flex: 1, padding: '4px 2px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#818CF8', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🧾 Bill</button>
        <button onClick={() => onWhatsApp(job)} style={{ flex: 1, padding: '4px 2px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#4ADE80', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>💬 WA</button>
      </div>
    </div>
  )
})

// ── MECHANIC SELECT ──────────────────────────────────────────
function MechanicSelect({ job, mechanics, onAssign }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  async function handleNewMechanic() {
    if (!newName.trim()) return
    await onAssign(job.id, newName.trim(), true)
    setNewName('')
    setAdding(false)
  }

  if (adding) {
    return (
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <input
          autoFocus
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleNewMechanic(); if (e.key === 'Escape') setAdding(false) }}
          placeholder="Mechanic name"
          style={{ flex: 1, height: 30, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: '#fff', fontSize: 12, padding: '0 8px', fontFamily: 'inherit', outline: 'none' }}
        />
        <button onClick={handleNewMechanic} style={{ height: 30, padding: '0 8px', background: '#E8310A', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
        <button onClick={() => setAdding(false)} style={{ height: 30, padding: '0 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
      </div>
    )
  }

  return (
    <select
      className="assign-select"
      value={job.mechanic || ''}
      onChange={e => {
        if (e.target.value === '__new__') { setAdding(true); return }
        onAssign(job.id, e.target.value, false)
      }}
    >
      <option value="">— Assign mechanic —</option>
      {mechanics.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
      <option value="__new__">+ Add new mechanic</option>
    </select>
  )
}

// ── WORKLOAD BLOCK ───────────────────────────────────────────
function WorkloadBlock({ name, jobs, mechanics, onStatusChange, onAssign, onBill, onWhatsApp, highlight }) {
  const [open, setOpen] = useState(true)
  const active = jobs.filter(j => j.status !== 'Delivered')
  const done = jobs.filter(j => j.status === 'Delivered')

  return (
    <div style={{ marginBottom: 14, background: 'rgba(255,255,255,0.02)', border: `1px solid ${highlight ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: highlight ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${highlight ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {highlight ? '⚠️' : '👨‍🔧'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {active.length} active · {done.length} delivered
          </div>
        </div>
        {/* Mini bar */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {['Waiting','In Progress','Ready'].map(s => {
            const c = jobs.filter(j => j.status === s).length
            if (c === 0) return null
            return <span key={s} style={{ background: STATUS[s].bg, color: STATUS[s].color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, border: `1px solid ${STATUS[s].dot}44` }}>{c}</span>
          })}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && jobs.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {jobs.map(job => (
            <AssignRow key={job.id} job={job} mechanics={mechanics} onAssign={onAssign} onStatusChange={onStatusChange} onBill={onBill} onWhatsApp={onWhatsApp} compact />
          ))}
        </div>
      )}
      {open && jobs.length === 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>No active jobs</div>
      )}
    </div>
  )
}

// ── GROUP BLOCK ──────────────────────────────────────────────
function GroupBlock({ name, jobs, mechanics, onAssign, onStatusChange, onBill, onWhatsApp, highlight }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: 14, background: 'rgba(255,255,255,0.02)', border: `1px solid ${highlight ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#fff', flex: 1 }}>{name}</span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {jobs.map(job => (
            <AssignRow key={job.id} job={job} mechanics={mechanics} onAssign={onAssign} onStatusChange={onStatusChange} onBill={onBill} onWhatsApp={onWhatsApp} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── ASSIGN ROW ───────────────────────────────────────────────
const AssignRow = memo(function AssignRow({ job, mechanics, onAssign, onStatusChange, onBill, onWhatsApp, compact }) {
  const sc = STATUS[job.status]
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: compact ? '10px 12px' : '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{job.vehicleType === '2W' ? '🏍️' : '🚗'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{job.customerName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{job.regNumber} · {job.makeModel}</div>
        </div>
        <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot }} />{job.status}
        </span>
      </div>

      {!compact && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
          💬 {job.complaint}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <MechanicSelect job={job} mechanics={mechanics} onAssign={onAssign} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Waiting','In Progress','Ready','Delivered'].filter(s => s !== job.status).map(s => {
            const c = STATUS[s]
            return (
              <button key={s} onClick={() => onStatusChange(job.id, s)} style={{ padding: '5px 8px', borderRadius: 6, border: `1px solid ${c.dot}44`, background: c.bg, color: c.color, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {s === 'In Progress' ? '▶' : s === 'Ready' ? '✓' : s === 'Delivered' ? '📦' : '⏳'}
              </button>
            )
          })}
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', alignSelf: 'center', margin: '0 4px' }} />
          <button onClick={() => onBill(job)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#818CF8', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🧾 Bill</button>
          <button onClick={() => onWhatsApp(job)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#4ADE80', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>💬 WA</button>
        </div>
      </div>
    </div>
  )
})