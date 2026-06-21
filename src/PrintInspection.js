import jwLogo from './assets/jjw.svg'

/**
 * Default inspection templates for 4W and 2W vehicles.
 */
export const INSPECTION_TEMPLATE = {
  '4W': [
    {
      name: 'Brakes', icon: '🔴',
      items: [
        { name: 'Front brake pads', status: null, notes: '' },
        { name: 'Rear brake pads', status: null, notes: '' },
        { name: 'Brake fluid level', status: null, notes: '' },
        { name: 'Brake lines / hoses', status: null, notes: '' },
      ]
    },
    {
      name: 'Tyres & Wheels', icon: '🛞',
      items: [
        { name: 'Front-left tyre', status: null, notes: '' },
        { name: 'Front-right tyre', status: null, notes: '' },
        { name: 'Rear-left tyre', status: null, notes: '' },
        { name: 'Rear-right tyre', status: null, notes: '' },
        { name: 'Spare tyre', status: null, notes: '' },
        { name: 'Wheel alignment', status: null, notes: '' },
      ]
    },
    {
      name: 'Lights & Electricals', icon: '💡',
      items: [
        { name: 'Headlights', status: null, notes: '' },
        { name: 'Tail lights', status: null, notes: '' },
        { name: 'Indicators', status: null, notes: '' },
        { name: 'Horn', status: null, notes: '' },
        { name: 'Battery condition', status: null, notes: '' },
        { name: 'Wipers', status: null, notes: '' },
      ]
    },
    {
      name: 'Fluids', icon: '🛢️',
      items: [
        { name: 'Engine oil', status: null, notes: '' },
        { name: 'Coolant level', status: null, notes: '' },
        { name: 'Power steering fluid', status: null, notes: '' },
        { name: 'Transmission fluid', status: null, notes: '' },
        { name: 'Washer fluid', status: null, notes: '' },
      ]
    },
    {
      name: 'Engine & Drivetrain', icon: '⚙️',
      items: [
        { name: 'Air filter', status: null, notes: '' },
        { name: 'Drive belt', status: null, notes: '' },
        { name: 'Exhaust system', status: null, notes: '' },
        { name: 'Engine mounts', status: null, notes: '' },
      ]
    },
    {
      name: 'Suspension & Steering', icon: '🏗️',
      items: [
        { name: 'Shock absorbers', status: null, notes: '' },
        { name: 'Tie rods', status: null, notes: '' },
        { name: 'Ball joints', status: null, notes: '' },
      ]
    },
    {
      name: 'Body & Interior', icon: '🚗',
      items: [
        { name: 'Windshield condition', status: null, notes: '' },
        { name: 'Mirrors', status: null, notes: '' },
        { name: 'Seat belts', status: null, notes: '' },
      ]
    },
  ],
  '2W': [
    {
      name: 'Brakes', icon: '🔴',
      items: [
        { name: 'Front brake', status: null, notes: '' },
        { name: 'Rear brake', status: null, notes: '' },
        { name: 'Brake fluid / cable', status: null, notes: '' },
      ]
    },
    {
      name: 'Tyres & Wheels', icon: '🛞',
      items: [
        { name: 'Front tyre', status: null, notes: '' },
        { name: 'Rear tyre', status: null, notes: '' },
        { name: 'Wheel bearings', status: null, notes: '' },
      ]
    },
    {
      name: 'Lights & Electricals', icon: '💡',
      items: [
        { name: 'Headlight', status: null, notes: '' },
        { name: 'Tail light', status: null, notes: '' },
        { name: 'Indicators', status: null, notes: '' },
        { name: 'Horn', status: null, notes: '' },
        { name: 'Battery', status: null, notes: '' },
      ]
    },
    {
      name: 'Engine & Drivetrain', icon: '⚙️',
      items: [
        { name: 'Engine oil', status: null, notes: '' },
        { name: 'Air filter', status: null, notes: '' },
        { name: 'Chain / belt', status: null, notes: '' },
        { name: 'Clutch', status: null, notes: '' },
        { name: 'Exhaust', status: null, notes: '' },
      ]
    },
    {
      name: 'Body & Controls', icon: '🏍️',
      items: [
        { name: 'Mirrors', status: null, notes: '' },
        { name: 'Throttle response', status: null, notes: '' },
      ]
    },
  ]
}

const STATUS_CONFIG = {
  pass: { label: '✅ Pass', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
  warn: { label: '⚠️ Warn', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  fail: { label: '❌ Fail', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
}

/**
 * Builds the HTML for a branded, printable inspection report.
 */
function buildInspectionHtml(job) {
  const insp = job.inspection
  if (!insp) return ''

  const date = insp.completedAt
    ? new Date(insp.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = insp.completedAt
    ? new Date(insp.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : ''

  // Count stats
  let passCount = 0, warnCount = 0, failCount = 0, totalItems = 0
  ;(insp.categories || []).forEach(cat => {
    cat.items.forEach(item => {
      totalItems++
      if (item.status === 'pass') passCount++
      else if (item.status === 'warn') warnCount++
      else if (item.status === 'fail') failCount++
    })
  })

  const categoriesHtml = (insp.categories || []).map(cat => {
    const rows = cat.items.map(item => {
      const statusColor = item.status === 'pass' ? '#15803D' : item.status === 'warn' ? '#B45309' : item.status === 'fail' ? '#DC2626' : '#94A3B8'
      const statusBg = item.status === 'pass' ? '#F0FDF4' : item.status === 'warn' ? '#FFFBEB' : item.status === 'fail' ? '#FEF2F2' : '#F8FAFC'
      const statusLabel = item.status === 'pass' ? '✅ PASS' : item.status === 'warn' ? '⚠️ WARN' : item.status === 'fail' ? '❌ FAIL' : '— N/A'
      return `
        <tr>
          <td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #F1F5F9;">${item.name}</td>
          <td style="padding:10px 14px;text-align:center;border-bottom:1px solid #F1F5F9;">
            <span style="display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;background:${statusBg};color:${statusColor};">${statusLabel}</span>
          </td>
          <td style="padding:10px 14px;font-size:12px;color:#64748B;border-bottom:1px solid #F1F5F9;">${item.notes || '—'}</td>
        </tr>`
    }).join('')

    return `
      <div style="margin-bottom:20px;">
        <div style="font-size:14px;font-weight:700;color:#1E40AF;margin-bottom:8px;">${cat.icon || '🔧'} ${cat.name}</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#F8FAFC;">
              <th style="text-align:left;padding:8px 14px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Item</th>
              <th style="text-align:center;padding:8px 14px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;width:100px;">Status</th>
              <th style="text-align:left;padding:8px 14px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Notes</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Inspection - ${job.id}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; font-size:13px; color:#1a1a1a; background:#fff; padding:32px; max-width:700px; margin:0 auto; }
    @media print { body { padding:20px; } @page { margin:10mm; size:A4; } }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid #1E40AF;margin-bottom:20px;">
    <div>
      <div style="font-size:26px;font-weight:800;color:#1E40AF;display:flex;align-items:center;gap:8px;">
        <img src="${jwLogo}" alt="Logo" style="width:32px;height:32px;object-fit:contain;" />
        JW Tuned
      </div>
      <div style="font-size:12px;color:#64748B;margin-top:2px;">Professional Auto Service · Kottayam, Kerala</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:16px;font-weight:700;color:#1E40AF;">${job.id}</div>
      <div style="font-size:12px;color:#64748B;margin-top:3px;">${date}${time ? ' · ' + time : ''}</div>
      <div style="display:inline-block;background:#EFF6FF;color:#1D4ED8;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;margin-top:6px;text-transform:uppercase;letter-spacing:0.05em;">Vehicle Inspection</div>
    </div>
  </div>

  <!-- VEHICLE INFO -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;">
      <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">👤 Customer</div>
      <div style="font-size:14px;font-weight:700;margin-bottom:2px;">${job.customerName}</div>
      <div style="font-size:12px;color:#64748B;">${job.phone}</div>
    </div>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;">
      <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">🚗 Vehicle</div>
      <div style="font-size:14px;font-weight:700;font-family:'Courier New',monospace;color:#1E40AF;letter-spacing:0.08em;margin-bottom:2px;">${job.regNumber}</div>
      <div style="font-size:12px;color:#64748B;">${job.makeModel}${job.odometer ? ' · ' + job.odometer + ' km' : ''}</div>
    </div>
  </div>

  <!-- SUMMARY -->
  <div style="display:flex;gap:12px;margin-bottom:24px;">
    <div style="flex:1;background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:24px;font-weight:900;color:#15803D;">${passCount}</div>
      <div style="font-size:11px;font-weight:600;color:#15803D;text-transform:uppercase;">Pass</div>
    </div>
    <div style="flex:1;background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:24px;font-weight:900;color:#B45309;">${warnCount}</div>
      <div style="font-size:11px;font-weight:600;color:#B45309;text-transform:uppercase;">Warning</div>
    </div>
    <div style="flex:1;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:24px;font-weight:900;color:#DC2626;">${failCount}</div>
      <div style="font-size:11px;font-weight:600;color:#DC2626;text-transform:uppercase;">Fail</div>
    </div>
    <div style="flex:1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:24px;font-weight:900;color:#1a1a1a;">${totalItems}</div>
      <div style="font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;">Total</div>
    </div>
  </div>

  <!-- CHECKLIST -->
  ${categoriesHtml}

  ${insp.overallNotes ? `
  <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400E;margin-bottom:24px;">
    📝 <strong>Overall Notes:</strong> ${insp.overallNotes}
  </div>` : ''}

  <!-- FOOTER -->
  <div style="border-top:1px solid #E2E8F0;padding-top:16px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:12px;color:#64748B;line-height:1.6;">
      <div style="font-size:13px;font-weight:700;color:#1E40AF;">Inspected by JW Tuned 🙏</div>
      ${insp.completedBy ? `<div>Technician: <strong>${insp.completedBy}</strong></div>` : ''}
      <div>This is a digital vehicle inspection report.</div>
    </div>
    <div style="text-align:center;width:160px;">
      <div style="height:40px;"></div>
      <div style="border-top:1px solid #94A3B8;padding-top:6px;font-size:11px;color:#94A3B8;">Authorised Signature</div>
    </div>
  </div>
</body>
</html>`
}

/**
 * Opens a new window with the branded inspection report and triggers print.
 */
export function printInspection(job) {
  const html = buildInspectionHtml(job)
  if (!html) return
  const win = window.open('', '_blank', 'width=750,height=900')
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); win.print() }
}

/**
 * Opens a new window, injects html2pdf, generates a PDF, and downloads it.
 */
export function downloadInspection(job) {
  let html = buildInspectionHtml(job)
  if (!html) return

  html = html.replace('</head>', `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
  </head>`)

  html = html.replace('</body>', `
    <script>
      window.onload = () => {
        html2pdf().set({
          margin: 10,
          filename: '${job.id}-Inspection.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(document.body).save().then(() => {
          setTimeout(() => window.close(), 1000);
        });
      };
    <\/script>
  </body>`)

  const win = window.open('', '_blank', 'width=750,height=900')
  win.document.write(html)
  win.document.close()
}

/**
 * Generates a WhatsApp share message summarizing the inspection.
 */
export function getInspectionWhatsAppUrl(job) {
  const insp = job.inspection
  if (!insp) return ''

  let pass = 0, warn = 0, fail = 0
  ;(insp.categories || []).forEach(cat => {
    cat.items.forEach(item => {
      if (item.status === 'pass') pass++
      else if (item.status === 'warn') warn++
      else if (item.status === 'fail') fail++
    })
  })

  const warnings = []
  ;(insp.categories || []).forEach(cat => {
    cat.items.forEach(item => {
      if (item.status === 'warn' || item.status === 'fail') {
        warnings.push(`• ${item.name}: ${item.status === 'warn' ? '⚠️' : '❌'}${item.notes ? ' — ' + item.notes : ''}`)
      }
    })
  })

  const msg = [
    `🔍 *Vehicle Inspection Report*`,
    `*${job.makeModel}* (${job.regNumber})`,
    `Job: ${job.id}`,
    ``,
    `✅ Pass: ${pass}  ⚠️ Warning: ${warn}  ❌ Fail: ${fail}`,
    warnings.length > 0 ? `\nItems needing attention:\n${warnings.join('\n')}` : '',
    insp.overallNotes ? `\n📝 Notes: ${insp.overallNotes}` : '',
    `\n— JW Tuned, Kottayam`,
  ].filter(Boolean).join('\n')

  return `https://wa.me/${job.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

export { INSPECTION_TEMPLATE as _TEMPLATES, STATUS_CONFIG }
