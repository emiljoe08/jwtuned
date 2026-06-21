import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import jwLogo from './assets/jjw.svg'

/**
 * Service Reminders Dashboard.
 * Auto-detects vehicles due or upcoming for service based on date or projected mileage.
 */
export default function ServiceReminders({ onBack }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('due') // due | upcoming | snoozed

  async function loadReminders() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError

      // Group jobs by registration number to get unique vehicles
      const grouped = {}
      data?.forEach(job => {
        const reg = job.reg_number?.toUpperCase().trim()
        if (!reg) return
        if (!grouped[reg]) {
          grouped[reg] = {
            regNumber: reg,
            makeModel: job.make_model,
            vehicleType: job.vehicle_type,
            customerName: job.customer_name,
            phone: job.phone,
            jobs: []
          }
        }
        grouped[reg].jobs.push(job)
      })

      const vehicleList = Object.values(grouped).map(v => {
        // Sort jobs by creation date (newest first)
        const sortedJobs = [...v.jobs].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        const latestJob = sortedJobs[0]

        // Calculate days since last visit
        const lastVisitDate = new Date(latestJob.created_at)
        const daysSinceLast = Math.max(0, Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)))

        // Parse odometer values from history
        const parseOdo = (val) => {
          const num = parseFloat(String(val).replace(/[^0-9.]/g, ''))
          return isNaN(num) ? null : num
        }

        const jobsWithOdo = sortedJobs
          .map(j => ({ ...j, odo: parseOdo(j.odometer) }))
          .filter(j => j.odo !== null)

        // Calculate projected daily mileage
        let dailyAverage = 40 // Default standard daily mileage (km)
        let hasCustomDailyAverage = false

        if (jobsWithOdo.length >= 2) {
          // Sort oldest to newest for calculation
          const chronoJobs = [...jobsWithOdo].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          const oldest = chronoJobs[0]
          const newest = chronoJobs[chronoJobs.length - 1]

          const deltaKm = newest.odo - oldest.odo
          const deltaDays = (new Date(newest.created_at).getTime() - new Date(oldest.created_at).getTime()) / (1000 * 60 * 60 * 24)

          // Only calculate if elapsed time is reasonable (e.g. > 7 days) and mileage is positive
          if (deltaDays > 7 && deltaKm > 0) {
            dailyAverage = deltaKm / deltaDays
            hasCustomDailyAverage = true
          }
        }

        // Calculate estimated current odometer
        const latestOdo = parseOdo(latestJob.odometer) || 0
        const estimatedKmSinceLast = daysSinceLast * dailyAverage
        const estimatedCurrentOdo = Math.round(latestOdo + estimatedKmSinceLast)

        // Check last reminder sent date
        const lastReminderSentStr = latestJob.inspection?.lastReminderSent
        const lastReminderSent = lastReminderSentStr ? new Date(lastReminderSentStr) : null
        const daysSinceLastReminder = lastReminderSent 
          ? Math.floor((Date.now() - lastReminderSent.getTime()) / (1000 * 60 * 60 * 24))
          : null

        const isSnoozed = daysSinceLastReminder !== null && daysSinceLastReminder < 30

        // Determine if due or upcoming
        let isDue = false
        let isUpcoming = false
        let dueReasons = []

        if (!isSnoozed) {
          if (daysSinceLast >= 90) {
            isDue = true
            dueReasons.push(`90+ days since last service (${daysSinceLast} days)`)
          } else if (estimatedKmSinceLast >= 5000) {
            isDue = true
            dueReasons.push(`Projected mileage increased by 5,000+ km (+${Math.round(estimatedKmSinceLast)} km)`)
          } else if (daysSinceLast >= 60) {
            isUpcoming = true
            dueReasons.push(`Approaching 3 months since service (${daysSinceLast} days)`)
          } else if (estimatedKmSinceLast >= 3500) {
            isUpcoming = true
            dueReasons.push(`Projected mileage increased by 3,500+ km (+${Math.round(estimatedKmSinceLast)} km)`)
          }
        }

        return {
          ...v,
          latestJob,
          daysSinceLast,
          estimatedKmSinceLast,
          estimatedCurrentOdo,
          dailyAverage,
          hasCustomDailyAverage,
          lastReminderSent,
          daysSinceLastReminder,
          isSnoozed,
          isDue,
          isUpcoming,
          dueReason: dueReasons.join(' and ') || 'Regular follow-up'
        }
      })

      setVehicles(vehicleList)
    } catch (err) {
      setError(err.message || 'Failed to load reminders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()
  }, [])

  async function handleSendReminder(vehicle) {
    const lastJob = vehicle.latestJob
    const msg = `Hello ${vehicle.customerName} 👋\n\nThis is a friendly service follow-up from *JW Tuned*, Kottayam.\n\nYour vehicle *${vehicle.regNumber}* (${vehicle.makeModel}) is due for its next periodic service.\n\n• Last serviced: ${new Date(lastJob.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n• Reason: ${vehicle.dueReason}\n\nPreventive maintenance keeps your vehicle running smoothly! Click below to book your service slot:\n${window.location.origin}/#book\n\nOr reply here to book directly! 🔧`
    
    // Clean phone number
    const cleanPhone = vehicle.phone ? vehicle.phone.replace(/\D/g, '') : ''
    
    // Open WhatsApp
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank')

    // Mark reminder as sent in Supabase (persisted in latest job's inspection JSONB)
    try {
      const updatedInspection = {
        ...(lastJob.inspection || {}),
        lastReminderSent: new Date().toISOString()
      }

      await supabase
        .from('jobs')
        .update({ inspection: updatedInspection })
        .eq('id', lastJob.id)

      // Refresh list to move the vehicle to snoozed list
      loadReminders()
    } catch (err) {
      console.warn("Failed to save reminder sent state to DB:", err)
    }
  }

  // Filter groups
  const dueList = vehicles.filter(v => v.isDue && !v.isSnoozed)
  const upcomingList = vehicles.filter(v => v.isUpcoming && !v.isSnoozed)
  const snoozedList = vehicles.filter(v => v.isSnoozed)

  const activeList = activeTab === 'due' 
    ? dueList 
    : activeTab === 'upcoming' 
    ? upcomingList 
    : snoozedList

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: 'inherit' }}>
      <style>{`
        .rem-tab { padding: 12px 18px; border: none; border-bottom: 2px solid transparent; background: transparent; color: rgba(255,255,255,0.4); font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; alignItems: center; gap: 6px; }
        .rem-tab.active { color: #fff; border-bottom-color: #E8310A; }
        .rem-tab:hover { color: rgba(255,255,255,0.8); }
        .rem-badge { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); font-size: 11px; padding: 1px 6px; borderRadius: 99px; fontWeight: 600; }
        .rem-tab.active .rem-badge { background: #E8310A; color: #fff; }
        
        .rem-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; margin-bottom: 12px; transition: border-color 0.2s; }
        .rem-card:hover { border-color: rgba(255,255,255,0.15); }
        
        .rem-btn-wa { display: flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border: 1px solid rgba(37,211,102,0.3); background: rgba(37,211,102,0.1); color: #25D366; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; text-decoration: none; transition: all 0.2s; }
        .rem-btn-wa:hover { background: #25D366; color: #050505; }
      `}</style>

      {/* Header */}
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <div style={{ color: '#E8310A', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>Service Reminders</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Automated Follow-ups Queue</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button className={`rem-tab${activeTab === 'due' ? ' active' : ''}`} onClick={() => setActiveTab('due')}>
            🚨 Due Now <span className="rem-badge">{dueList.length}</span>
          </button>
          <button className={`rem-tab${activeTab === 'upcoming' ? ' active' : ''}`} onClick={() => setActiveTab('upcoming')}>
            📅 Upcoming Soon <span className="rem-badge">{upcomingList.length}</span>
          </button>
          <button className={`rem-tab${activeTab === 'snoozed' ? ' active' : ''}`} onClick={() => setActiveTab('snoozed')}>
            ✓ Sent / Snoozed <span className="rem-badge">{snoozedList.length}</span>
          </button>
        </div>
      </div>

      {/* Content list */}
      <div style={{ padding: '16px 5% 40px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}>
            <img src={jwLogo} alt="" style={{ width: 36, height: 36, marginBottom: 12, animation: 'spin 1.2s linear infinite', opacity: 0.5 }} />
            <div>Running auto-detection logic...</div>
          </div>
        )}

        {!loading && error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 16, color: '#F87171', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {!loading && !error && activeList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              {activeTab === 'due' ? 'Queue is clean!' : activeTab === 'upcoming' ? 'No upcoming services soon' : 'No recent reminders sent'}
            </div>
            <div style={{ fontSize: 13 }}>
              {activeTab === 'due' 
                ? 'All vehicles have been serviced recently or have active reminders.' 
                : activeTab === 'upcoming' 
                ? 'Check back later as vehicle odometers project forward.' 
                : 'Follow-ups sent within the last 30 days will appear here.'}
            </div>
          </div>
        )}

        {!loading && !error && activeList.map(vehicle => {
          const lastJob = vehicle.latestJob
          return (
            <div key={vehicle.regNumber} className="rem-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                
                {/* Details */}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{vehicle.vehicleType === '2W' ? '🏍️' : '🚗'}</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>{vehicle.regNumber}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>·</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{vehicle.makeModel}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
                    {vehicle.customerName} · <span style={{ fontFamily: 'monospace' }}>{vehicle.phone}</span>
                  </div>

                  {/* History projection */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 8, fontSize: 11, marginBottom: 10 }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Last Visit</div>
                      <div style={{ fontWeight: 700 }}>{new Date(lastJob.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Last Odometer</div>
                      <div style={{ fontWeight: 700 }}>{lastJob.odometer ? `${lastJob.odometer} km` : '—'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Est. Odometer</div>
                      <div style={{ fontWeight: 700, color: '#93C5FD' }}>{vehicle.estimatedCurrentOdo} km</div>
                    </div>
                  </div>

                  {/* Warning reason */}
                  <div style={{ fontSize: 12, color: '#FCD34D', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⏰</span>
                    <span>{vehicle.dueReason}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  {activeTab !== 'snoozed' ? (
                    <button onClick={() => handleSendReminder(vehicle)} className="rem-btn-wa">
                      💬 Send WhatsApp Reminder
                    </button>
                  ) : (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                        ✓ Reminder Sent
                      </span>
                      {vehicle.lastReminderSent && (
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                          Sent {vehicle.daysSinceLastReminder} day(s) ago
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
