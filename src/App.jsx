
import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import LoadingScreen from './LoadingScreen'
import LandingPage from './LandingPage'
import jwLogo from './assets/jjw.svg'
import LoginScreen from './LoginScreen'
import RevenueReports from './RevenueReports'
import ManagerDashboard from './ManagerDashboard'
import BillingScreen from './BillingScreen'
import JobList from './JobList'
import JobCardForm from './JobCardForm'
import { toDb, fromDb } from './shared'




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

// ── APP ──────────────────────────────────────────────────────
/**
 * Main Application component that handles state and routing between landing, login, loading, and dashboard.
 * @returns {JSX.Element} The rendered application component.
 */
export default function App({ startAtDashboard = false }) {
  const [appState, setAppState] = useState(() => localStorage.getItem('jw_auth_role') ? 'loading' : (startAtDashboard ? 'login' : 'landing'))
const [loginError, setLoginError]     = useState('')
  const [isManager, setIsManager]       = useState(() => localStorage.getItem('jw_auth_role') === 'manager')
  const [screen, setScreen]             = useState(() => localStorage.getItem('jw_screen') || 'list')
const [jobs, setJobs]                 = useState([])
const [mechanics, setMechanics]       = useState([])     // ← add this
  const [editingJobId, setEditingJobId] = useState(() => localStorage.getItem('jw_edit_id') || null)
  const [billingJobId, setBillingJobId] = useState(() => localStorage.getItem('jw_bill_id') || null)
const [loading, setLoading]           = useState(true)
const [error, setError]               = useState(null)

  useEffect(() => {
    // Request desktop notification permissions on initial load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Persist current screen and active jobs to local storage
  useEffect(() => {
    localStorage.setItem('jw_screen', screen)
  }, [screen])

  useEffect(() => {
    if (editingJobId) localStorage.setItem('jw_edit_id', editingJobId)
    else localStorage.removeItem('jw_edit_id')
  }, [editingJobId])

  useEffect(() => {
    if (billingJobId) localStorage.setItem('jw_bill_id', billingJobId)
    else localStorage.removeItem('jw_bill_id')
  }, [billingJobId])

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
        const fetchedJobs = jobsRes.data || []
        setJobs(fetchedJobs.map(fromDb))
        const nums = fetchedJobs.map(r => parseInt(r.id?.split('-')[2])).filter(n => !isNaN(n))
        counter = nums.length > 0 ? Math.max(...nums) + 1 : 1
      }
      if (mechRes.data) setMechanics(mechRes.data)
      setLoading(false)
    }
    load()

    // Subscribe to real-time new jobs
    const channel = supabase
      .channel('public:jobs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'jobs' },
        (payload) => {
          const newJob = payload.new
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Job Added 🚗', {
              body: `${newJob.customer_name} added a ${newJob.make_model} (${newJob.reg_number}).`,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}, [appState])

  // ── ALL FUNCTIONS DEFINED HERE FIRST ──
  /**
   * Validates the login password and updates the application state.
   * @param {string} password - The entered password.
   */
  function handleLogin(password) {
  if (password === 'jwtuned2024') {
    localStorage.setItem('jw_auth_role', 'staff')
    setLoginError(''); setIsManager(false); setAppState('loading')
  } else if (password === 'jwmanager2024') {
    localStorage.setItem('jw_auth_role', 'manager')
    setLoginError(''); setIsManager(true); setAppState('loading')
  } else {
    setLoginError('Wrong password. Try again.')
  }
}

  /**
   * Opens the form to create a new job card.
   */
  function openNew()     { setEditingJobId(null); setScreen('form') }

  /**
   * Opens the form to edit an existing job card.
   * @param {Object} job - The job to edit.
   */
  function openEdit(job) {
    if (job.status === 'Delivered' && !isManager) {
      alert('Delivered jobs cannot be edited by staff.');
      return;
    }
    setEditingJobId(job.id);  setScreen('form')
  }

  /**
   * Opens the billing screen for a specific job.
   * @param {Object} job - The job to bill.
   */
  function openBill(job) { setBillingJobId(job.id);  setScreen('bill') }

  /**
   * Saves a new or edited job card to the database and updates local state.
   * @param {Object} form - The job form data.
   * @param {string} vehicleType - The selected vehicle type.
   */
  async function saveJob(form, vehicleType) {
    const id  = editingJobId ? editingJobId : generateId()
    const row = toDb(form, vehicleType, id)

    // Add new mechanic to roster if entered
    if (form.mechanic && !mechanics.some(m => m.name === form.mechanic)) {
      const { data: newMech } = await supabase.from('mechanics').insert({ name: form.mechanic }).select().single()
      if (newMech) setMechanics(p => [...p, newMech].sort((a, b) => a.name.localeCompare(b.name)))
    }

    if (editingJobId) {
      const { error } = await supabase.from('jobs').update(row).eq('id', id)
      if (error) { alert('Error: ' + error.message); return }
      setJobs(p => p.map(j => j.id === id ? fromDb(row) : j))
    } else {
      const { error } = await supabase.from('jobs').insert(row)
      if (error) { alert('Error: ' + error.message); return }
      setJobs(p => [fromDb(row), ...p])
    }
    setEditingJobId(null)
    setScreen('list')
  }

  /**
   * Deletes a job card from the database after user confirmation.
   * @param {Object} job - The job object to delete.
   */
  async function deleteJob(job) {
    if (job.status === 'Delivered' && !isManager) {
      alert('Delivered jobs cannot be deleted by staff.');
      return false;
    }
    if (!window.confirm('Delete this job card?')) return false
    const { error } = await supabase.from('jobs').delete().eq('id', job.id)
    if (error) { alert('Error: ' + error.message); return false }
    setJobs(p => p.filter(j => j.id !== job.id))
    return true
  }

  /**
   * Updates the status of a job card in the database and local state.
   * @param {string} id - The ID of the job to update.
   * @param {string} status - The new status to set.
   */
  async function updateStatus(id, status) {
    const { error } = await supabase.from('jobs').update({ status }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return false }
    setJobs(p => p.map(j => j.id === id ? { ...j, status } : j))
    return true
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

const editingJob = editingJobId ? jobs.find(j => j.id === editingJobId) : null
const billingJob = billingJobId ? jobs.find(j => j.id === billingJobId) : null

if (screen === 'form') {
  if (editingJobId && !editingJob) {
    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Loading...</div>
    else { setScreen('list'); return null; }
  }
  return <JobCardForm initialData={editingJob} onSave={saveJob} onBack={() => { setEditingJobId(null); setScreen('list'); }} mechanics={mechanics} isManager={isManager} />
}
if (screen === 'bill') {
  if (!billingJob) {
    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Loading...</div>
    else { setScreen('list'); return null; }
  }
  return <BillingScreen job={billingJob} onBack={() => { setBillingJobId(null); setScreen('list'); }} />
}

if (screen === 'history')  return <CustomerHistory onBack={() => setScreen('list')} />
if (screen === 'reports')  return <RevenueReports onBack={() => setScreen('list')} />
if (screen === 'manager') return (
  <ManagerDashboard
    jobs={jobs}
    mechanics={mechanics}
    onStatusChange={updateStatus}
    onAssign={assignMechanic}
        onBill={openBill}
    onBack={() => setScreen('list')}
  />
)

return (
  <JobList
    onNew={openNew} onEdit={openEdit} onBill={openBill}
    onDelete={deleteJob} onStatusChange={updateStatus}
    isManager={isManager}
    onManagerView={() => setScreen('manager')}
    onScreen={setScreen}
    onLogout={() => { localStorage.removeItem('jw_auth_role'); setAppState('login'); setIsManager(false); setScreen('list'); }}
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