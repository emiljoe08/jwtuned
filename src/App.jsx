
import { useState, useEffect, Component } from 'react'
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
import CustomerHistory from './CustomerHistory'
import InstallPrompt from './InstallPrompt'
import InspectionChecklist from './InspectionChecklist'
import FeedbackScreen from './FeedbackScreen'
import ServiceReminders from './ServiceReminders'
import VehiclePassport from './VehiclePassport'
import { toDb, fromDb } from './shared'
import { saveJobsToCache, loadJobsFromCache, saveMechanicsToCache, loadMechanicsFromCache } from './offlineCache'



class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ color: '#FCA5A5', padding: 40, textAlign: 'center' }}><h2>Something went wrong.</h2><p>Please check the console for more details.</p></div>
    }
    return this.props.children
  }
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

function InspectJobWrapper({ jobs, onSave, onBack }) {
  const { id } = useParams()
  const job = jobs.find(j => j.id === id)
  if (!job) return <div style={{ padding: 40, textAlign: 'center' }}>Job not found...</div>
  return <InspectionChecklist job={job} onSave={onSave} onBack={onBack} />
}

function ProtectedRoute({ dataLoaded, children }) {
  const location = useLocation()
  if (!dataLoaded) {
    return <Navigate to="/loading" replace state={{ redirectTo: location.pathname }} />
  }
  return children
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

    if (!role && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/loading') {
      navigate('/login', { replace: true })
    }
  }, [location.pathname, navigate])

  async function loadData() {
    setError(null)
    try {
      const [jobsRes, mechRes] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('mechanics').select('*').order('name')
      ])
      if (jobsRes.error) throw jobsRes.error

      const fetchedJobs = jobsRes.data || []
      setJobs(fetchedJobs.map(fromDb))
      const nums = fetchedJobs.map(r => parseInt(r.id?.split('-')[2])).filter(n => !isNaN(n))
      counter = nums.length > 0 ? Math.max(...nums) + 1 : 1

      if (mechRes.data) setMechanics(mechRes.data)

      // Persist to IndexedDB for offline access
      saveJobsToCache(fetchedJobs)
      if (mechRes.data) saveMechanicsToCache(mechRes.data)
    } catch (err) {
      console.warn('[App] Network load failed, trying offline cache:', err)
      // Fall back to IndexedDB
      const cachedJobs = await loadJobsFromCache()
      const cachedMechanics = await loadMechanicsFromCache()
      if (cachedJobs.length > 0) {
        setJobs(cachedJobs.map(fromDb))
        const nums = cachedJobs.map(r => parseInt(r.id?.split('-')[2])).filter(n => !isNaN(n))
        counter = nums.length > 0 ? Math.max(...nums) + 1 : 1
      } else {
        setError('Could not load jobs and no offline cache is available.')
      }
      if (cachedMechanics.length > 0) setMechanics(cachedMechanics)
    }
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
    let updateFields = { status }
    const job = jobs.find(j => j.id === id)

    if (status === 'In Progress' && job) {
      const currentInspection = job.inspection || {}
      if (!currentInspection.timerStartedAt) {
        updateFields.inspection = {
          ...currentInspection,
          timerStartedAt: new Date().toISOString()
        }
      }
    }

    const { error } = await supabase.from('jobs').update(updateFields).eq('id', id)
    if (error) { alert('Error: ' + error.message); return false }
    
    // Auto-send WhatsApp message on status change to 'Delivered'
    if (job && status === 'Delivered') {
      const feedbackUrl = `${window.location.origin}/feedback/${job.id}`
      const msg = `Hello ${job.customerName} 👋\n\nYour vehicle *${job.regNumber}* (${job.makeModel}) has been delivered! 🎉\n\nWe hope you had a great experience with JW Tuned. Please take 10 seconds to share your feedback and rate us (1-5 stars) here:\n${feedbackUrl}\n\nThank you! 🔧`
      const phoneClean = job.phone ? job.phone.replace(/\D/g, '') : ''
      window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank')
    }

    setJobs(p => p.map(j => j.id === id ? { ...j, ...updateFields } : j))
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

  function saveInspection(jobId, inspection) {
    setJobs(p => p.map(j => j.id === jobId ? { ...j, inspection } : j))
  }

  return (
    <ErrorBoundary>
      <InstallPrompt />
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

        <Route path="/dashboard" element={
          <ProtectedRoute dataLoaded={dataLoaded}>
              <JobList
                onNew={() => navigate('/jobs/new')}
                onEdit={(job) => {
                  if (job.status === 'Delivered' && !isManager) return alert('Delivered jobs cannot be edited by staff.')
                  navigate(`/jobs/${job.id}/edit`)
                }}
                onBill={(job) => navigate(`/jobs/${job.id}/bill`)}
                onInspect={(job) => navigate(`/jobs/${job.id}/inspect`)}
                onDelete={deleteJob}
                onStatusChange={updateStatus}
                isManager={isManager}
                onManagerView={() => navigate('/manager')}
                onScreen={(s) => navigate(`/${s}`)}
                onLogout={handleLogout}
              />
          </ProtectedRoute>
        } />
        
        <Route path="/jobs/new" element={
          <ProtectedRoute dataLoaded={dataLoaded}>
              <JobCardForm initialData={null} onSave={(f, v) => saveJob(f, v, null)} onBack={() => navigate('/dashboard')} mechanics={mechanics} isManager={isManager} />
          </ProtectedRoute>
        } />
        
        <Route path="/jobs/:id/edit" element={
          <ProtectedRoute dataLoaded={dataLoaded}>
              <EditJobWrapper jobs={jobs} onSave={saveJob} onBack={() => navigate('/dashboard')} mechanics={mechanics} isManager={isManager} />
          </ProtectedRoute>
        } />
        
        <Route path="/jobs/:id/bill" element={
          <ProtectedRoute dataLoaded={dataLoaded}>
              <BillJobWrapper jobs={jobs} onBack={() => navigate('/dashboard')} />
          </ProtectedRoute>
        } />

        <Route path="/jobs/:id/inspect" element={
          <ProtectedRoute dataLoaded={dataLoaded}>
              <InspectJobWrapper jobs={jobs} onSave={saveInspection} onBack={() => navigate('/dashboard')} />
          </ProtectedRoute>
        } />
        
        <Route path="/history" element={<ProtectedRoute dataLoaded={dataLoaded}><CustomerHistory onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute dataLoaded={dataLoaded}><RevenueReports onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute dataLoaded={dataLoaded}><ServiceReminders onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
        <Route path="/passport/:regNumber" element={<VehiclePassport />} />
        
        <Route path="/manager" element={
          <ProtectedRoute dataLoaded={dataLoaded}>
              <ManagerDashboard
                jobs={jobs}
                mechanics={mechanics}
                onStatusChange={updateStatus}
                onAssign={assignMechanic}
                onBill={(job) => navigate(`/jobs/${job.id}/bill`)}
                onBack={() => navigate('/dashboard')}
              />
          </ProtectedRoute>
        } />

        <Route path="/feedback/:id" element={<FeedbackScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}