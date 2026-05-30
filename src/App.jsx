
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { printBill } from './PrintBill'
import LoadingScreen from './LoadingScreen'
import LandingPage from './LandingPage'
import jwLogo from './assets/jwlogo.svg'
import LoginScreen from './LoginScreen'

const STATUS = {
  'Waiting':     { bg: '#FEF3E2', color: '#B45309', dot: '#F59E0B' },
  'In Progress': { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  'Ready':       { bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
  'Delivered':   { bg: '#F8FAFC', color: '#64748B', dot: '#94A3B8' },
}

let counter = 1
function generateId() {
  return `JW-${new Date().getFullYear()}-${String(counter++).padStart(4, '0')}`
}

const emptyForm = {
  customerName: '', phone: '', address: '',
  regNumber: '', makeModel: '', year: '', fuel: '', odometer: '',
  complaint: '', mechanic: '', deliveryTime: '',
  status: 'Waiting', photos: []
}

function toDb(form, vehicleType, id) {
  return {
    id,
    customer_name: form.customerName,
    phone: form.phone,
    address: form.address,
    vehicle_type: vehicleType,
    reg_number: form.regNumber,
    make_model: form.makeModel,
    year: form.year,
    fuel: form.fuel,
    odometer: form.odometer,
    complaint: form.complaint,
    mechanic: form.mechanic,
    delivery_time: form.deliveryTime,
    status: form.status,
    photos: form.photos || [],
  }
}

function fromDb(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    vehicleType: row.vehicle_type,
    regNumber: row.reg_number,
    makeModel: row.make_model,
    year: row.year,
    fuel: row.fuel,
    odometer: row.odometer,
    complaint: row.complaint,
    mechanic: row.mechanic,
    deliveryTime: row.delivery_time,
    status: row.status,
    photos: row.photos || [],
  }
}

// ── APP ──────────────────────────────────────────────────────
export default function App() {
  const [appState, setAppState]         = useState('landing')
  const [loginError, setLoginError]     = useState('')
  const [screen, setScreen]             = useState('list')
  const [jobs, setJobs]                 = useState([])
  const [editingJob, setEditingJob]     = useState(null)
  const [billingJob, setBillingJob]     = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    if (appState === 'app') {
      async function load() {
        setLoading(true); setError(null)
        const { data, error } = await supabase
          .from('jobs').select('*').order('created_at', { ascending: false })
        if (error) { setError('Could not load jobs.'); console.error(error) }
        else {
          setJobs(data.map(fromDb))
          const nums = data.map(r => parseInt(r.id.split('-')[2])).filter(n => !isNaN(n))
          counter = nums.length > 0 ? Math.max(...nums) + 1 : 1
        }
        setLoading(false)
      }
      load()
    }
  }, [appState])

  // ── ALL FUNCTIONS DEFINED HERE FIRST ──
  function handleLogin(password) {
    if (password === 'jwtuned2024') {
      setLoginError('')
      setAppState('loading')
    } else {
      setLoginError('Wrong password. Try again.')
    }
  }

  function openNew()     { setEditingJob(null); setScreen('form') }
  function openEdit(job) { setEditingJob(job);  setScreen('form') }
  function openBill(job) { setBillingJob(job);  setScreen('bill') }

  async function saveJob(form, vehicleType) {
    const id  = editingJob ? editingJob.id : generateId()
    const row = toDb(form, vehicleType, id)
    if (editingJob) {
      const { error } = await supabase.from('jobs').update(row).eq('id', id)
      if (error) { alert('Error: ' + error.message); return }
      setJobs(p => p.map(j => j.id === id ? fromDb(row) : j))
    } else {
      const { error } = await supabase.from('jobs').insert(row)
      if (error) { alert('Error: ' + error.message); return }
      setJobs(p => [fromDb(row), ...p])
    }
    setScreen('list')
  }

  async function deleteJob(id) {
    if (!window.confirm('Delete this job card?')) return
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    setJobs(p => p.filter(j => j.id !== id))
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('jobs').update({ status }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    setJobs(p => p.map(j => j.id === id ? { ...j, status } : j))
  }

  // ── SCREEN ROUTING AFTER ALL FUNCTIONS ──
  if (appState === 'landing') return <LandingPage onEnter={() => setAppState('login')} />
  if (appState === 'login')   return <LoginScreen onLogin={handleLogin} onBack={() => setAppState('landing')} error={loginError} />
  if (appState === 'loading') return <LoadingScreen onDone={() => setAppState('app')} />

  if (screen === 'form') return <JobCardForm initialData={editingJob} onSave={saveJob} onBack={() => setScreen('list')} />
  if (screen === 'bill') return <BillingScreen job={billingJob} onBack={() => setScreen('list')} />

  return (
    <JobList
      jobs={jobs} loading={loading} error={error}
      onNew={openNew} onEdit={openEdit} onBill={openBill}
      onDelete={deleteJob} onStatusChange={updateStatus}
      onRefresh={() => setAppState('loading')}
    />
  )
}

// ── SCREEN 1 — LIST ──────────────────────────────────────────
function JobList({ jobs, loading, error, onNew, onEdit, onBill, onDelete, onStatusChange, onRefresh }) {
  const [filter, setFilter] = useState('All')
  const tabs     = ['All', 'Waiting', 'In Progress', 'Ready', 'Delivered']
  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.status === filter)
  const stats    = {
    total: jobs.length,
    waiting: jobs.filter(j => j.status === 'Waiting').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    ready: jobs.filter(j => j.status === 'Ready').length,
  }

  return (
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #185FA5 0%, #1E40AF 100%)', padding: '20px 5% 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={jwLogo} alt="Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              JW Tuned
            </div>
            <div style={{ color: '#93C5FD', fontSize: 12, marginTop: 2 }}>Garage Management</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onRefresh} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 10, width: 36, height: 36, fontSize: 16, cursor: 'pointer' }}>↻</button>
            <button onClick={onNew} style={{ background: '#fff', color: '#185FA5', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ New Job</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { label: 'Total',   value: stats.total,      color: '#fff' },
            { label: 'Waiting', value: stats.waiting,    color: '#FCD34D' },
            { label: 'Active',  value: stats.inProgress, color: '#93C5FD' },
            { label: 'Ready',   value: stats.ready,      color: '#6EE7B7' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 20 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 5% 24px', marginTop: -8 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, marginBottom: 12, scrollbarWidth: 'none' }}>
          {tabs.map(t => {
            const count  = t === 'All' ? jobs.length : jobs.filter(j => j.status === t).length
            const active = filter === t
            return (
              <button key={t} onClick={() => setFilter(t)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 99, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: active ? '#185FA5' : '#fff', color: active ? '#fff' : '#64748B', borderColor: active ? '#185FA5' : '#E2E8F0', boxShadow: active ? '0 2px 8px rgba(24,95,165,0.25)' : 'none' }}>
                {t !== 'All' && STATUS[t] && <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#fff' : STATUS[t].dot }} />}
                {t} {count > 0 && <span style={{ background: active ? 'rgba(255,255,255,0.25)' : '#F1F5F9', color: active ? '#fff' : '#64748B', padding: '0 5px', borderRadius: 99, fontSize: 10 }}>{count}</span>}
              </button>
            )
          })}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}><div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div><div style={{ fontSize: 14, fontWeight: 600 }}>Loading jobs...</div></div>}
        {error && !loading && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 12, padding: 16, textAlign: 'center', color: '#DC2626', marginBottom: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{error}</div>
            <button onClick={onRefresh} style={{ marginTop: 8, padding: '6px 16px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Try again</button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No jobs here</div>
            <div style={{ fontSize: 13 }}>Try a different filter or add a new job</div>
          </div>
        )}
        {!loading && filtered.map(job => (
          <JobRow key={job.id} job={job} onEdit={onEdit} onBill={onBill} onDelete={onDelete} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  )
}

// ── JOB ROW ──────────────────────────────────────────────────
function JobRow({ job, onEdit, onBill, onDelete, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [viewing, setViewing]   = useState(null)
  const sc       = STATUS[job.status] || STATUS['Waiting']
  const statuses = ['Waiting', 'In Progress', 'Ready', 'Delivered']

  function handleWhatsApp() {
    const msg = `Hello ${job.customerName} 👋\n\nYour vehicle *${job.regNumber}* (${job.makeModel}) status at *JW Tuned* is now:\n\n*${job.status}* ✅\n\nJob card: ${job.id}\n\nFor any queries, feel free to call us!`
    window.open(`https://wa.me/${job.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {job.vehicleType === '2W' ? '🏍️' : '🚗'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 2 }}>{job.customerName}</div>
          <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>{job.regNumber}</span>
            <span style={{ color: '#CBD5E1' }}>·</span>
            <span>{job.makeModel}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot }} />{job.status}
          </span>
          <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>{job.id}</span>
        </div>
      </div>

      {!expanded && (
        <div style={{ padding: '0 14px 12px', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          💬 {job.complaint}
        </div>
      )}

      {expanded && (
        <div style={{ borderTop: '1px solid #F1F5F9' }}>
          <div style={{ margin: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
            💬 {job.complaint}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', margin: '0 14px 12px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {[
              { icon: '🔧', label: 'Mechanic', value: job.mechanic || '—' },
              { icon: '📍', label: 'Odometer', value: `${job.odometer} km` },
              { icon: '🕐', label: 'Delivery',  value: job.deliveryTime || '—' },
              { icon: '⛽', label: 'Fuel',      value: job.fuel || '—' },
            ].map((d, i) => (
              <div key={d.label} style={{ padding: '10px 12px', borderRight: i % 2 === 0 ? '1px solid #E2E8F0' : 'none', borderBottom: i < 2 ? '1px solid #E2E8F0' : 'none' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.icon} {d.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{d.value}</div>
              </div>
            ))}
          </div>

          {job.photos && job.photos.length > 0 && (
            <div style={{ padding: '0 14px 12px' }}>
              <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>📸 Vehicle photos ({job.photos.length})</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {job.photos.map(photo => (
                  <div key={photo.id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <img src={photo.url} alt="Vehicle" onClick={() => setViewing(photo)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '0 14px 12px' }}>
            <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Update status</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {statuses.map(s => {
                const active = job.status === s
                const c = STATUS[s]
                return (
                  <button key={s} onClick={() => onStatusChange(job.id, s)} style={{ flex: 1, padding: '6px 4px', borderRadius: 8, border: `1.5px solid ${active ? c.dot : '#E2E8F0'}`, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: active ? c.bg : '#fff', color: active ? c.color : '#94A3B8' }}>
                    {s === 'In Progress' ? 'Active' : s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4 action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '0 14px 14px' }}>
  <button onClick={() => onEdit(job)} style={{ height: 40, borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#334155' }}>✏️ Edit</button>
  <button onClick={() => onBill(job)} style={{ height: 40, borderRadius: 10, border: '1.5px solid #C7D2FE', background: '#EEF2FF', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#4338CA' }}>🧾 Bill</button>
  <button onClick={handleWhatsApp}    style={{ height: 40, borderRadius: 10, border: '1.5px solid #86EFAC', background: '#F0FDF4', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#15803D' }}>💬 WA</button>
  <button onClick={() => onDelete(job.id)} style={{ height: 40, borderRadius: 10, border: '1.5px solid #FECACA', background: '#FFF5F5', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#DC2626' }}>🗑️ Del</button>
</div>
        </div>
      )}
      {viewing && <PhotoViewer photo={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

// ── SCREEN 3 — BILLING ───────────────────────────────────────
const emptyLineItem = () => ({ id: Date.now(), description: '', qty: '1', rate: '', type: 'labour' })

function BillingScreen({ job, onBack }) {
  const [items, setItems]         = useState([
    { id: 1, description: 'Labour charges', qty: '1', rate: '', type: 'labour' },
  ])
  const [discount, setDiscount]   = useState('')
  const [paid, setPaid]           = useState(false)
  const [payMode, setPayMode]     = useState('Cash')
  const [note, setNote]           = useState('')
  const [printed, setPrinted]     = useState(false)

  function addItem(type) {
    setItems(p => [...p, { ...emptyLineItem(), type }])
  }

  function updateItem(id, field, value) {
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  function removeItem(id) {
    setItems(p => p.filter(i => i.id !== id))
  }

  const subtotal   = items.reduce((sum, i) => sum + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0), 0)
  const discAmt    = parseFloat(discount) || 0
  const total      = Math.max(0, subtotal - discAmt)
  const labourAmt  = items.filter(i => i.type === 'labour').reduce((s, i) => s + (parseFloat(i.qty)||0)*(parseFloat(i.rate)||0), 0)
  const partsAmt   = items.filter(i => i.type === 'parts').reduce((s, i)  => s + (parseFloat(i.qty)||0)*(parseFloat(i.rate)||0), 0)

  function handleWhatsApp() {
    const lines = items.map(i => `  • ${i.description}: ₹${((parseFloat(i.qty)||0)*(parseFloat(i.rate)||0)).toFixed(0)}`).join('\n')
    const msg = `Hello ${job.customerName} 👋\n\n*Bill from JW Tuned*\nJob: ${job.id}\nVehicle: ${job.regNumber} (${job.makeModel})\n\n${lines}\n\nSubtotal: ₹${subtotal.toFixed(0)}${discAmt ? `\nDiscount: -₹${discAmt}` : ''}\n*Total: ₹${total.toFixed(0)}*\n\nPayment: ${paid ? `Paid via ${payMode} ✅` : 'Pending 🔴'}\n\nThank you for choosing JW Tuned! 🔧`
    window.open(`https://wa.me/${job.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  

// inside BillingScreen, replace handlePrint:
function handlePrint() {
  printBill({ job, items, discount, paid, payMode, note })
}

  return (
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh', background: '#F0F4F8' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)', padding: '16px 5% 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>🧾 Create Bill</div>
          <div style={{ color: '#C7D2FE', fontSize: 12 }}>{job.id} · {job.regNumber}</div>
        </div>
      </div>

      <div style={{ padding: '12px 5% 32px' }}>

        {/* Customer + vehicle summary */}
        <Card title="📋 Job Summary">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Customer',  value: job.customerName },
              { label: 'Phone',     value: job.phone },
              { label: 'Vehicle',   value: job.makeModel },
              { label: 'Reg. No.',  value: job.regNumber },
              { label: 'Mechanic',  value: job.mechanic || '—' },
              { label: 'Odometer',  value: `${job.odometer} km` },
            ].map(d => (
              <div key={d.label}>
                <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{d.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{d.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Line items */}
        <Card title="🔩 Labour & Parts">
          {items.map((item, idx) => (
            <div key={item.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: item.type === 'labour' ? '#EFF6FF' : '#F0FDF4', color: item.type === 'labour' ? '#1D4ED8' : '#15803D' }}>
                  {item.type === 'labour' ? '🔧 Labour' : '🔩 Parts'}
                </span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
                )}
              </div>
              <input
                placeholder="Description (e.g. Oil change, Air filter)"
                value={item.description}
                onChange={e => updateItem(item.id, 'description', e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Qty">
                  <input placeholder="1" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} inputMode="numeric" />
                </Field>
                <Field label="Rate (₹)">
                  <input placeholder="500" value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)} inputMode="numeric" />
                </Field>
              </div>
              {item.qty && item.rate && (
                <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#334155', textAlign: 'right' }}>
                  = ₹{((parseFloat(item.qty)||0) * (parseFloat(item.rate)||0)).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          ))}

          {/* Add item buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => addItem('labour')} style={{ height: 40, borderRadius: 10, border: '2px dashed #BFDBFE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Labour
            </button>
            <button onClick={() => addItem('parts')} style={{ height: 40, borderRadius: 10, border: '2px dashed #BBF7D0', background: '#F0FDF4', color: '#15803D', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Parts
            </button>
          </div>
        </Card>

        {/* Totals */}
        <Card title="💰 Amount">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
            <span>🔧 Labour</span><span style={{ fontWeight: 600 }}>₹{labourAmt.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
            <span>🔩 Parts</span><span style={{ fontWeight: 600 }}>₹{partsAmt.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
            <span>Subtotal</span><span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <Field label="Discount (₹)">
            <input placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} inputMode="numeric" />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#EEF2FF', borderRadius: 10, padding: '12px 14px' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#4338CA' }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#4338CA' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </Card>

        {/* Payment */}
        <Card title="💳 Payment">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setPaid(!paid)}
              style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${paid ? '#22C55E' : '#E2E8F0'}`, background: paid ? '#22C55E' : '#fff', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {paid ? '✓' : ''}
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: paid ? '#15803D' : '#64748B' }}>
              {paid ? 'Payment received' : 'Mark as paid'}
            </span>
          </div>

          {paid && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Payment mode</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Cash', 'UPI', 'Card'].map(m => (
                  <button key={m} onClick={() => setPayMode(m)} style={{ flex: 1, height: 38, borderRadius: 10, border: `2px solid ${payMode === m ? '#22C55E' : '#E2E8F0'}`, background: payMode === m ? '#F0FDF4' : '#fff', color: payMode === m ? '#15803D' : '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {m === 'Cash' ? '💵' : m === 'UPI' ? '📱' : '💳'} {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Field label="Note (optional)">
            <input placeholder="e.g. Customer will collect tomorrow" value={note} onChange={e => setNote(e.target.value)} />
          </Field>
        </Card>

        {/* Actions */}
        <button onClick={handleWhatsApp} style={{ width: '100%', height: 52, background: 'linear-gradient(135deg, #15803D, #16A34A)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10, boxShadow: '0 4px 14px rgba(21,128,61,0.3)' }}>
          💬 Send Bill on WhatsApp
        </button>
        <button onClick={handlePrint} style={{ width: '100%', height: 48, background: 'linear-gradient(135deg, #4338CA, #6366F1)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, boxShadow: '0 4px 14px rgba(67,56,202,0.3)' }}>
          🖨️ Print Bill
        </button>
        <button onClick={onBack} style={{ width: '100%', height: 44, background: 'transparent', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          ← Back
        </button>
      </div>
    </div>
  )
}

// ── SCREEN 2 — FORM ──────────────────────────────────────────
function JobCardForm({ initialData, onSave, onBack }) {
  const [vehicleType, setVehicleType] = useState(initialData?.vehicleType || '4W')
  const [form, setForm]               = useState(initialData ? { ...initialData } : { ...emptyForm })
  const [saving, setSaving]           = useState(false)

  function handleChange(field, value) { setForm(p => ({ ...p, [field]: value })) }

  async function handleSave() {
    if (!form.customerName || !form.phone || !form.regNumber || !form.makeModel || !form.complaint) {
      alert('Please fill: Name, Phone, Reg. Number, Make & Model, and Complaint')
      return
    }
    setSaving(true)
    await onSave(form, vehicleType)
    setSaving(false)
  }

  return (
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh', background: '#F0F4F8' }}>
      <div style={{ background: 'linear-gradient(135deg, #185FA5 0%, #1E40AF 100%)', padding: '16px 5% 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{initialData ? 'Edit Job Card' : 'New Job Card'}</div>
          <div style={{ color: '#93C5FD', fontSize: 12 }}>{initialData?.id || 'Fill in the details below'}</div>
        </div>
      </div>

      <div style={{ padding: '12px 5% 32px' }}>
        <Card title="👤 Customer Details">
          <Field label="Full Name *"><input placeholder="Customer name" value={form.customerName} onChange={e => handleChange('customerName', e.target.value)} /></Field>
          <Field label="Phone Number *"><input placeholder="+91 98471 23456" value={form.phone} onChange={e => handleChange('phone', e.target.value)} inputMode="tel" /></Field>
          <Field label="Address"><input placeholder="Area, City" value={form.address} onChange={e => handleChange('address', e.target.value)} /></Field>
        </Card>

        <Card title="🚗 Vehicle Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['4W','🚗 4-Wheeler'],['2W','🏍️ 2-Wheeler']].map(([val, label]) => (
              <button key={val} onClick={() => setVehicleType(val)} style={{ height: 44, borderRadius: 10, border: `2px solid ${vehicleType === val ? '#185FA5' : '#E2E8F0'}`, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: vehicleType === val ? '#EFF6FF' : '#fff', color: vehicleType === val ? '#185FA5' : '#64748B' }}>
                {label}
              </button>
            ))}
          </div>
          <Field label="Registration Number *"><input placeholder="KL 05 AH 7823" value={form.regNumber} onChange={e => handleChange('regNumber', e.target.value.toUpperCase())} style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontWeight: 600 }} /></Field>
          <Field label="Make & Model *"><input placeholder="Maruti Swift Dzire" value={form.makeModel} onChange={e => handleChange('makeModel', e.target.value)} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Year"><input placeholder="2019" value={form.year} onChange={e => handleChange('year', e.target.value)} inputMode="numeric" /></Field>
            <Field label="Fuel Type"><input placeholder="Petrol / Diesel" value={form.fuel} onChange={e => handleChange('fuel', e.target.value)} /></Field>
          </div>
          <Field label="Odometer (km) *"><input placeholder="42310" value={form.odometer} onChange={e => handleChange('odometer', e.target.value)} inputMode="numeric" /></Field>
        </Card>

        <Card title="📋 Job Details">
          <Field label="Complaint / Work Requested *">
            <textarea rows={3} placeholder="Describe the issue..." value={form.complaint} onChange={e => handleChange('complaint', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Mechanic"><input placeholder="Name" value={form.mechanic} onChange={e => handleChange('mechanic', e.target.value)} /></Field>
          </div>
          <Field label="Expected Delivery"><input placeholder="Today 5:00 PM" value={form.deliveryTime} onChange={e => handleChange('deliveryTime', e.target.value)} /></Field>
          <Field label="Status">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 2 }}>
              {['Waiting','In Progress','Ready','Delivered'].map(s => {
                const active = form.status === s; const c = STATUS[s]
                return (
                  <button key={s} onClick={() => handleChange('status', s)} style={{ padding: '8px 4px', borderRadius: 10, border: `2px solid ${active ? c.dot : '#E2E8F0'}`, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: active ? c.bg : '#fff', color: active ? c.color : '#94A3B8', lineHeight: 1.3 }}>
                    {s === 'In Progress' ? 'In\nProgress' : s}
                  </button>
                )
              })}
            </div>
          </Field>
        </Card>

        <Card title="📸 Vehicle Photos">
          <ImageUploader photos={form.photos || []} onChange={photos => handleChange('photos', photos)} />
        </Card>

        <button onClick={handleSave} disabled={saving} style={{ width: '100%', height: 52, background: saving ? '#94A3B8' : 'linear-gradient(135deg, #185FA5, #1E40AF)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(24,95,165,0.35)', marginBottom: 10 }}>
          {saving ? '⏳ Saving...' : `💾 ${initialData ? 'Update Job Card' : 'Save Job Card'}`}
        </button>
        <button onClick={onBack} style={{ width: '100%', height: 44, background: 'transparent', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

// ── IMAGE UPLOADER ───────────────────────────────────────────
function ImageUploader({ photos, onChange }) {
  const [viewing, setViewing] = useState(null)

  function handleFiles(e) {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => onChange([...photos, { id: Date.now() + Math.random(), url: ev.target.result, name: file.name }])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  return (
    <>
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 8 }}>
          {photos.map(photo => (
            <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <img src={photo.url} alt="Vehicle" onClick={() => setViewing(photo)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
              <button onClick={() => onChange(photos.filter(p => p.id !== photo.id))} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          ))}
        </div>
      )}
      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, height: 80, borderRadius: 12, border: '2px dashed #CBD5E1', background: '#F8FAFC', cursor: 'pointer', color: '#64748B' }}>
        <span style={{ fontSize: 24 }}>📷</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Add photos</span>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>Camera or gallery · tap to upload</span>
        <input type="file" accept="image/*" multiple capture="environment" onChange={handleFiles} style={{ display: 'none' }} />
      </label>
      {photos.length > 0 && <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>{photos.length} photo{photos.length > 1 ? 's' : ''} · tap to view</div>}
      {viewing && <PhotoViewer photo={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}

// ── PHOTO VIEWER ─────────────────────────────────────────────
function PhotoViewer({ photo, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>×</button>
      <img src={photo.url} alt="Vehicle" onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain' }} />
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 12 }}>Tap anywhere to close</div>
    </div>
  )
}

// ── REUSABLE ─────────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', marginBottom: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '11px 14px', borderBottom: '1px solid #F1F5F9', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}</label>
      {children}
    </div>
  )
}