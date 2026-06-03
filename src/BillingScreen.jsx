import { useState } from 'react'
import { printBill, downloadBill } from './PrintBill'
import { Card, Field } from './App'

/** Returns a clean, empty line item for the billing form. */
const emptyLineItem = () => ({ id: Date.now(), description: '', qty: '1', rate: '', type: 'labour' })

/**
 * Renders the billing screen where users can add labour and parts, calculate totals, and print the bill.
 * @returns {JSX.Element} The billing screen component.
 */
export default function BillingScreen({ job, onBack }) {
  const [items, setItems]         = useState([
    { id: 1, description: 'Labour charges', qty: '1', rate: '', type: 'labour' },
  ])
  const [discount, setDiscount]   = useState('')
  const [paid, setPaid]           = useState(false)
  const [payMode, setPayMode]     = useState('Cash')
  const [note, setNote]           = useState('')
  const [printed, setPrinted]     = useState(false)

  /**
   * Adds a new empty line item to the bill.
   * @param {string} type - The type of the item ('labour' or 'parts').
   */
  function addItem(type) {
    setItems(p => [...p, { ...emptyLineItem(), type }])
  }

  /**
   * Updates a specific field of an existing line item.
   * @param {number} id - The ID of the line item to update.
   * @param {string} field - The property to update (e.g., 'qty', 'rate').
   * @param {string} value - The new value for the property.
   */
  function updateItem(id, field, value) {
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  /**
   * Removes a line item from the bill.
   * @param {number} id - The ID of the line item to remove.
   */
  function removeItem(id) {
    setItems(p => p.filter(i => i.id !== id))
  }

  const subtotal   = items.reduce((sum, i) => sum + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0), 0)
  const discAmt    = parseFloat(discount) || 0
  const total      = Math.max(0, subtotal - discAmt)
  const labourAmt  = items.filter(i => i.type === 'labour').reduce((s, i) => s + (parseFloat(i.qty)||0)*(parseFloat(i.rate)||0), 0)
  const partsAmt   = items.filter(i => i.type === 'parts').reduce((s, i)  => s + (parseFloat(i.qty)||0)*(parseFloat(i.rate)||0), 0)

  /** Prepares a summary message and opens WhatsApp to send the bill to the customer. */
  function handleWhatsApp() {
    const lines = items.map(i => `  • ${i.description}: ₹${((parseFloat(i.qty)||0)*(parseFloat(i.rate)||0)).toFixed(0)}`).join('\n')
    const msg = `Hello ${job.customerName} 👋\n\n*Bill from JW Tuned*\nJob: ${job.id}\nVehicle: ${job.regNumber} (${job.makeModel})\n\n${lines}\n\nSubtotal: ₹${subtotal.toFixed(0)}${discAmt ? `\nDiscount: -₹${discAmt}` : ''}\n*Total: ₹${total.toFixed(0)}*\n\nPayment: ${paid ? `Paid via ${payMode} ✅` : 'Pending 🔴'}\n\nThank you for choosing JW Tuned! 🔧`
    window.open(`https://wa.me/${job.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  /** Triggers the generation and printing of the job bill. */
  function handlePrint() {
    printBill({ job, items, discount, paid, payMode, note })
  }

  /** Triggers the generation and downloading of the job bill as a PDF. */
  function handleDownload() {
    downloadBill({ job, items, discount, paid, payMode, note })
  }

  return (
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh', background: '#050505' }}>

      {/* Header */}
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 5% 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>🧾 Create Bill</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{job.id} · {job.regNumber}</div>
        </div>
      </div>

      <div style={{ padding: '12px 5% 32px' }}>

        {/* Customer + vehicle summary */}
        <Card title="📋 Job Summary">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Customer',  value: job.customerName },
              { label: 'Phone',     value: job.phone },
              { label: 'Vehicle',   value: job.makeModel },
              { label: 'Reg. No.',  value: job.regNumber },
              { label: 'Mechanic',  value: job.mechanic || '—' },
              { label: 'Odometer',  value: `${job.odometer} km` },
            ].map(d => (
              <div key={d.label}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{d.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{d.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Line items */}
        <Card title="🔩 Labour & Parts">
          {items.map((item, idx) => (
            <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                  {item.type === 'labour' ? '🔧 Labour' : '🔩 Parts'}
                </span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
                )}
              </div>
              <input
                placeholder="Description (e.g. Oil change, Air filter)"
                value={item.description}
                onChange={e => updateItem(item.id, 'description', e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Qty">
                  <input placeholder="1" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} inputMode="numeric" />
                </Field>
                <Field label="Rate (₹)">
                  <input placeholder="500" value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)} inputMode="numeric" />
                </Field>
              </div>
              {item.qty && item.rate && (
                <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'right' }}>
                  = ₹{((parseFloat(item.qty)||0) * (parseFloat(item.rate)||0)).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          ))}

          {/* Add item buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => addItem('labour')} style={{ height: 40, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Labour
            </button>
            <button onClick={() => addItem('parts')} style={{ height: 40, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Parts
            </button>
          </div>
        </Card>

        {/* Totals */}
        <Card title="💰 Amount">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span>🔧 Labour</span><span style={{ fontWeight: 600, color: '#fff' }}>₹{labourAmt.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span>🔩 Parts</span><span style={{ fontWeight: 600, color: '#fff' }}>₹{partsAmt.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span>Subtotal</span><span style={{ fontWeight: 600, color: '#fff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <Field label="Discount (₹)">
            <input placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} inputMode="numeric" />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', marginTop: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </Card>

        {/* Payment */}
        <Card title="💳 Payment">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setPaid(!paid)}
              style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${paid ? '#fff' : 'rgba(255,255,255,0.2)'}`, background: paid ? '#fff' : 'transparent', color: paid ? '#050505' : 'transparent', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {paid ? '✓' : ''}
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: paid ? '#fff' : 'rgba(255,255,255,0.5)' }}>
              {paid ? 'Payment received' : 'Mark as paid'}
            </span>
          </div>

          {paid && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Payment mode</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Cash', 'UPI', 'Card'].map(m => (
                  <button key={m} onClick={() => setPayMode(m)} style={{ flex: 1, height: 38, borderRadius: 10, border: `1px solid ${payMode === m ? '#fff' : 'rgba(255,255,255,0.1)'}`, background: payMode === m ? '#fff' : 'rgba(255,255,255,0.03)', color: payMode === m ? '#050505' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {m === 'Cash' ? '💵' : m === 'UPI' ? '📱' : '💳'} {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Field label="Note (optional)">
            <input placeholder="e.g. Customer will collect tomorrow" value={note} onChange={e => setNote(e.target.value)} />
          </Field>
        </Card>

        {/* Actions */}
        <button onClick={handleWhatsApp} style={{ width: '100%', height: 52, background: '#fff', color: '#050505', border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 12, boxShadow: '0 8px 24px rgba(255,255,255,0.15)' }}>
          💬 Send Bill on WhatsApp
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <button onClick={handlePrint} style={{ height: 48, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            🖨️ Print
          </button>
          <button onClick={handleDownload} style={{ height: 48, background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            📄 Download PDF
          </button>
        </div>
        <button onClick={onBack} style={{ width: '100%', height: 44, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          ← Back
        </button>
      </div>
    </div>
  )
}