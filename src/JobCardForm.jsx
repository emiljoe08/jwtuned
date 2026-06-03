import { useState } from 'react'
import jwLogo from './assets/jjw.svg'
import { STATUS, PhotoViewer, Card, Field } from './App'

const emptyForm = {
  customerName: '', phone: '', address: '',
  regNumber: '', makeModel: '', year: '', fuel: '', odometer: '',
  complaint: '', mechanic: '', deliveryTime: '',
  status: 'Waiting', photos: []
}

/**
 * Renders the form to create or edit a job card.
 * @returns {JSX.Element} The job card form component.
 */
export default function JobCardForm({ initialData, onSave, onBack, mechanics }) {
  const [vehicleType, setVehicleType] = useState(initialData?.vehicleType || '4W')
  const [form, setForm]               = useState(initialData ? { ...initialData } : { ...emptyForm })
  const [saving, setSaving]           = useState(false)
  const [addingMechanic, setAddingMechanic] = useState(false)
  const [newMechanicName, setNewMechanicName] = useState('')

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
              {addingMechanic ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    autoFocus
                    placeholder="Mechanic name"
                    value={newMechanicName}
                    onChange={e => setNewMechanicName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); if (newMechanicName.trim()) { handleChange('mechanic', newMechanicName.trim()); setAddingMechanic(false); } }
                      if (e.key === 'Escape') setAddingMechanic(false);
                    }}
                    style={{ flex: 1, minWidth: 0, padding: '10px 14px' }}
                  />
                  <button type="button" onClick={() => { if (newMechanicName.trim()) { handleChange('mechanic', newMechanicName.trim()); setAddingMechanic(false); } }} style={{ background: '#E8310A', border: 'none', borderRadius: 8, color: '#fff', padding: '0 14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                  <button type="button" onClick={() => setAddingMechanic(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: '0 12px', cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <select value={form.mechanic} onChange={e => {
                  if (e.target.value === '__new__') { setAddingMechanic(true); setNewMechanicName(''); return }
                  handleChange('mechanic', e.target.value)
                }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8, padding: '12px 14px', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}>
                  <option value="" style={{ background: '#1a1a1a', color: '#fff' }}>— Select —</option>
                  {mechanics?.map(m => <option key={m.id} value={m.name} style={{ background: '#1a1a1a', color: '#fff' }}>{m.name}</option>)}
                  {form.mechanic && !mechanics?.some(m => m.name === form.mechanic) && (
                    <option value={form.mechanic} style={{ background: '#1a1a1a', color: '#fff' }}>{form.mechanic}</option>
                  )}
                  <option value="__new__" style={{ background: '#1a1a1a', color: '#E8310A', fontWeight: 700 }}>+ Add new mechanic</option>
                </select>
              )}
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