
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { printBill } from './PrintBill'
import LoadingScreen from './LoadingScreen'
import LandingPage from './LandingPage'
import jwLogo from './assets/jjw.svg'
import LoginScreen from './LoginScreen'
import CustomerHistory from './CustomerHistory'
import RevenueReports from './RevenueReports'
import ManagerDashboard from './ManagerDashboard'


const STATUS = {
  'Waiting':     { bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', dot: '#F59E0B' },
  'In Progress': { bg: 'rgba(59,130,246,0.1)', color: '#93C5FD', dot: '#3B82F6' },
  'Ready':       { bg: 'rgba(34,197,94,0.1)',  color: '#6EE7B7', dot: '#22C55E' },
  'Delivered':   { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', dot: 'rgba(255,255,255,0.3)' },
}

let counter = 1
/**
 * Generates a unique job ID format (e.g., JW-2024-0001).
 * @returns {string} The generated job ID.
 */
function generateId() {
  return `JW-${new Date().getFullYear()}-${String(counter++).padStart(4, '0')}`
}

const emptyForm = {
  customerName: '', phone: '', address: '',
  regNumber: '', makeModel: '', year: '', fuel: '', odometer: '',
  complaint: '', mechanic: '', deliveryTime: '',
  status: 'Waiting', photos: []
}

/**
 * Maps form data to the database schema format.
 * @param {Object} form - The form data.
 * @param {string} vehicleType - The type of vehicle (e.g., '2W', '4W').
 * @param {string} id - The job ID.
 * @returns {Object} Database-ready object.
 */
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

/**
 * Maps a database row back to the application's form data structure.
 * @param {Object} row - The database row.
 * @returns {Object} Form-compatible data object.
 */
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
/**
 * Main Application component that handles state and routing between landing, login, loading, and dashboard.
 * @returns {JSX.Element} The rendered application component.
 */
export default function App({ startAtDashboard = false }) {
  const [appState, setAppState] = useState(startAtDashboard ? 'login' : 'landing')
const [loginError, setLoginError]     = useState('')
const [isManager, setIsManager]       = useState(false)  // ← add this
const [screen, setScreen]             = useState('list')
const [jobs, setJobs]                 = useState([])
const [mechanics, setMechanics]       = useState([])     // ← add this
const [editingJob, setEditingJob]     = useState(null)
const [billingJob, setBillingJob]     = useState(null)
const [loading, setLoading]           = useState(true)
const [error, setError]               = useState(null)

 useEffect(() => {
  if (appState === 'app') {
    async function load() {
      setLoading(true); setError(null)
      const [jobsRes, mechRes] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('mechanics').select('*').order('name')
      ])
      if (jobsRes.error) { setError('Could not load jobs.'); console.error(jobsRes.error) }
      else {
        setJobs(jobsRes.data.map(fromDb))
        const nums = jobsRes.data.map(r => parseInt(r.id.split('-')[2])).filter(n => !isNaN(n))
        counter = nums.length > 0 ? Math.max(...nums) + 1 : 1
      }
      if (mechRes.data) setMechanics(mechRes.data)
      setLoading(false)
    }
    load()
  }
}, [appState])

  // ── ALL FUNCTIONS DEFINED HERE FIRST ──
  /**
   * Validates the login password and updates the application state.
   * @param {string} password - The entered password.
   */
  function handleLogin(password) {
  if (password === 'jwtuned2024') {
    setLoginError(''); setIsManager(false); setAppState('loading')
  } else if (password === 'jwmanager2024') {
    setLoginError(''); setIsManager(true); setAppState('loading')
  } else {
    setLoginError('Wrong password. Try again.')
  }
}

  /**
   * Opens the form to create a new job card.
   */
  function openNew()     { setEditingJob(null); setScreen('form') }

  /**
   * Opens the form to edit an existing job card.
   * @param {Object} job - The job to edit.
   */
  function openEdit(job) { setEditingJob(job);  setScreen('form') }

  /**
   * Opens the billing screen for a specific job.
   * @param {Object} job - The job to bill.
   */
  function openBill(job) { setBillingJob(job);  setScreen('bill') }

  /**
   * Saves a new or edited job card to the database and updates local state.
   * @param {Object} form - The job form data.
   * @param {string} vehicleType - The selected vehicle type.
   */
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

  /**
   * Deletes a job card from the database after user confirmation.
   * @param {string} id - The ID of the job to delete.
   */
  async function deleteJob(id) {
    if (!window.confirm('Delete this job card?')) return
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    setJobs(p => p.filter(j => j.id !== id))
  }

  /**
   * Updates the status of a job card in the database and local state.
   * @param {string} id - The ID of the job to update.
   * @param {string} status - The new status to set.
   */
  async function updateStatus(id, status) {
    const { error } = await supabase.from('jobs').update({ status }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    setJobs(p => p.map(j => j.id === id ? { ...j, status } : j))
  }
  async function assignMechanic(jobId, mechanicName, isNew) {
  // If new mechanic, add to roster first
  if (isNew && mechanicName) {
    const { data: existing } = await supabase
      .from('mechanics').select('id').eq('name', mechanicName).single()
    if (!existing) {
      const { data: newMech } = await supabase
        .from('mechanics').insert({ name: mechanicName }).select().single()
      if (newMech) setMechanics(p => [...p, newMech].sort((a,b) => a.name.localeCompare(b.name)))
    }
  }
  // Update job
  const { error } = await supabase.from('jobs').update({ mechanic: mechanicName }).eq('id', jobId)
  if (error) { alert('Error: ' + error.message); return }
  setJobs(p => p.map(j => j.id === jobId ? { ...j, mechanic: mechanicName } : j))
}

  // ── SCREEN ROUTING AFTER ALL FUNCTIONS ──
  /**
   * Renders the current screen based on `appState` and `screen` state.
   * @returns {JSX.Element} The active screen component.
   */
  const renderScreen = () => {
    if (appState === 'landing') return <LandingPage onEnter={() => setAppState('login')} />
if (appState === 'login')   return <LoginScreen onLogin={handleLogin} onBack={() => setAppState('landing')} error={loginError} />
if (appState === 'loading') return <LoadingScreen onDone={() => setAppState('app')} />

if (screen === 'form')     return <JobCardForm initialData={editingJob} onSave={saveJob} onBack={() => setScreen('list')} mechanics={mechanics} />
if (screen === 'bill')     return <BillingScreen job={billingJob} onBack={() => setScreen('list')} />
if (screen === 'manager')  return <ManagerDashboard jobs={jobs} mechanics={mechanics} onStatusChange={updateStatus} onAssign={assignMechanic} onBack={() => setScreen('list')} />
if (screen === 'history')  return <CustomerHistory onBack={() => setScreen('list')} />
if (screen === 'reports')  return <RevenueReports onBack={() => setScreen('list')} />
if (screen === 'manager') return (
  <ManagerDashboard
    jobs={jobs}
    mechanics={mechanics}
    onStatusChange={updateStatus}
    onAssign={assignMechanic}
    onBack={() => setScreen('list')}
  />
)

return (
  <JobList
    jobs={jobs} loading={loading} error={error}
    onNew={openNew} onEdit={openEdit} onBill={openBill}
    onDelete={deleteJob} onStatusChange={updateStatus}
    onRefresh={() => setAppState('loading')}
    isManager={isManager}
    onManagerView={() => setScreen('manager')}
    onScreen={setScreen}
    onLogout={() => { setAppState('login'); setIsManager(false); setScreen('list'); }}
  />
)
  }

  return (
    <>
      <style>{`
        body { background: #050505; color: #fff; }
        #root {
          max-width: none !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          text-align: left !important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        input, textarea {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          border-radius: 8px;
          padding: 12px 14px;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
          box-sizing: border-box;
        }
        input:focus, textarea:focus {
          border-color: #fff;
          background: rgba(255,255,255,0.06);
        }
        input::placeholder, textarea::placeholder {
          color: rgba(255,255,255,0.3);
        }
      `}</style>
      {renderScreen()}
    </>
  )
}

// ── SCREEN 1 — LIST ──────────────────────────────────────────
/**
 * Renders the dashboard list of job cards, including statistics and filters.
 * @returns {JSX.Element} The job list screen component.
 */
function JobList({ jobs, loading, error, onNew, onEdit, onBill, onDelete, onStatusChange, onRefresh, isManager, onManagerView, onScreen, onLogout }) {
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
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh', background: '#050505' }}>
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 5% 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={jwLogo} alt="Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              JW Tuned
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>Garage Management</div>
          </div>
         <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
  <button onClick={onRefresh} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', borderRadius:10, width:36, height:36, fontSize:16, cursor:'pointer' }}>↻</button>
  {isManager && <>
    <button onClick={onManagerView} style={{ background:'rgba(232,49,10,0.1)', border:'1px solid rgba(232,49,10,0.3)', color:'#E8310A', borderRadius:10, padding:'8px 12px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>📊 Manager</button>
    <button onClick={() => onScreen('reports')} style={{ background:'rgba(252,211,77,0.1)', border:'1px solid rgba(252,211,77,0.2)', color:'#FCD34D', borderRadius:10, padding:'8px 12px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>📈 Reports</button>
  </>}
  <button onClick={() => onScreen('history')} style={{ background:'rgba(147,197,253,0.1)', border:'1px solid rgba(147,197,253,0.2)', color:'#93C5FD', borderRadius:10, padding:'8px 12px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>🔍 History</button>
  <button onClick={onNew} style={{ background:'#fff', color:'#050505', border:'none', borderRadius:10, padding:'8px 16px', fontWeight:600, fontSize:13, cursor:'pointer' }}>+ New Job</button>
  <button onClick={onLogout} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#F87171', borderRadius:10, padding:'8px 12px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', marginLeft: 8 }}>🚪 Logout</button>
</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { label: 'Total',   value: stats.total,      color: '#fff' },
            { label: 'Waiting', value: stats.waiting,    color: '#fff' },
            { label: 'Active',  value: stats.inProgress, color: '#fff' },
            { label: 'Ready',   value: stats.ready,      color: '#fff' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
              <div style={{ color: s.color, fontWeight: 600, fontSize: 20 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
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
              <button key={t} onClick={() => setFilter(t)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 99, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: active ? '#fff' : 'rgba(255,255,255,0.03)', color: active ? '#050505' : 'rgba(255,255,255,0.5)', borderColor: active ? '#fff' : 'rgba(255,255,255,0.1)', boxShadow: active ? '0 4px 12px rgba(255,255,255,0.15)' : 'none' }}>
                {t !== 'All' && STATUS[t] && <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#050505' : STATUS[t].dot }} />}
                {t} {count > 0 && <span style={{ background: active ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', color: active ? '#050505' : 'rgba(255,255,255,0.6)', padding: '0 5px', borderRadius: 99, fontSize: 10 }}>{count}</span>}
              </button>
            )
          })}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}><img src={jwLogo} alt="Loading" style={{ width: 36, height: 36, marginBottom: 12, animation: 'spin 1.2s linear infinite', opacity: 0.5 }} /><div style={{ fontSize: 14, fontWeight: 600 }}>Loading jobs...</div></div>}
        {error && !loading && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 12, padding: 16, textAlign: 'center', color: '#DC2626', marginBottom: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{error}</div>
            <button onClick={onRefresh} style={{ marginTop: 8, padding: '6px 16px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Try again</button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: '#fff' }}>No jobs here</div>
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
/**
 * Renders an individual job card row in the dashboard list.
 * @returns {JSX.Element} The job row component.
 */
function JobRow({ job, onEdit, onBill, onDelete, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [viewing, setViewing]   = useState(null)
  const sc       = STATUS[job.status] || STATUS['Waiting']
  const statuses = ['Waiting', 'In Progress', 'Ready', 'Delivered']

  /** Opens WhatsApp with a pre-filled status update message for the customer. */
  function handleWhatsApp() {
    const msg = `Hello ${job.customerName} 👋\n\nYour vehicle *${job.regNumber}* (${job.makeModel}) status at *JW Tuned* is now:\n\n*${job.status}* ✅\n\nJob card: ${job.id}\n\nFor any queries, feel free to call us!`
    window.open(`https://wa.me/${job.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, marginBottom: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {job.vehicleType === '2W' ? '🏍️' : '🚗'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 2 }}>{job.customerName}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#fff' }}>{job.regNumber}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span>{job.makeModel}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot }} />{job.status}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{job.id}</span>
        </div>
      </div>

      {!expanded && (
        <div style={{ padding: '0 14px 12px', fontSize: 12, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          💬 {job.complaint}
        </div>
      )}

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ margin: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
            💬 {job.complaint}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', margin: '0 14px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {[
              { icon: '🔧', label: 'Mechanic', value: job.mechanic || '—' },
              { icon: '📍', label: 'Odometer', value: `${job.odometer} km` },
              { icon: '🕐', label: 'Delivery',  value: job.deliveryTime || '—' },
              { icon: '⛽', label: 'Fuel',      value: job.fuel || '—' },
            ].map((d, i) => (
              <div key={d.label} style={{ padding: '10px 12px', borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.08)' : 'none', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.icon} {d.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{d.value}</div>
              </div>
            ))}
          </div>

          {job.photos && job.photos.length > 0 && (
            <div style={{ padding: '0 14px 12px' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>📸 Vehicle photos ({job.photos.length})</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {job.photos.map(photo => (
                  <div key={photo.id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={photo.url} alt="Vehicle" onClick={() => setViewing(photo)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '0 14px 12px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Update status</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {statuses.map(s => {
                const active = job.status === s
                const c = STATUS[s]
                return (
                  <button key={s} onClick={() => onStatusChange(job.id, s)} style={{ flex: 1, padding: '6px 4px', borderRadius: 8, border: `1px solid ${active ? c.dot : 'rgba(255,255,255,0.1)'}`, fontSize: 10, fontWeight: 600, cursor: 'pointer', background: active ? c.bg : 'rgba(255,255,255,0.03)', color: active ? c.color : 'rgba(255,255,255,0.5)' }}>
                    {s === 'In Progress' ? 'Active' : s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4 action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '0 14px 14px' }}>
  <button onClick={() => onEdit(job)} style={{ height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>✏️ Edit</button>
  <button onClick={() => onBill(job)} style={{ height: 40, borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#818CF8' }}>🧾 Bill</button>
  <button onClick={handleWhatsApp}    style={{ height: 40, borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#4ADE80' }}>💬 WA</button>
  <button onClick={() => onDelete(job.id)} style={{ height: 40, borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#F87171' }}>🗑️ Del</button>
</div>
        </div>
      )}
      {viewing && <PhotoViewer photo={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

// ── SCREEN 3 — BILLING ───────────────────────────────────────
/** Returns a clean, empty line item for the billing form. */
const emptyLineItem = () => ({ id: Date.now(), description: '', qty: '1', rate: '', type: 'labour' })

/**
 * Renders the billing screen where users can add labour and parts, calculate totals, and print the bill.
 * @returns {JSX.Element} The billing screen component.
 */
function BillingScreen({ job, onBack }) {
  const [items, setItems]         = useState([
    { id: 1, description: 'Labour charges', qty: '1', rate: '', type: 'labour' },
  ])
  const [discount, setDiscount]   = useState('')
  const [paid, setPaid]           = useState(false)
  const [payMode, setPayMode]     = useState('Cash')
  const [note, setNote]           = useState('')
  const [printed, setPrinted]     = useState(false)

  /**
   * Adds a new empty line item to the bill.
   * @param {string} type - The type of the item ('labour' or 'parts').
   */
  function addItem(type) {
    setItems(p => [...p, { ...emptyLineItem(), type }])
  }

  /**
   * Updates a specific field of an existing line item.
   * @param {number} id - The ID of the line item to update.
   * @param {string} field - The property to update (e.g., 'qty', 'rate').
   * @param {string} value - The new value for the property.
   */
  function updateItem(id, field, value) {
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  /**
   * Removes a line item from the bill.
   * @param {number} id - The ID of the line item to remove.
   */
  function removeItem(id) {
    setItems(p => p.filter(i => i.id !== id))
  }

  const subtotal   = items.reduce((sum, i) => sum + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0), 0)
  const discAmt    = parseFloat(discount) || 0
  const total      = Math.max(0, subtotal - discAmt)
  const labourAmt  = items.filter(i => i.type === 'labour').reduce((s, i) => s + (parseFloat(i.qty)||0)*(parseFloat(i.rate)||0), 0)
  const partsAmt   = items.filter(i => i.type === 'parts').reduce((s, i)  => s + (parseFloat(i.qty)||0)*(parseFloat(i.rate)||0), 0)

  /** Prepares a summary message and opens WhatsApp to send the bill to the customer. */
  function handleWhatsApp() {
    const lines = items.map(i => `  • ${i.description}: ₹${((parseFloat(i.qty)||0)*(parseFloat(i.rate)||0)).toFixed(0)}`).join('\n')
    const msg = `Hello ${job.customerName} 👋\n\n*Bill from JW Tuned*\nJob: ${job.id}\nVehicle: ${job.regNumber} (${job.makeModel})\n\n${lines}\n\nSubtotal: ₹${subtotal.toFixed(0)}${discAmt ? `\nDiscount: -₹${discAmt}` : ''}\n*Total: ₹${total.toFixed(0)}*\n\nPayment: ${paid ? `Paid via ${payMode} ✅` : 'Pending 🔴'}\n\nThank you for choosing JW Tuned! 🔧`
    window.open(`https://wa.me/${job.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  

// inside BillingScreen, replace handlePrint:
/** Triggers the generation and printing of the job bill. */
function handlePrint() {
  printBill({ job, items, discount, paid, payMode, note })
}

  return (
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh', background: '#050505' }}>

      {/* Header */}
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 5% 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>🧾 Create Bill</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{job.id} · {job.regNumber}</div>
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
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{d.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{d.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Line items */}
        <Card title="🔩 Labour & Parts">
          {items.map((item, idx) => (
            <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                  {item.type === 'labour' ? '🔧 Labour' : '🔩 Parts'}
                </span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
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
                <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'right' }}>
                  = ₹{((parseFloat(item.qty)||0) * (parseFloat(item.rate)||0)).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          ))}

          {/* Add item buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => addItem('labour')} style={{ height: 40, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Labour
            </button>
            <button onClick={() => addItem('parts')} style={{ height: 40, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Parts
            </button>
          </div>
        </Card>

        {/* Totals */}
        <Card title="💰 Amount">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span>🔧 Labour</span><span style={{ fontWeight: 600, color: '#fff' }}>₹{labourAmt.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span>🔩 Parts</span><span style={{ fontWeight: 600, color: '#fff' }}>₹{partsAmt.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span>Subtotal</span><span style={{ fontWeight: 600, color: '#fff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <Field label="Discount (₹)">
            <input placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} inputMode="numeric" />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', marginTop: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </Card>

        {/* Payment */}
        <Card title="💳 Payment">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setPaid(!paid)}
              style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${paid ? '#fff' : 'rgba(255,255,255,0.2)'}`, background: paid ? '#fff' : 'transparent', color: paid ? '#050505' : 'transparent', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {paid ? '✓' : ''}
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: paid ? '#fff' : 'rgba(255,255,255,0.5)' }}>
              {paid ? 'Payment received' : 'Mark as paid'}
            </span>
          </div>

          {paid && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Payment mode</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Cash', 'UPI', 'Card'].map(m => (
                  <button key={m} onClick={() => setPayMode(m)} style={{ flex: 1, height: 38, borderRadius: 10, border: `1px solid ${payMode === m ? '#fff' : 'rgba(255,255,255,0.1)'}`, background: payMode === m ? '#fff' : 'rgba(255,255,255,0.03)', color: payMode === m ? '#050505' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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
        <button onClick={handleWhatsApp} style={{ width: '100%', height: 52, background: '#fff', color: '#050505', border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 12, boxShadow: '0 8px 24px rgba(255,255,255,0.15)' }}>
          💬 Send Bill on WhatsApp
        </button>
        <button onClick={handlePrint} style={{ width: '100%', height: 48, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}>
          🖨️ Print Bill
        </button>
        <button onClick={onBack} style={{ width: '100%', height: 44, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          ← Back
        </button>
      </div>
    </div>
  )
}

// ── SCREEN 2 — FORM ──────────────────────────────────────────
/**
 * Renders the form to create or edit a job card.
 * @returns {JSX.Element} The job card form component.
 */
function JobCardForm({ initialData, onSave, onBack, mechanics }) {
  const [vehicleType, setVehicleType] = useState(initialData?.vehicleType || '4W')
  const [form, setForm]               = useState(initialData ? { ...initialData } : { ...emptyForm })
  const [saving, setSaving]           = useState(false)

  /** Updates a specific field in the job card form data. */
  function handleChange(field, value) { setForm(p => ({ ...p, [field]: value })) }

  /** Validates the form data and triggers the save callback. */
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
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh', background: '#050505' }}>
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 5% 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{initialData ? 'Edit Job Card' : 'New Job Card'}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{initialData?.id || 'Fill in the details below'}</div>
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
              <button key={val} onClick={() => setVehicleType(val)} style={{ height: 44, borderRadius: 10, border: `1px solid ${vehicleType === val ? '#fff' : 'rgba(255,255,255,0.1)'}`, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: vehicleType === val ? '#fff' : 'rgba(255,255,255,0.03)', color: vehicleType === val ? '#050505' : 'rgba(255,255,255,0.5)' }}>
                {label}
              </button>
            ))}
          </div>
          <Field label="Registration Number *"><input placeholder="KL 05 AH 7823" value={form.regNumber} onChange={e => handleChange('regNumber', e.target.value.toUpperCase())} style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }} /></Field>
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
            <Field label="Mechanic">
              <select value={form.mechanic} onChange={e => handleChange('mechanic', e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8, padding: '12px 14px', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}>
                <option value="" style={{ background: '#1a1a1a', color: '#fff' }}>— Select —</option>
                {mechanics?.map(m => <option key={m.id} value={m.name} style={{ background: '#1a1a1a', color: '#fff' }}>{m.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Expected Delivery"><input placeholder="Today 5:00 PM" value={form.deliveryTime} onChange={e => handleChange('deliveryTime', e.target.value)} /></Field>
          <Field label="Status">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 2 }}>
              {['Waiting','In Progress','Ready','Delivered'].map(s => {
                const active = form.status === s; const c = STATUS[s]
                return (
                  <button key={s} onClick={() => handleChange('status', s)} style={{ padding: '8px 4px', borderRadius: 10, border: `1px solid ${active ? c.dot : 'rgba(255,255,255,0.1)'}`, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: active ? c.bg : 'rgba(255,255,255,0.03)', color: active ? c.color : 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
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

        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52, background: saving ? 'rgba(255,255,255,0.1)' : '#fff', color: saving ? 'rgba(255,255,255,0.5)' : '#050505', border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 8px 24px rgba(255,255,255,0.15)', marginBottom: 12 }}>
          {saving ? <><img src={jwLogo} alt="" style={{ width: 20, height: 20, marginRight: 8, animation: 'spin 1.2s linear infinite', objectFit: 'contain' }} /> Saving...</> : `💾 ${initialData ? 'Update Job Card' : 'Save Job Card'}`}
        </button>
        <button onClick={onBack} style={{ width: '100%', height: 44, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

// ── IMAGE UPLOADER ───────────────────────────────────────────
/**
 * Component to handle selecting and displaying multiple photo uploads.
 * @returns {JSX.Element} The image uploader component.
 */
function ImageUploader({ photos, onChange }) {
  const [viewing, setViewing] = useState(null)

  /**
   * Reads the selected files and converts them to data URLs before adding them to the photos list.
   * @param {Event} e - The file input change event.
   */
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
            <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
              <img src={photo.url} alt="Vehicle" onClick={() => setViewing(photo)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
              <button onClick={() => onChange(photos.filter(p => p.id !== photo.id))} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          ))}
        </div>
      )}
      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, height: 80, borderRadius: 12, border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
        <span style={{ fontSize: 24 }}>📷</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Add photos</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Camera or gallery · tap to upload</span>
        <input type="file" accept="image/*" multiple capture="environment" onChange={handleFiles} style={{ display: 'none' }} />
      </label>
      {photos.length > 0 && <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>{photos.length} photo{photos.length > 1 ? 's' : ''} · tap to view</div>}
      {viewing && <PhotoViewer photo={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}

// ── PHOTO VIEWER ─────────────────────────────────────────────
/**
 * A full-screen modal component for viewing a selected photo.
 * @returns {JSX.Element} The photo viewer modal.
 */
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
/**
 * A reusable card container component for grouping form sections.
 * @returns {JSX.Element}
 */
function Card({ title, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  )
}

/**
 * A reusable input field wrapper component with a label.
 * @returns {JSX.Element}
 */
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>{label}</label>
      {children}
    </div>
  )
}