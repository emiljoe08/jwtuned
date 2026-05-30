import jwLogo from './assets/jjw.svg'

export function printBill({ job, items, discount, paid, payMode, note }) {
  const subtotal  = items.reduce((s, i) => s + (parseFloat(i.qty)||0) * (parseFloat(i.rate)||0), 0)
  const discAmt   = parseFloat(discount) || 0
  const total     = Math.max(0, subtotal - discAmt)
  const labourAmt = items.filter(i => i.type === 'labour').reduce((s, i) => s + (parseFloat(i.qty)||0)*(parseFloat(i.rate)||0), 0)
  const partsAmt  = items.filter(i => i.type === 'parts').reduce((s, i)  => s + (parseFloat(i.qty)||0)*(parseFloat(i.rate)||0), 0)
  const date      = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const time      = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const rows = items.map((item, idx) => {
    const amt = (parseFloat(item.qty)||0) * (parseFloat(item.rate)||0)
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>
          ${item.description || '—'}
          <span class="type-badge ${item.type}">${item.type === 'labour' ? 'Labour' : 'Parts'}</span>
        </td>
        <td class="center">${item.qty}</td>
        <td class="right">₹${parseFloat(item.rate||0).toLocaleString('en-IN')}</td>
        <td class="right">₹${amt.toLocaleString('en-IN')}</td>
      </tr>
    `
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bill - ${job.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 13px;
          color: #1a1a1a;
          background: #fff;
          padding: 32px;
          max-width: 680px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 2px solid #1E40AF;
          margin-bottom: 20px;
        }
        .brand-name {
          font-size: 26px;
          font-weight: 800;
          color: #1E40AF;
          letter-spacing: -0.5px;
        }
        .brand-sub {
          font-size: 12px;
          color: #64748B;
          margin-top: 2px;
        }
        .bill-meta {
          text-align: right;
        }
        .bill-id {
          font-size: 16px;
          font-weight: 700;
          color: #1E40AF;
        }
        .bill-date {
          font-size: 12px;
          color: #64748B;
          margin-top: 3px;
        }
        .bill-label {
          display: inline-block;
          background: #EFF6FF;
          color: #1D4ED8;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 10px;
          border-radius: 99px;
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── INFO GRID ── */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .info-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 12px 14px;
        }
        .info-box-title {
          font-size: 10px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 12px;
        }
        .info-label { color: #64748B; }
        .info-value { font-weight: 600; color: #1a1a1a; text-align: right; }
        .reg-number {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #1E40AF;
          letter-spacing: 0.08em;
        }

        /* ── TABLE ── */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        thead tr {
          background: #1E40AF;
          color: #fff;
        }
        thead th {
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: left;
        }
        thead th.center { text-align: center; }
        thead th.right  { text-align: right; }

        tbody tr { border-bottom: 1px solid #F1F5F9; }
        tbody tr:nth-child(even) { background: #F8FAFC; }
        tbody td {
          padding: 10px 12px;
          font-size: 13px;
          vertical-align: middle;
        }
        tbody td.center { text-align: center; }
        tbody td.right  { text-align: right; font-weight: 600; }

        .type-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 99px;
          margin-left: 6px;
          vertical-align: middle;
        }
        .type-badge.labour { background: #EFF6FF; color: #1D4ED8; }
        .type-badge.parts  { background: #F0FDF4; color: #15803D; }

        /* ── TOTALS ── */
        .totals-wrap {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .totals {
          width: 260px;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          overflow: hidden;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 14px;
          font-size: 13px;
          border-bottom: 1px solid #F1F5F9;
          color: #64748B;
        }
        .totals-row span:last-child { font-weight: 600; color: #1a1a1a; }
        .totals-row.discount span:last-child { color: #DC2626; }
        .totals-total {
          display: flex;
          justify-content: space-between;
          padding: 12px 14px;
          background: #1E40AF;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
        }

        /* ── PAYMENT ── */
        .payment-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: ${paid ? '#F0FDF4' : '#FFF5F5'};
          border: 1px solid ${paid ? '#86EFAC' : '#FECACA'};
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }
        .payment-status {
          font-size: 14px;
          font-weight: 700;
          color: ${paid ? '#15803D' : '#DC2626'};
        }
        .payment-mode {
          font-size: 12px;
          color: ${paid ? '#15803D' : '#DC2626'};
          background: ${paid ? '#DCFCE7' : '#FEE2E2'};
          padding: 3px 10px;
          border-radius: 99px;
          font-weight: 600;
        }

        /* ── NOTE ── */
        .note-box {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12px;
          color: #92400E;
          margin-bottom: 20px;
        }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid #E2E8F0;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-left {
          font-size: 12px;
          color: #64748B;
          line-height: 1.6;
        }
        .thank-you {
          font-size: 13px;
          font-weight: 700;
          color: #1E40AF;
        }
        .signature-box {
          text-align: center;
          width: 160px;
        }
        .signature-line {
          border-top: 1px solid #94A3B8;
          padding-top: 6px;
          font-size: 11px;
          color: #94A3B8;
        }

        @media print {
          body { padding: 20px; }
          @page { margin: 10mm; size: A4; }
        }
      </style>
    </head>
    <body>

      <!-- HEADER -->
      <div class="header">
        <div>
          <div class="brand-name" style="display: flex; align-items: center; gap: 8px;">
            <img src="${jwLogo}" alt="Logo" style="width: 32px; height: 32px; object-fit: contain;" />
            JW Tuned
          </div>
          <div class="brand-sub">Professional Auto Service · Kottayam, Kerala</div>
          <div class="brand-sub">Phone: +91 XXXXX XXXXX</div>
        </div>
        <div class="bill-meta">
          <div class="bill-id">${job.id}</div>
          <div class="bill-date">${date} · ${time}</div>
          <div class="bill-label">Service Bill</div>
        </div>
      </div>

      <!-- CUSTOMER + VEHICLE INFO -->
      <div class="info-grid">
        <div class="info-box">
          <div class="info-box-title">👤 Customer Details</div>
          <div class="info-row"><span class="info-label">Name</span><span class="info-value">${job.customerName}</span></div>
          <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${job.phone}</span></div>
          ${job.address ? `<div class="info-row"><span class="info-label">Address</span><span class="info-value">${job.address}</span></div>` : ''}
        </div>
        <div class="info-box">
          <div class="info-box-title">🚗 Vehicle Details</div>
          <div class="info-row"><span class="info-label">Reg. No.</span><span class="info-value reg-number">${job.regNumber}</span></div>
          <div class="info-row"><span class="info-label">Vehicle</span><span class="info-value">${job.makeModel}</span></div>
          <div class="info-row"><span class="info-label">Odometer</span><span class="info-value">${job.odometer} km</span></div>
          ${job.mechanic ? `<div class="info-row"><span class="info-label">Mechanic</span><span class="info-value">${job.mechanic}</span></div>` : ''}
        </div>
      </div>

      <!-- LINE ITEMS TABLE -->
      <table>
        <thead>
          <tr>
            <th style="width:32px">#</th>
            <th>Description</th>
            <th class="center" style="width:50px">Qty</th>
            <th class="right" style="width:90px">Rate</th>
            <th class="right" style="width:90px">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <!-- TOTALS -->
      <div class="totals-wrap">
        <div class="totals">
          <div class="totals-row"><span>Labour</span><span>₹${labourAmt.toLocaleString('en-IN')}</span></div>
          <div class="totals-row"><span>Parts</span><span>₹${partsAmt.toLocaleString('en-IN')}</span></div>
          <div class="totals-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
          ${discAmt > 0 ? `<div class="totals-row discount"><span>Discount</span><span>- ₹${discAmt.toLocaleString('en-IN')}</span></div>` : ''}
          <div class="totals-total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      <!-- PAYMENT STATUS -->
      <div class="payment-bar">
        <div class="payment-status">${paid ? '✅ Payment Received' : '🔴 Payment Pending'}</div>
        <div class="payment-mode">${paid ? payMode : 'Unpaid'}</div>
      </div>

      ${note ? `<div class="note-box">📝 Note: ${note}</div>` : ''}

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-left">
          <div class="thank-you">Thank you for choosing JW Tuned! 🙏</div>
          <div style="margin-top:4px">This is a computer generated bill.</div>
          <div>For queries, contact us at +91 XXXXX XXXXX</div>
        </div>
        <div class="signature-box">
          <div style="height: 40px"></div>
          <div class="signature-line">Authorised Signature</div>
        </div>
      </div>

    </body>
    </html>
  `

  // Open in new window and print
  const win = window.open('', '_blank', 'width=750,height=900')
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    win.focus()
    win.print()
  }
}