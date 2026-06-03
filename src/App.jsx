
import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom'
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

// ── ROUTE WRAPPERS ───────────────────────────────────────────
function EditJobWrapper({ jobs, onSave, onBack, mechanics, isManager }) {
  const { id } = useParams()
  const job = jobs.find(j => j.id === id)
  if (!job) return <div style={{ padding: 40, textAlign: 'center' }}>Job not found...</div>
  return <JobCardForm initialData={job} onSave={(f, v) => onSave(f, v, id)} onBack={onBack} mechanics={mechanics} isManager={isManager} />
}

function BillJobWrapper({ jobs, onBack }) {
  const { id } = useParams()
  const job = jobs.find(j => j.id === id)
  if (!job) return <div style={{ padding: 40, textAlign: 'center' }}>Job not found...</div>
  return <BillingScreen job={job} onBack={onBack} />
}

// ── APP ──────────────────────────────────────────────────────
/**
 * Main Application component that handles state and routing.
 * @returns {JSX.Element} The rendered application component.
 */
export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [loginError, setLoginError] = useState('')
  const [isManager, setIsManager]   = useState(() => localStorage.getItem('jw_auth_role') === 'manager')
  const [jobs, setJobs]             = useState([])
  const [mechanics, setMechanics]   = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [error, setError]           = useState(null)

  useEffect(() => {
    // Request desktop notification permissions on initial load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const role = localStorage.getItem('jw_auth_role')
    const publicPaths = ['/', '/login', '/loading']

    // Redirect unauthenticated users or users with unloaded data to appropriate initial setup
    if (!role && !publicPaths.includes(location.pathname)) {
      navigate('/login', { replace: true })
    } else if (role && !dataLoaded && !publicPaths.includes(location.pathname)) {
      navigate('/loading', { replace: true, state: { redirectTo: location.pathname } })
    }
  }, [dataLoaded, location.pathname, navigate])

  async function loadData() {
    setError(null)
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
    setDataLoaded(true)
  }

  useEffect(() => {
    if (!dataLoaded) return
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
  }, [dataLoaded])

  // ── ALL FUNCTIONS DEFINED HERE FIRST ──
  /**
   * Validates the login password and updates the application state.
   * @param {string} password - The entered password.
   */
  function handleLogin(password) {
  if (password === 'jwtuned2024') {
    localStorage.setItem('jw_auth_role', 'staff')
      setLoginError(''); setIsManager(false); navigate('/loading')
  } else if (password === 'jwmanager2024') {
    localStorage.setItem('jw_auth_role', 'manager')
      setLoginError(''); setIsManager(true); navigate('/loading')
  } else {
    setLoginError('Wrong password. Try again.')
  }
}

  function handleLogout() {
    localStorage.removeItem('jw_auth_role')
    setIsManager(false)
    setDataLoaded(false)
    navigate('/login', { replace: true })
  }

  /**
   * Saves a new or edited job card to the database and updates local state.
   * @param {Object} form - The job form data.
   * @param {string} vehicleType - The selected vehicle type.
   */
  async function saveJob(form, vehicleType, editId = null) {
    const id  = editId ? editId : generateId()
    const row = toDb(form, vehicleType, id)

    // Add new mechanic to roster if entered
    if (form.mechanic && !mechanics.some(m => m.name === form.mechanic)) {
      const { data: newMech } = await supabase.from('mechanics').insert({ name: form.mechanic }).select().single()
      if (newMech) setMechanics(p => [...p, newMech].sort((a, b) => a.name.localeCompare(b.name)))
    }

    if (editId) {
      const { error } = await supabase.from('jobs').update(row).eq('id', id)
      if (error) { alert('Error: ' + error.message); return }
      setJobs(p => p.map(j => j.id === id ? fromDb(row) : j))
    } else {
      const { error } = await supabase.from('jobs').insert(row)
      if (error) { alert('Error: ' + error.message); return }
      setJobs(p => [fromDb(row), ...p])
    }
    navigate('/dashboard')
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
      <Routes>
        <Route path="/" element={<LandingPage onEnter={() => navigate('/login')} />} />
        <Route path="/login" element={<LoginScreen onLogin={handleLogin} onBack={() => navigate('/')} error={loginError} />} />
        
        <Route path="/loading" element={
          <LoadingScreen onDone={() => {
            loadData().then(() => {
              const redirectTo = location.state?.redirectTo || '/dashboard'
              navigate(redirectTo, { replace: true })
            })
          }} />
        } />

        {dataLoaded && (
          <>
            <Route path="/dashboard" element={
              <JobList
                onNew={() => navigate('/jobs/new')}
                onEdit={(job) => {
                  if (job.status === 'Delivered' && !isManager) return alert('Delivered jobs cannot be edited by staff.')
                  navigate(`/jobs/${job.id}/edit`)
                }}
                onBill={(job) => navigate(`/jobs/${job.id}/bill`)}
                onDelete={deleteJob}
                onStatusChange={updateStatus}
                isManager={isManager}
                onManagerView={() => navigate('/manager')}
                onScreen={(s) => navigate(`/${s}`)}
                onLogout={handleLogout}
              />
            } />
            <Route path="/jobs/new" element={
              <JobCardForm initialData={null} onSave={(f, v) => saveJob(f, v, null)} onBack={() => navigate('/dashboard')} mechanics={mechanics} isManager={isManager} />
            } />
            <Route path="/jobs/:id/edit" element={
              <EditJobWrapper jobs={jobs} onSave={saveJob} onBack={() => navigate('/dashboard')} mechanics={mechanics} isManager={isManager} />
            } />
            <Route path="/jobs/:id/bill" element={
              <BillJobWrapper jobs={jobs} onBack={() => navigate('/dashboard')} />
            } />
            <Route path="/history" element={<CustomerHistory onBack={() => navigate('/dashboard')} />} />
            <Route path="/reports" element={<RevenueReports onBack={() => navigate('/dashboard')} />} />
            <Route path="/manager" element={
              <ManagerDashboard
                jobs={jobs}
                mechanics={mechanics}
                onStatusChange={updateStatus}
                onAssign={assignMechanic}
                onBill={(job) => navigate(`/jobs/${job.id}/bill`)}
                onBack={() => navigate('/dashboard')}
              />
            } />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}