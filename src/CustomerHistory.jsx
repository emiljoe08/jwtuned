import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function CustomerHistory({ onBack }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [selected, setSelected] = useState(null)
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setSearched(true); setSelected(null); setHistory([])
    const q = query.trim().toUpperCase()
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .or(`reg_number.ilike.%${q}%,customer_name.ilike.%${query.trim()}%,phone.ilike.%${query.trim()}%`)
      .order('created_at', { ascending: false })
    // Group by vehicle reg number
    const grouped = {}
    data?.forEach(row => {
      const key = row.reg_number
      if (!grouped[key]) grouped[key] = { regNumber: row.reg_number, makeModel: row.make_model, vehicleType: row.vehicle_type, customerName: row.customer_name, phone: row.phone, jobs: [] }
      grouped[key].jobs.push(row)
    })
    setResults(Object.values(grouped))
    setLoading(false)
  }

  function selectVehicle(vehicle) {
    setSelected(vehicle)
    setHistory(vehicle.jobs)
  }

  function sendReminder(vehicle) {
    const lastJob = vehicle.jobs[0]
    const msg = `Hello ${vehicle.customerName} 👋\n\nThis is a friendly reminder from *JW Tuned*, Kottayam.\n\nYour vehicle *${vehicle.regNumber}* (${vehicle.makeModel}) is due for its next service.\n\nLast serviced: ${new Date(lastJob.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n\nCall or WhatsApp us to book your next service 📞\n\n+91 9447403837`
    window.open(`https://wa.me/${vehicle.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#050505' }}>
      <style>{`
        .hist-input { width:100%; height:48px; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; font-family:inherit; font-size:15px; padding:0 16px; outline:none; transition:border-color 0.2s; }
        .hist-input:focus { border-color:#E8310A; }
        .hist-input::placeholder { color:rgba(255,255,255,0.25); }
        .veh-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:16px; cursor:pointer; transition:all 0.2s; margin-bottom:10px; }
        .veh-card:hover { border-color:rgba(255,255,255,0.18); background:rgba(255,255,255,0.04); }
        .veh-card.selected { border-color:#E8310A; background:rgba(232,49,10,0.05); }
        .timeline-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:4px; }
        .timeline-line { width:2px; background:rgba(255,255,255,0.06); flex-shrink:0; margin:0 4px; }
      `}</style>

      {/* Header */}
      <div style={{ background:'#0A0A0A', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'16px 5%' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <button onClick={onBack} style={{ width:36, height:36, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
          <div>
            <div style={{ color:'#E8310A', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:2 }}>Customer History</div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:16 }}>Search vehicles & send reminders</div>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ display:'flex', gap:10 }}>
          <input className="hist-input" placeholder="Search by reg number, name or phone..." value={query} onChange={e => setQuery(e.target.value)} />
          <button type="submit" style={{ height:48, padding:'0 24px', background:'#E8310A', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
            Search
          </button>
        </form>
      </div>

      <div style={{ padding:'16px 5% 40px', display:'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap:16 }}>

        {/* Results list */}
        <div>
          {loading && <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.4)' }}>Searching...</div>}

          {!loading && searched && results.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:15, marginBottom:6 }}>No results found</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Try searching by registration number, name or phone</div>
            </div>
          )}

          {!loading && !searched && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🚗</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>Search for a vehicle or customer above</div>
            </div>
          )}

          {results.map(v => (
            <div key={v.regNumber} className={`veh-card${selected?.regNumber === v.regNumber ? ' selected' : ''}`} onClick={() => selectVehicle(v)}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                  {v.vehicleType === '2W' ? '🏍️' : '🚗'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'#fff', marginBottom:2 }}>{v.customerName}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:'monospace', fontWeight:600 }}>{v.regNumber}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{v.makeModel}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{v.jobs.length}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.04em' }}>visits</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle history panel */}
        {selected && (
          <div>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, overflow:'hidden', marginBottom:12 }}>
              <div style={{ padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:16, color:'#fff', marginBottom:4 }}>{selected.regNumber}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:2 }}>{selected.makeModel}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>{selected.customerName} · {selected.phone}</div>
                </div>
                <button
                  onClick={() => sendReminder(selected)}
                  style={{ background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.3)', color:'#25D366', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0, display:'flex', alignItems:'center', gap:6 }}
                >
                  💬 Send Reminder
                </button>
              </div>

              <div style={{ padding:'16px' }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Service History ({history.length} visits)</div>

                {history.map((job, i) => {
                  const STATUS_COLORS = { 'Waiting':'#F59E0B','In Progress':'#3B82F6','Ready':'#22C55E','Delivered':'rgba(255,255,255,0.4)' }
                  return (
                    <div key={job.id} style={{ display:'flex', gap:12, marginBottom: i < history.length - 1 ? 0 : 0 }}>
                      {/* Timeline */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div className="timeline-dot" style={{ background: STATUS_COLORS[job.status] || '#fff' }} />
                        {i < history.length - 1 && <div className="timeline-line" style={{ flex:1, minHeight:32 }} />}
                      </div>
                      {/* Content */}
                      <div style={{ flex:1, paddingBottom: i < history.length - 1 ? 16 : 0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{job.complaint}</div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textAlign:'right', marginLeft:8, flexShrink:0 }}>
                            {new Date(job.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap', fontSize:11, color:'rgba(255,255,255,0.4)' }}>
                          <span>{job.id}</span>
                          <span>·</span>
                          <span>{job.odometer} km</span>
                          {job.mechanic && <><span>·</span><span>🔧 {job.mechanic}</span></>}
                          <span>·</span>
                          <span style={{ color: STATUS_COLORS[job.status] }}>{job.status}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}