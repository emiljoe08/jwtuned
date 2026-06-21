export const STATUS = {
  'Waiting':     { bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', dot: '#F59E0B' },
  'In Progress': { bg: 'rgba(59,130,246,0.1)', color: '#93C5FD', dot: '#3B82F6' },
  'Ready':       { bg: 'rgba(34,197,94,0.1)',  color: '#6EE7B7', dot: '#22C55E' },
  'Delivered':   { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', dot: 'rgba(255,255,255,0.3)' },
}

export function toDb(form, vehicleType, id) {
  return {
    id,
    customer_name: form.customerName,
    phone: form.phone,
    address: form.address,
    vehicle_type: vehicleType,
    reg_number: form.regNumber,
    make_model: form.makeModel,
    year: form.year,
    fuel: form.fuel,
    odometer: form.odometer,
    complaint: form.complaint,
    mechanic: form.mechanic,
    delivery_time: form.deliveryTime,
    status: form.status,
    photos: form.photos || [],
    inspection: form.inspection || null,
  }
}

export function fromDb(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    vehicleType: row.vehicle_type,
    regNumber: row.reg_number,
    makeModel: row.make_model,
    year: row.year,
    fuel: row.fuel,
    odometer: row.odometer,
    complaint: row.complaint,
    mechanic: row.mechanic,
    deliveryTime: row.delivery_time,
    status: row.status,
    photos: row.photos || [],
    inspection: row.inspection || null,
  }
}

export function PhotoViewer({ photo, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>×</button>
      <img src={photo.url} alt="Vehicle" onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain' }} />
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 12 }}>Tap anywhere to close</div>
    </div>
  )
}

export function Card({ title, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>{label}</label>
      {children}
    </div>
  )
}