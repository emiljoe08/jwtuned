import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function RevenueReports({ onBack }) {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod]   = useState('month') // week | month | year | all
  const [view, setView]       = useState('overview') // overview | mechanics | vehicles

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
      setJobs(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Filter by period
  function filterByPeriod(jobList) {
    const now = new Date()
    return jobList.filter(j => {
      const d = new Date(j.created_at)
      if (period === 'week')  return (now - d) <= 7  * 24 * 60 * 60 * 1000
      if (period === 'month') return (now - d) <= 30 * 24 * 60 * 60 * 1000
      if (period === 'year')  return (now - d) <= 365 * 24 * 60 * 60 * 1000
      return true
    })
  }

  const filtered = filterByPeriod(jobs)
  const delivered = filtered.filter(j => j.status === 'Delivered')
  const active    = filtered.filter(j => j.status !== 'Delivered')

  // Revenue stats (we use estimate as revenue since billing is separate)
  const totalRevenue  = delivered.reduce((s, j) => s + (parseFloat(j.estimate) || 0), 0)
  const avgJobValue   = delivered.length ? totalRevenue / delivered.length : 0
  const twoWheelers   = filtered.filter(j => j.vehicle_type === '2W').length
  const fourWheelers  = filtered.filter(j => j.vehicle_type === '4W').length

  // Jobs by day (last 14 days)
  function jobsByDay() {
    const days = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' })
      const count = filtered.filter(j => {
        const jd = new Date(j.created_at)
        return jd.toDateString() === d.toDateString()
      }).length
      const rev = filtered.filter(j => {
        const jd = new Date(j.created_at)
        return jd.toDateString() === d.toDateString() && j.status === 'Delivered'
      }).reduce((s, j) => s + (parseFloat(j.estimate) || 0), 0)
      days.push({ label, count, rev })
    }
    return days
  }

  // By mechanic
  function byMechanic() {
    const map = {}
    filtered.forEach(j => {
      const name = j.mechanic || 'Unassigned'
      if (!map[name]) map[name] = { name, total: 0, delivered: 0, revenue: 0 }
      map[name].total++
      if (j.status === 'Delivered') { map[name].delivered++; map[name].revenue += parseFloat(j.estimate) || 0 }
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }

  // By service type (from complaint keywords)
  function byService() {
    const keywords = { 'Service': ['service','oil','filter'], 'AC': ['ac','cooling','aircon'], 'Brakes': ['brake','pad','disc'], 'Electrical': ['electrical','battery','wiring'], 'Tyre': ['tyre','puncture','wheel'], 'Suspension': ['suspension','shock'] }
    const map = { 'Other': 0 }
    Object.keys(keywords).forEach(k => map[k] = 0)
    filtered.forEach(j => {
      const complaint = (j.complaint || '').toLowerCase()
      let matched = false
      for (const [cat, words] of Object.entries(keywords)) {
        if (words.some(w => complaint.includes(w))) { map[cat]++; matched = true; break }
      }
      if (!matched) map['Other']++
    })
    return Object.entries(map).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1])
  }

  const days       = jobsByDay()
  const maxCount   = Math.max(...days.map(d => d.count), 1)
  const maxRev     = Math.max(...days.map(d => d.rev), 1)
  const mechStats  = byMechanic()
  const svcStats   = byService()

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#050505', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)' }}>
      Loading reports...
    </div>
  )

  return (
    <div style={{ width:'100%', minHeight:'100vh', background:'#050505' }}>
      <style>{`
        .rep-tab { padding:8px 16px; border:none; border-bottom:2px solid transparent; background:transparent; color:rgba(255,255,255,0.4); font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
        .rep-tab.active { color:#fff; border-bottom-color:#E8310A; }
        .period-btn { padding:6px 14px; border-radius:99px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.4); font-family:inherit; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .period-btn.active { background:#fff; color:#050505; border-color:#fff; }
        .stat-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:20px; }
        .bar-wrap { display:flex; flex-direction:column; align-items:center; gap:4; flex:1; min-width:0; }
        .bar { border-radius:4px 4px 0 0; width:100%; transition:height 0.3s ease; cursor:default; }
      `}</style>

      {/* Header */}
      <div style={{ background:'#0A0A0A', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'16px 5%' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <button onClick={onBack} style={{ width:36, height:36, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
          <div>
            <div style={{ color:'#E8310A', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:2 }}>Reports</div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:16 }}>Revenue & Analytics</div>
          </div>
        </div>

        {/* Period filter */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {[['week','7 Days'],['month','30 Days'],['year','This Year'],['all','All Time']].map(([k,l]) => (
            <button key={k} className={`period-btn${period===k?' active':''}`} onClick={() => setPeriod(k)}>{l}</button>
          ))}
        </div>

        {/* View tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          {[['overview','📊 Overview'],['mechanics','👨‍🔧 Mechanics'],['vehicles','🚗 Vehicles']].map(([k,l]) => (
            <button key={k} className={`rep-tab${view===k?' active':''}`} onClick={() => setView(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 5% 40px' }}>

        {/* ── OVERVIEW ── */}
        {view === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* KPI cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10 }}>
              {[
                { icon:'🧾', label:'Total Jobs', value: filtered.length, color:'#fff' },
                { icon:'✅', label:'Completed', value: delivered.length, color:'#6EE7B7' },
                { icon:'⚙️', label:'Active', value: active.length, color:'#93C5FD' },
                { icon:'💰', label:'Est. Revenue', value:`₹${totalRevenue.toLocaleString('en-IN')}`, color:'#FCD34D' },
                { icon:'📈', label:'Avg Job Value', value:`₹${Math.round(avgJobValue).toLocaleString('en-IN')}`, color:'#F9A8D4' },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ textAlign:'center' }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontSize:'clamp(18px,3vw,26px)', fontWeight:800, color:s.color, marginBottom:4 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Jobs per day chart */}
            <div className="stat-card">
              <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Jobs per day — last 14 days</div>
              <div style={{ display:'flex', gap:4, alignItems:'flex-end', height:120 }}>
                {days.map((d, i) => (
                  <div key={i} className="bar-wrap" title={`${d.label}: ${d.count} jobs`}>
                    <div className="bar" style={{ height: `${(d.count / maxCount) * 90 + (d.count > 0 ? 10 : 0)}px`, background: d.count > 0 ? 'linear-gradient(to top, #E8310A, #FF6B35)' : 'rgba(255,255,255,0.04)', minHeight:4 }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:4, marginTop:6 }}>
                {days.map((d, i) => (
                  <div key={i} style={{ flex:1, textAlign:'center', fontSize:9, color:'rgba(255,255,255,0.25)', whiteSpace:'nowrap', overflow:'hidden' }}>{d.label.split(' ')[0]}</div>
                ))}
              </div>
            </div>

            {/* 2W vs 4W split */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div className="stat-card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🏍️</div>
                <div style={{ fontSize:28, fontWeight:800, color:'#93C5FD' }}>{twoWheelers}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4 }}>TWO-WHEELERS</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{filtered.length ? Math.round(twoWheelers/filtered.length*100) : 0}% of jobs</div>
              </div>
              <div className="stat-card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🚗</div>
                <div style={{ fontSize:28, fontWeight:800, color:'#FCD34D' }}>{fourWheelers}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4 }}>FOUR-WHEELERS</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{filtered.length ? Math.round(fourWheelers/filtered.length*100) : 0}% of jobs</div>
              </div>
            </div>

            {/* Service type breakdown */}
            <div className="stat-card">
              <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Common service types</div>
              {svcStats.map(([name, count]) => (
                <div key={name} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:13, color:'#fff', fontWeight:600 }}>{name}</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{count} jobs</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(count/filtered.length)*100}%`, background:'linear-gradient(90deg,#E8310A,#FF6B35)', borderRadius:99, transition:'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MECHANICS VIEW ── */}
        {view === 'mechanics' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {mechStats.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.3)' }}>No data for this period</div>
            )}
            {mechStats.map(m => (
              <div key={m.name} className="stat-card">
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                    {m.name === 'Unassigned' ? '⚠️' : '👨‍🔧'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{m.name}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{m.total} jobs · {m.delivered} completed</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'#FCD34D' }}>₹{m.revenue.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>Est. revenue</div>
                  </div>
                </div>
                {/* Completion bar */}
                <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${m.total ? (m.delivered/m.total)*100 : 0}%`, background:'linear-gradient(90deg,#22C55E,#6EE7B7)', borderRadius:99, transition:'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:5, textAlign:'right' }}>
                  {m.total ? Math.round((m.delivered/m.total)*100) : 0}% completion rate
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── VEHICLES VIEW ── */}
        {view === 'vehicles' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>
              Top returning vehicles in this period
            </div>
            {(() => {
              const vMap = {}
              filtered.forEach(j => {
                const k = j.reg_number
                if (!vMap[k]) vMap[k] = { reg: k, model: j.make_model, customer: j.customer_name, type: j.vehicle_type, count: 0, revenue: 0 }
                vMap[k].count++
                if (j.status === 'Delivered') vMap[k].revenue += parseFloat(j.estimate) || 0
              })
              return Object.values(vMap).sort((a,b) => b.count - a.count).slice(0, 20).map(v => (
                <div key={v.reg} className="stat-card" style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:28 }}>{v.type === '2W' ? '🏍️' : '🚗'}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:'#fff', fontFamily:'monospace', letterSpacing:'0.05em' }}>{v.reg}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{v.model} · {v.customer}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{v.count}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>visits</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'#FCD34D' }}>₹{v.revenue.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>revenue</div>
                  </div>
                </div>
              ))
            })()}
          </div>
        )}
      </div>
    </div>
  )
}