import { useState } from 'react'
import { supabase } from './supabase'

const TIME_SLOTS = [
  '9 – 10 AM',
  '10 – 11 AM',
  '11 AM – 12 PM',
  '12 – 1 PM',
  '2 – 3 PM',
  '3 – 4 PM',
  '4 – 5 PM',
  '5 – 6 PM',
]

const SERVICE_TYPES = [
  { value: 'Full Service', label: '⚙️ Full Service' },
  { value: 'Custom Exhausts & Headers', label: '💨 Custom Exhausts & Headers' },
  { value: 'Custom Bodykits', label: '🏎️ Custom Bodykits' },
  { value: 'Suspension & Brakes', label: '🔩 Suspension & Brakes' },
  { value: 'Two-Wheeler Service', label: '🏍️ Two-Wheeler Service' },
  { value: 'Diagnostics', label: '🔬 Diagnostics' },
  { value: 'Other', label: '🔧 Other / General' },
]

/**
 * Generates a unique job ID by querying the current max from Supabase.
 * Falls back to a timestamp-based ID if the query fails.
 */
async function generateBookingId() {
  try {
    const { data } = await supabase
      .from('jobs')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) {
      const lastNum = parseInt(data[0].id?.split('-')[2]) || 0
      return `JW-${new Date().getFullYear()}-${String(lastNum + 1).padStart(4, '0')}`
    }
  } catch (e) {
    console.warn('[BookingForm] Failed to fetch last ID:', e)
  }
  // Fallback
  return `JW-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
}

/**
 * Public booking form for customers to request a service slot.
 * Inserts a new "Waiting" job card directly into Supabase.
 */
export default function BookingForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    vehicleType: '4W',
    regNumber: '',
    makeModel: '',
    serviceType: '',
    notes: '',
    date: '',
    timeSlot: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('idle') // idle | success | error
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(field, value) {
    setForm(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.regNumber.trim()) e.regNumber = 'Registration number is required'
    if (!form.makeModel.trim()) e.makeModel = 'Make & model is required'
    if (!form.date) e.date = 'Please pick a date'
    if (!form.timeSlot) e.timeSlot = 'Please pick a time slot'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setErrorMsg('')
    try {
      const id = await generateBookingId()
      const complaint = form.serviceType
        ? `${form.serviceType}${form.notes.trim() ? ' — ' + form.notes.trim() : ''}`
        : form.notes.trim() || 'Service booking (details to be discussed)'

      const formattedDate = new Date(form.date).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      })
      const deliveryTime = `REQUESTED: ${formattedDate}, ${form.timeSlot}`

      const row = {
        id,
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        address: '',
        vehicle_type: form.vehicleType,
        reg_number: form.regNumber.trim().toUpperCase(),
        make_model: form.makeModel.trim(),
        year: '',
        fuel: '',
        odometer: '',
        complaint,
        mechanic: '',
        delivery_time: deliveryTime,
        status: 'Waiting',
        photos: [],
      }

      const { error } = await supabase.from('jobs').insert(row)
      if (error) throw error
      setStatus('success')
    } catch (err) {
      console.error('[BookingForm] Insert failed:', err)
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
    setSubmitting(false)
  }

  function resetForm() {
    setForm({
      name: '', phone: '', vehicleType: '4W', regNumber: '',
      makeModel: '', serviceType: '', notes: '', date: '', timeSlot: '',
    })
    setErrors({})
    setStatus('idle')
    setErrorMsg('')
  }

  // Date constraints
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  // ── Success State ──
  if (status === 'success') {
    return (
      <div style={{
        background: 'rgba(34,197,94,0.06)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: 16,
        padding: '48px 32px',
        textAlign: 'center',
        animation: 'fadeUp 0.5s ease forwards',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          Booking Confirmed!
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
          We've received your request. Our team will call you shortly to confirm your slot.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`https://wa.me/919447403837?text=${encodeURIComponent(`Hi JW Tuned! I just booked online. My name is ${form.name}, vehicle ${form.regNumber}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-red"
            style={{ fontSize: 13, padding: '12px 24px' }}
          >
            💬 Follow up on WhatsApp
          </a>
          <button
            onClick={resetForm}
            className="btn-ghost"
            style={{ fontSize: 13, padding: '11px 24px' }}
          >
            Book Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
      <style>{`
        .bf-field { display: flex; flex-direction: column; gap: 6px; }
        .bf-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.06em; }
        .bf-input {
          width: 100%; height: 48px; background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px;
          color: #fff; font-family: inherit; font-size: 14px; padding: 0 16px;
          outline: none; transition: border-color 0.2s;
        }
        .bf-input:focus { border-color: #E8310A; }
        .bf-input::placeholder { color: rgba(255,255,255,0.35); }
        .bf-input.bf-error { border-color: #EF4444; }
        .bf-error-text { font-size: 11px; color: #F87171; margin-top: 2px; }
        select.bf-input { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px; }
        select.bf-input option { background: #1a1a1a; color: #fff; }
        .bf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 600px) { .bf-grid { grid-template-columns: 1fr; } }
        .slot-chip {
          padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
          border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.2s;
          text-align: center; white-space: nowrap; font-family: inherit;
        }
        .slot-chip:hover { border-color: rgba(232,49,10,0.4); color: #fff; background: rgba(232,49,10,0.05); }
        .slot-chip.active { border-color: #E8310A; background: rgba(232,49,10,0.15); color: #fff; box-shadow: 0 0 0 1px rgba(232,49,10,0.3); }
        .vtype-btn {
          height: 48px; border-radius: 8px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; font-family: inherit; border: 1.5px solid;
        }
      `}</style>

      <div style={{ display: 'grid', gap: 20 }}>

        {/* Row 1: Name + Phone */}
        <div className="bf-grid">
          <div className="bf-field">
            <label className="bf-label">Full Name *</label>
            <input
              className={`bf-input ${errors.name ? 'bf-error' : ''}`}
              placeholder="Your full name"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
            />
            {errors.name && <div className="bf-error-text">{errors.name}</div>}
          </div>
          <div className="bf-field">
            <label className="bf-label">Phone Number *</label>
            <input
              className={`bf-input ${errors.phone ? 'bf-error' : ''}`}
              placeholder="+91 98471 23456"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              inputMode="tel"
            />
            {errors.phone && <div className="bf-error-text">{errors.phone}</div>}
          </div>
        </div>

        {/* Vehicle Type Toggle */}
        <div className="bf-field">
          <label className="bf-label">Vehicle Type *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['4W', '🚗 4-Wheeler'], ['2W', '🏍️ 2-Wheeler']].map(([val, label]) => (
              <button
                key={val}
                type="button"
                className="vtype-btn"
                onClick={() => handleChange('vehicleType', val)}
                style={{
                  background: form.vehicleType === val ? '#fff' : 'rgba(255,255,255,0.03)',
                  color: form.vehicleType === val ? '#0A0A0A' : 'rgba(255,255,255,0.5)',
                  borderColor: form.vehicleType === val ? '#fff' : 'rgba(255,255,255,0.1)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Reg + Make/Model */}
        <div className="bf-grid">
          <div className="bf-field">
            <label className="bf-label">Registration Number *</label>
            <input
              className={`bf-input ${errors.regNumber ? 'bf-error' : ''}`}
              placeholder="KL 05 AH 7823"
              value={form.regNumber}
              onChange={e => handleChange('regNumber', e.target.value.toUpperCase())}
              style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontWeight: 600 }}
            />
            {errors.regNumber && <div className="bf-error-text">{errors.regNumber}</div>}
          </div>
          <div className="bf-field">
            <label className="bf-label">Make & Model *</label>
            <input
              className={`bf-input ${errors.makeModel ? 'bf-error' : ''}`}
              placeholder="Maruti Swift Dzire"
              value={form.makeModel}
              onChange={e => handleChange('makeModel', e.target.value)}
            />
            {errors.makeModel && <div className="bf-error-text">{errors.makeModel}</div>}
          </div>
        </div>

        {/* Service Type */}
        <div className="bf-field">
          <label className="bf-label">Service Required</label>
          <select
            className="bf-input"
            value={form.serviceType}
            onChange={e => handleChange('serviceType', e.target.value)}
          >
            <option value="">— Select a service —</option>
            {SERVICE_TYPES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Additional Notes */}
        <div className="bf-field">
          <label className="bf-label">Additional Notes</label>
          <textarea
            className="bf-input"
            placeholder="Describe any specific issues or requests..."
            value={form.notes}
            onChange={e => handleChange('notes', e.target.value)}
            style={{ height: 80, padding: '14px 16px', resize: 'none' }}
          />
        </div>

        {/* Date Picker */}
        <div className="bf-field">
          <label className="bf-label">Preferred Date *</label>
          <input
            type="date"
            className={`bf-input ${errors.date ? 'bf-error' : ''}`}
            value={form.date}
            min={today}
            max={maxDate}
            onChange={e => handleChange('date', e.target.value)}
            style={{ colorScheme: 'dark' }}
          />
          {errors.date && <div className="bf-error-text">{errors.date}</div>}
        </div>

        {/* Time Slot Chips */}
        <div className="bf-field">
          <label className="bf-label">Preferred Time Slot *</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
          }}>
            {TIME_SLOTS.map(slot => (
              <button
                key={slot}
                type="button"
                className={`slot-chip ${form.timeSlot === slot ? 'active' : ''}`}
                onClick={() => {
                  handleChange('timeSlot', slot)
                  if (errors.timeSlot) setErrors(p => ({ ...p, timeSlot: '' }))
                }}
              >
                {slot}
              </button>
            ))}
          </div>
          {errors.timeSlot && <div className="bf-error-text">{errors.timeSlot}</div>}
          <style>{`
            @media (max-width: 600px) {
              .slot-chip { font-size: 11px !important; padding: 8px 6px !important; }
            }
          `}</style>
        </div>

        {/* Error message */}
        {status === 'error' && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ color: '#F87171', fontSize: 13, fontWeight: 600 }}>Booking failed</div>
              <div style={{ color: 'rgba(248,113,113,0.7)', fontSize: 12 }}>{errorMsg}</div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-red"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '16px 32px',
            fontSize: 15,
            borderRadius: 8,
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'wait' : 'pointer',
          }}
        >
          {submitting ? '⏳ Booking...' : '📅 Book My Slot'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          By booking, you agree to be contacted by JW Tuned to confirm your slot.
          <br />No advance payment required.
        </div>
      </div>
    </form>
  )
}
