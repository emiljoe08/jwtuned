import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { supabase } from './supabase'
import jwLogo from './assets/jjw.svg'
import { STATUS, fromDb, PhotoViewer } from './shared'
import { saveJobsToCache, loadJobsFromCache, getCacheTimestamp } from './offlineCache'

/**
 * Renders the dashboard list of job cards, including statistics and filters.
 * @returns {JSX.Element} The job list screen component.
 */
export default function JobList({ onNew, onEdit, onBill, onInspect, onDelete, onStatusChange, isManager, onManagerView, onScreen, onLogout }) {
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15
  const observerTarget = useRef(null)
  const tabs     = ['All', 'Waiting', 'In Progress', 'Ready', 'Delivered']
  
  const [serverJobs, setServerJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [stats, setStats] = useState({ total: 0, waiting: 0, inProgress: 0, ready: 0 })
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [cacheTime, setCacheTime] = useState(null)

  // Track online/offline status
  useEffect(() => {
    const goOnline = () => { setIsOffline(false); handleRefresh() }
    const goOffline = () => setIsOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])


  async function loadStats() {
    try {
      const getCount = async (status) => {
        let q = supabase.from('jobs').select('id', { count: 'exact', head: true })
        if (status !== 'All') q = q.eq('status', status)
        const { count } = await q
        return count || 0
      }
      const [total, waiting, inProgress, ready] = await Promise.all([
        getCount('All'), getCount('Waiting'), getCount('In Progress'), getCount('Ready')
      ])
      setStats({ total, waiting, inProgress, ready })
    } catch {
      // Offline — derive stats from cached data
      const cached = await loadJobsFromCache()
      if (cached.length > 0) {
        const mapped = cached.map(fromDb)
        setStats({
          total: mapped.length,
          waiting: mapped.filter(j => j.status === 'Waiting').length,
          inProgress: mapped.filter(j => j.status === 'In Progress').length,
          ready: mapped.filter(j => j.status === 'Ready').length,
        })
      }
    }
  }

  async function loadJobs(currentPage, isReset = false) {
    setLoading(true); setError(null)
    let q = supabase.from('jobs').select('*', { count: 'exact' })
    
    if (filter !== 'All') q = q.eq('status', filter)
    if (searchQuery.trim()) {
      const sq = `%${searchQuery.trim()}%`
      q = q.or(`customer_name.ilike.${sq},reg_number.ilike.${sq}`)
    }
    
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    q = q.order('created_at', { ascending: false }).range(from, to)
    
    try {
      const { data, count, error: fetchError } = await q
      if (fetchError) throw fetchError

      const mapped = (data || []).map(fromDb)
      setServerJobs(prev => isReset ? mapped : [...prev, ...mapped])
      setHasMore(to < (count - 1))
      setIsOffline(false)

      // Persist full unfiltered page-1 data to IndexedDB
      if (isReset && filter === 'All' && !searchQuery.trim()) {
        saveJobsToCache(data || [])
      }
    } catch (fetchError) {
      // Network/Supabase failure → try IndexedDB cache
      const cached = await loadJobsFromCache()
      if (cached.length > 0) {
        let filtered = cached.map(fromDb)
        if (filter !== 'All') filtered = filtered.filter(j => j.status === filter)
        if (searchQuery.trim()) {
          const sq = searchQuery.trim().toLowerCase()
          filtered = filtered.filter(j =>
            j.customerName?.toLowerCase().includes(sq) ||
            j.regNumber?.toLowerCase().includes(sq)
          )
        }
        setServerJobs(filtered)
        setHasMore(false)
        setIsOffline(true)
        const ts = await getCacheTimestamp()
        setCacheTime(ts)
      } else {
        setError(fetchError.message || 'Network error — no cached data available.')
      }
    }
    setLoading(false)
  }

  function handleRefresh() {
    setPage(1)
    loadJobs(1, true)
    loadStats()
  }

  useEffect(() => { loadStats() }, [])
  
  // Fetch jobs when filter/search changes (debounced by 300ms)
  useEffect(() => { 
    const timer = setTimeout(() => {
      setPage(1); loadJobs(1, true) 
    }, 300)
    return () => clearTimeout(timer)
  }, [filter, searchQuery])

  useEffect(() => { if (page > 1) loadJobs(page) }, [page])

  const handleLocalStatusChange = useCallback(async (id, status) => {
    const success = await onStatusChange(id, status)
    if (success) {
      setServerJobs(p => p.map(j => j.id === id ? { ...j, status } : j))
      loadStats()
    }
  }, [onStatusChange])

  const handleLocalDelete = useCallback(async (job) => {
    const success = await onDelete(job)
    if (success) {
      setServerJobs(p => p.filter(j => j.id !== job.id))
      loadStats()
    }
  }, [onDelete])


  // Setup the IntersectionObserver for infinite scrolling
  useEffect(() => {
    const target = observerTarget.current
    const observer = new IntersectionObserver(
      entries => {
        // If the sentinel is visible and there are more jobs, load the next page
        if (entries[0].isIntersecting && hasMore) setPage(p => p + 1)
      },
      { rootMargin: '150px' } // Load slightly before they actually hit the absolute bottom
    )

    if (target) observer.observe(target)
    return () => {
      if (target) observer.unobserve(target)
    }
  }, [hasMore])

  // Format relative time for offline banner
  function formatTimeAgo(isoStr) {
    if (!isoStr) return ''
    const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    return `${Math.floor(diff / 86400)} day(s) ago`
  }

  return (
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh', background: '#050505' }}>
      <style>{`
        .stats-grid { grid-template-columns: repeat(4, 1fr); }
        .joblist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .joblist-header { flex-direction: column; align-items: flex-start; }
          .joblist-actions { width: 100%; justify-content: flex-start; }
        }
        @keyframes offlinePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* ── Offline Banner ── */}
      {isOffline && serverJobs.length > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.12)',
          borderBottom: '1px solid rgba(245,158,11,0.25)',
          padding: '10px 5%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 16, animation: 'offlinePulse 2s ease-in-out infinite' }}>📡</span>
          <div>
            <div style={{ color: '#FCD34D', fontSize: 13, fontWeight: 600 }}>Offline — showing cached jobs</div>
            {cacheTime && (
              <div style={{ color: 'rgba(252,211,77,0.6)', fontSize: 11, marginTop: 1 }}>
                Last synced {formatTimeAgo(cacheTime)}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 5% 24px' }}>
        <div className="joblist-header">
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={jwLogo} alt="Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              JW Tuned
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>Garage Management</div>
          </div>
         <div className="joblist-actions" style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
  <button onClick={handleRefresh} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', borderRadius:10, width:36, height:36, fontSize:16, cursor:'pointer' }}>↻</button>
  {isManager && (
    <button onClick={onManagerView} style={{ background:'rgba(232,49,10,0.1)', border:'1px solid rgba(232,49,10,0.3)', color:'#E8310A', borderRadius:10, padding:'8px 12px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>📊 Manager</button>
  )}
  {isManager && (
    <button onClick={() => onScreen('reports')} style={{ background:'rgba(252,211,77,0.1)', border:'1px solid rgba(252,211,77,0.2)', color:'#FCD34D', borderRadius:10, padding:'8px 12px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>📈 Reports</button>
  )}
  <button onClick={() => onScreen('history')} style={{ background:'rgba(147,197,253,0.1)', border:'1px solid rgba(147,197,253,0.2)', color:'#93C5FD', borderRadius:10, padding:'8px 12px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>🔍 History</button>
  <button onClick={onNew} style={{ background:'#fff', color:'#050505', border:'none', borderRadius:10, padding:'8px 16px', fontWeight:600, fontSize:13, cursor:'pointer' }}>+ New Job</button>
  <button onClick={onLogout} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#F87171', borderRadius:10, padding:'8px 12px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', marginLeft: 8 }}>🚪 Logout</button>
</div>
        </div>
        <div className="stats-grid" style={{ display: 'grid', gap: 8 }}>
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
            const count  = t === 'All' ? stats.total : t === 'Waiting' ? stats.waiting : t === 'In Progress' ? stats.inProgress : t === 'Ready' ? stats.ready : 0
            const active = filter === t
            return (
              <button key={t} onClick={() => setFilter(t)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 99, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: active ? '#fff' : 'rgba(255,255,255,0.03)', color: active ? '#050505' : 'rgba(255,255,255,0.5)', borderColor: active ? '#fff' : 'rgba(255,255,255,0.1)', boxShadow: active ? '0 4px 12px rgba(255,255,255,0.15)' : 'none' }}>
                {t !== 'All' && STATUS[t] && <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#050505' : STATUS[t].dot }} />}
                {t} {(count > 0 && t !== 'Delivered') && <span style={{ background: active ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', color: active ? '#050505' : 'rgba(255,255,255,0.6)', padding: '0 5px', borderRadius: 99, fontSize: 10 }}>{count}</span>}
              </button>
            )
          })}
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: 14 }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search by customer name or reg number..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}><img src={jwLogo} alt="Loading" style={{ width: 36, height: 36, marginBottom: 12, animation: 'spin 1.2s linear infinite', opacity: 0.5 }} /><div style={{ fontSize: 14, fontWeight: 600 }}>Loading jobs...</div></div>}
        {error && !loading && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 12, padding: 16, textAlign: 'center', color: '#DC2626', marginBottom: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{error}</div>
            <button onClick={handleRefresh} style={{ marginTop: 8, padding: '6px 16px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Try again</button>
          </div>
        )}
        {!loading && !error && serverJobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: '#fff' }}>No jobs here</div>
            <div style={{ fontSize: 13 }}>Try a different filter or add a new job</div>
          </div>
        )}
        {serverJobs.map(job => (
          <JobRow key={job.id} job={job} onEdit={onEdit} onBill={onBill} onInspect={onInspect} onDelete={handleLocalDelete} onStatusChange={handleLocalStatusChange} isManager={isManager} />
        ))}
        {!loading && hasMore && (
          <div 
            ref={observerTarget} 
            style={{ width: '100%', padding: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <img src={jwLogo} alt="" style={{ width: 16, height: 16, animation: 'spin 1.2s linear infinite', opacity: 0.5 }} /> Loading more...
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Renders an individual job card row in the dashboard list.
 * @returns {JSX.Element} The job row component.
 */
const JobRow = memo(function JobRow({ job, onEdit, onBill, onInspect, onDelete, onStatusChange, isManager }) {
  const [expanded, setExpanded] = useState(false)
  const [viewing, setViewing]   = useState(null)
  const sc       = STATUS[job.status] || STATUS['Waiting']
  const statuses = ['Waiting', 'In Progress', 'Ready', 'Delivered']
  const isDeliveredAndNotManager = job.status === 'Delivered' && !isManager

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
          {job.inspection && <span style={{ fontSize: 10, color: '#6EE7B7', fontWeight: 600 }}>✅ Inspected</span>}
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{job.id}</span>
        </div>
      </div>

      {!expanded && (
        <div style={{ padding: '0 14px 12px' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: job.photos?.length > 0 ? 10 : 0 }}>
            💬 {job.complaint}
          </div>
          {job.photos && job.photos.length > 0 && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
              {job.photos.map(photo => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt="preview"
                  onClick={(e) => { e.stopPropagation(); setViewing(photo); }}
                  style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', cursor: 'pointer', flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }}
                />
              ))}
            </div>
          )}
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
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {statuses.map(s => {
                const active = job.status === s
                const c = STATUS[s]
                const disabled = s === 'Delivered' && !isManager && !active
                return (
                  <button key={s} disabled={disabled} onClick={() => onStatusChange(job.id, s)} style={{ flex: 1, padding: '6px 4px', borderRadius: 8, border: `1px solid ${active ? c.dot : 'rgba(255,255,255,0.1)'}`, fontSize: 10, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', background: active ? c.bg : 'rgba(255,255,255,0.03)', color: active ? c.color : 'rgba(255,255,255,0.5)', opacity: disabled ? 0.4 : 1 }}>
                    {s === 'In Progress' ? 'Active' : s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3 action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '0 14px 14px' }}>
  <button onClick={() => onEdit(job)} disabled={isDeliveredAndNotManager} style={{ height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', fontSize: 12, fontWeight: 600, cursor: isDeliveredAndNotManager ? 'not-allowed' : 'pointer', color: '#fff', opacity: isDeliveredAndNotManager ? 0.4 : 1 }}>✏️ Edit</button>
  <button onClick={() => onInspect(job)} style={{ height: 40, borderRadius: 10, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#93C5FD' }}>{job.inspection ? '✅ Inspect' : '🔍 Inspect'}</button>
  <button onClick={() => onDelete(job)} disabled={isDeliveredAndNotManager} style={{ height: 40, borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', fontSize: 12, fontWeight: 600, cursor: isDeliveredAndNotManager ? 'not-allowed' : 'pointer', color: '#F87171', opacity: isDeliveredAndNotManager ? 0.4 : 1 }}>🗑️ Del</button>
</div>
        </div>
      )}
      {viewing && <PhotoViewer photo={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
})