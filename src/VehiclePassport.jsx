import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { fromDb } from './shared'
import jwLogo from './assets/jjw.svg'

/**
 * Public Vehicle Passport Screen.
 * Accessible by customers/buyers via /passport/:regNumber.
 * Shows detailed vehicle history, visits count, and odometer tracking.
 */
export default function VehiclePassport() {
  const { regNumber } = useParams()
  const navigate = useNavigate()

  const [vehicle, setVehicle] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadPassport() {
      try {
        const cleanedQuery = regNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
        
        // Fetch all jobs to locate the vehicle's history
        const { data, error: fetchError } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Filter exact matching registration number (normalized)
        const vehicleJobs = (data || [])
          .filter(j => j.reg_number?.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === cleanedQuery)
          .map(fromDb)

        if (vehicleJobs.length === 0) {
          setError('No passport history found for this vehicle.')
          setLoading(false)
          return
        }

        const latestJob = vehicleJobs[0]
        const oldestJob = vehicleJobs[vehicleJobs.length - 1]

        // Mask phone and address for privacy
        const maskPhone = (ph) => {
          if (!ph) return '—'
          const clean = ph.trim()
          if (clean.length < 4) return '***'
          return clean.slice(0, 3) + '******' + clean.slice(-4)
        }

        const maskAddress = (addr) => {
          if (!addr) return '—'
          return 'Kottayam, Kerala' // Mask specific details for general area
        }

        setVehicle({
          regNumber: latestJob.regNumber,
          makeModel: latestJob.makeModel,
          vehicleType: latestJob.vehicleType,
          customerName: latestJob.customerName,
          phone: maskPhone(latestJob.phone),
          address: maskAddress(latestJob.address),
          totalVisits: vehicleJobs.length,
          firstVisit: oldestJob.created_at,
          lastVisit: latestJob.created_at,
          fuel: latestJob.fuel || '—',
          year: latestJob.year || '—',
          latestOdo: latestJob.odometer ? `${latestJob.odometer} km` : '—'
        })
        setHistory(vehicleJobs)
      } catch (err) {
        setError(err.message || 'Error retrieving vehicle history.')
      } finally {
        setLoading(false)
      }
    }
    loadPassport()
  }, [regNumber])

  function handlePrint() {
    window.print()
  }

  function handleDownloadPDF() {
    // Dynamic import of html2pdf library
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    script.onload = () => {
      const element = document.getElementById('passport-pdf-content')
      const opt = {
        margin: 10,
        filename: `Passport-${vehicle.regNumber.replace(/[^A-Za-z0-9]/g, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#050505' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      // Temporarily hide action buttons during capture
      const btns = document.getElementById('action-buttons-container')
      if (btns) btns.style.display = 'none'
      
      window.html2pdf().set(opt).from(element).save().then(() => {
        if (btns) btns.style.display = 'flex'
      })
    }
    document.body.appendChild(script)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505', color: '#fff' }}>
        <img src={jwLogo} alt="JW Tuned" style={{ width: 48, height: 48, marginBottom: 16, animation: 'spin 1.2s linear infinite', opacity: 0.7 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Loading vehicle passport...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505', color: '#fff', padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Passport Not Found</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 360, lineHeight: 1.5, marginBottom: 24 }}>
          {error || 'We could not locate any service record matching this registration number.'}
        </p>
        <button onClick={() => navigate('/')} style={{ background: '#E8310A', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Go to Home
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Barlow', 'Segoe UI', sans-serif", padding: '30px 16px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&display=swap');
        
        .p-card {
          background: linear-gradient(135deg, #0d0d0d 0%, #121212 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          max-width: 680px;
          margin: 0 auto;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5);
          overflow: hidden;
        }

        .stamp-row {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          margin-bottom: 10px;
        }

        .stamp-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #E8310A;
          margin-top: 4px;
          box-shadow: 0 0 8px #E8310A;
        }

        .passport-plate {
          background: #000;
          border: 2px solid #fff;
          color: #fff;
          font-family: 'Courier New', monospace;
          font-weight: 900;
          font-size: 20px;
          padding: 6px 16px;
          border-radius: 6px;
          letter-spacing: 0.1em;
          display: inline-block;
          margin-bottom: 12px;
          box-shadow: inset 0 0 10px rgba(255,255,255,0.2);
        }

        .pass-btn {
          height: 42px;
          padding: 0 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          border: none;
        }

        .btn-print { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; }
        .btn-print:hover { background: rgba(255,255,255,0.1); }
        .btn-pdf { background: rgba(232, 49, 10, 0.1); border: 1px solid rgba(232, 49, 10, 0.3); color: #FF5A3D; }
        .btn-pdf:hover { background: #E8310A; color: #fff; }

        @media print {
          body { background: #fff !important; color: #000 !important; }
          #action-buttons-container, header, footer { display: none !important; }
          .p-card { background: #fff !important; border: 2px solid #000 !important; box-shadow: none !important; color: #000 !important; max-width: 100% !important; margin: 0 !important; }
          .passport-plate { border-color: #000 !important; color: #000 !important; }
          .stamp-row { border-color: #e2e8f0 !important; background: none !important; color: #000 !important; }
          .stamp-dot { background: #000 !important; box-shadow: none !important; }
          span, div, h1, h2, h3, p { color: #000 !important; }
        }
      `}</style>

      {/* Main Passport Content */}
      <div id="passport-pdf-content" className="p-card">
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={jwLogo} alt="JW Tuned" style={{ height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.05em' }}>JW TUNED</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vehicle Passport</div>
            </div>
          </div>
          <div style={{ textAlignment: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(232,49,10,0.15)', color: '#FF5A3D', padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
              ✓ Verified
            </span>
          </div>
        </div>

        {/* Passport details plate */}
        <div style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="passport-plate">{vehicle.regNumber}</div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{vehicle.makeModel}</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Official Service Stamp Log</p>
          </div>

          {/* Grid Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Visits Count', value: vehicle.totalVisits },
              { label: 'Fuel Type', value: vehicle.fuel },
              { label: 'Year', value: vehicle.year },
              { label: 'Customer', value: vehicle.customerName },
              { label: 'District', value: vehicle.address },
              { label: 'Phone', value: vehicle.phone },
            ].map(d => (
              <div key={d.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{d.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{d.value}</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div id="action-buttons-container" style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <button onClick={handlePrint} className="pass-btn btn-print">
              🖨️ Print Passport
            </button>
            <button onClick={handleDownloadPDF} className="pass-btn btn-pdf">
              📄 Download PDF
            </button>
          </div>

          {/* History Stamp Timeline */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
              Service Stamp History ({history.length} stamps)
            </h3>

            {history.map((job) => (
              <div key={job.id} className="stamp-row">
                <div className="stamp-dot" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{job.complaint}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ color: '#FF5A3D', fontWeight: 600 }}>{job.id}</span>
                    <span>·</span>
                    <span>Odometer: <strong>{job.odometer ? `${job.odometer} km` : '—'}</strong></span>
                    {job.mechanic && (
                      <>
                        <span>·</span>
                        <span>Mechanic: <strong>{job.mechanic}</strong></span>
                      </>
                    )}
                    <span>·</span>
                    <span style={{ color: job.status === 'Delivered' ? '#6EE7B7' : '#FCD34D' }}>{job.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer info */}
        <div style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          This is an official verification passport powered by JW Tuned Garage Systems.
        </div>
      </div>
    </div>
  )
}
