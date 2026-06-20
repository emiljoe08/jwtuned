import { useEffect, useState, useRef } from 'react'
import jwLogo from './assets/jjw.svg'

/** Returns an SVG icon for WhatsApp. */
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{ verticalAlign: 'middle' }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.48-1.46-1.653-1.756-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.452-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

/** Returns an SVG icon for Instagram. */
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{ verticalAlign: 'middle' }}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.067 3.282.148 4.771 1.649 4.919 4.932.055 1.265.067 1.645.067 4.849 0 3.205-.012 3.584-.067 4.849-.148 3.281-1.637 4.783-4.919 4.932-1.266.055-1.646.067-4.85.067-3.204 0-3.584-.012-4.849-.067-3.283-.149-4.772-1.651-4.92-4.932-.054-1.265-.067-1.644-.067-4.849 0-3.204.013-3.584.067-4.849.148-3.281 1.637-4.784 4.92-4.932 1.265-.055 1.645-.067 4.849-.067zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

/**
 * Renders an animated floating SVG gear with varying opacity and blur to create depth.
 * @returns {JSX.Element} Floating gear element.
 */
function FloatingGear({ size, x, y, duration, opacity, blur }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size,
      opacity,
      filter: `blur(${blur || 0}px)`,
      animation: `gearSpin ${duration}s linear infinite`,
      pointerEvents: 'none',
      zIndex: 0,
      color: 'rgba(255,255,255,0.7)'
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </div>
  )
}

/**
 * A wrapper component that applies a 3D tilt transformation tracking mouse movement.
 * @returns {JSX.Element} The tilt-enabled card wrapper.
 */
function TiltCard({ children, style }) {
  const ref = useRef(null)

  /** Handles mouse movement to update the tilt perspective based on cursor position. */
  function handleMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12
    el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`
  }

  /** Resets the tilt transformation when the mouse leaves the element. */
  function handleLeave() {
    if (ref.current) ref.current.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)'
  }
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.15s ease', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  )
}

/**
 * Renders an expandable FAQ item.
 * @returns {JSX.Element} The FAQ item.
 */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 'clamp(14px,2vw,16px)', fontWeight: 700, padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
        {q}
        <span style={{ color: '#E8310A', fontSize: 22, flexShrink: 0, transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'none', display: 'inline-block' }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, paddingBottom: 20 }}>{a}</p>
      </div>
    </div>
  )
}

/**
 * Main Landing Page component for the public-facing website.
 * @returns {JSX.Element} The landing page screen.
 */
export default function LandingPage({ onEnter }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeService, setActiveService] = useState(null)
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, cx: 0, cy: 0, active: false })
  const [clickPulse, setClickPulse] = useState(false)
  const clickTimeout = useRef(null)

  /**
   * Tracks global mouse movements to apply parallax and displacement effects to background elements.
   * @param {MouseEvent} e - The mouse move event.
   */
  function handleMouseMove(e) {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x, y,
      cx: e.clientX - rect.left,
      cy: e.clientY - rect.top,
      active: true
    });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const services = [
    { icon: '⚙️', title: 'Full Service', desc: 'Complete engine oil, filters, spark plugs, coolant top-up and full vehicle inspection.' },
    { icon: '💨', title: 'Custom Exhausts & Headers', desc: 'Performance exhaust systems, custom headers, and muffler upgrades for enhanced sound and maximum power.' },
    { icon: '🏎️', title: 'Custom Bodykits', desc: 'High-quality aero kits, spoilers, bumpers, and side skirts to give your vehicle a unique, aggressive look.' },
    { icon: '🔩', title: 'Suspension & Brakes', desc: 'Shock absorbers, brake pads, disc and drum service for safe, comfortable driving.' },
    { icon: '🏍️', title: 'Two-Wheeler Service', desc: 'Engine tune-up, chain service, brake pads — everything your bike or scooter needs.' },
    { icon: '🔬', title: 'Diagnostics', desc: 'Computer diagnostics, engine fault reading, and full pre-purchase inspection reports.' },
  ]

  const brands = [
    { name: 'Suzuki', slug: 'suzuki' },
    { name: 'Hyundai', slug: 'hyundai' },
    { name: 'Honda', slug: 'honda' },
    { name: 'Toyota', slug: 'toyota' },
    { name: 'Kia', slug: 'kia' },
    { name: 'Ford', slug: 'ford' },
    { name: 'Volkswagen', slug: 'volkswagen' },
    { name: 'Skoda', slug: 'skoda' },
    { name: 'Renault', slug: 'renault' },
    { name: 'BMW', slug: 'bmw' },
    { name: 'Mercedes', slug: 'mercedesbenz' },
    { name: 'Nissan', slug: 'nissan' },
  ]
  const marqueeBrands = [...brands, ...brands, ...brands, ...brands]

  const faqs = [
    { q: 'Where are you located?', a: 'We are located in Kottayam, Kerala. Contact us on WhatsApp or call for the exact address and directions.' },
    { q: 'What are your working hours?', a: 'We are open Monday to Friday from 8 AM to 7 PM, and Saturday from 8 AM to 5 PM. We are closed on Sundays.' },
    { q: 'Do you use genuine parts?', a: 'Yes, we use only manufacturer-recommended genuine parts for all repairs and services. Your vehicle warranty stays intact.' },
    { q: 'How long does a full service take?', a: 'A standard full service typically takes 2–4 hours depending on the vehicle and any additional work required.' },
    { q: 'Do you service two-wheelers?', a: 'Yes! We service all types of bikes and scooters — Hero, Honda, TVS, Bajaj, Royal Enfield, and more.' },
    { q: 'Can I get a bill via WhatsApp?', a: 'Absolutely. We send itemised bills and job status updates directly to your WhatsApp throughout the service.' },
  ]

  const stats = [
    { value: '5+', label: 'Years in Business' },
    { value: '1000+', label: 'Vehicles Serviced' },
    { value: '2 & 4', label: 'Wheeler Specialists' },
    { value: '100%', label: 'Genuine Parts' },
  ]

  const testimonials = [
    { name: 'Rahul S.', text: 'Best workshop in Kottayam! They kept me updated on WhatsApp with photos. Very transparent.', vehicle: 'Honda City', rating: '⭐⭐⭐⭐⭐' },
    { name: 'Kiran V.', text: 'Quick and professional service. The mechanics really know what they are doing. Highly recommended.', vehicle: 'Royal Enfield Classic 350', rating: '⭐⭐⭐⭐⭐' },
    { name: 'Anoop T.', text: 'Genuine parts and no hidden charges. The itemised billing is something you rarely see around here.', vehicle: 'Maruti Swift', rating: '⭐⭐⭐⭐⭐' }
  ]
  const marqueeTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials]

  return (
    <div style={{ background: '#0A0A0A', color: '#fff', fontFamily: "'Barlow', 'Segoe UI', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        h1, h2, h3, h4, h5, h6 { color: inherit; }

        @keyframes gearSpin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0px) rotateX(15deg) rotateY(-15deg); } 50% { transform: translateY(-20px) rotateX(15deg) rotateY(-15deg); } }
        @keyframes floatDelay { 0%,100% { transform: translateY(0px) rotateX(-10deg) rotateY(20deg); } 50% { transform: translateY(-15px) rotateX(-10deg) rotateY(20deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse3d { 0%,100% { box-shadow: 0 0 0 0 rgba(232,49,10,0.4); } 50% { box-shadow: 0 0 0 20px rgba(232,49,10,0); } }
        @keyframes logoFloat { 0%, 100% { transform: scale(1); opacity: 0.015; } 50% { transform: scale(1.05); opacity: 0.03; } }
        @keyframes logoRipple { 0% { transform: scale(1); opacity: 0.03; filter: blur(0px); } 50% { transform: scale(1.3); opacity: 0.15; filter: blur(4px); } 100% { transform: scale(1); opacity: 0.03; filter: blur(0px); } }

        .fade-up { animation: fadeUp 0.7s ease forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; } .d2 { animation-delay: 0.25s; }
        .d3 { animation-delay: 0.4s; } .d4 { animation-delay: 0.55s; }

        @keyframes scrollX { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .scroll-track { display: flex; width: max-content; animation: scrollX 30s linear infinite; }
        .scroll-track:hover { animation-play-state: paused; }
        .brand-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; width: 140px; height: 80px; transition: all 0.25s ease; cursor: pointer; }
        .brand-card:hover { background: rgba(232,49,10,0.1); border-color: rgba(232,49,10,0.3); transform: translateY(-4px); }
        .brand-card img { transition: all 0.25s ease; filter: brightness(0.5); }
        .brand-card:hover img { filter: brightness(1); }
        .logo-ripple { animation: logoRipple 0.6s cubic-bezier(0.2, 1, 0.2, 1) !important; }

        .nav-link { color: rgba(255,255,255,0.85); text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.02em; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }

        .btn-red { display:inline-flex; align-items:center; gap:8px; background:#E8310A; color:#fff; border:none; border-radius:4px; padding:14px 28px; font-family:inherit; font-size:14px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; cursor:pointer; text-decoration:none; transition:all 0.2s; position:relative; overflow:hidden; }
        .btn-red::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent); transform:translateX(-100%); transition:transform 0.4s; }
        .btn-red:hover::after { transform:translateX(100%); }
        .btn-red:hover { background:#FF3D0D; transform:translateY(-2px); box-shadow:0 8px 24px rgba(232,49,10,0.4); }

        .btn-ghost { display:inline-flex; align-items:center; gap:8px; background:transparent; color:#fff; border:1.5px solid rgba(255,255,255,0.2); border-radius:4px; padding:13px 28px; font-family:inherit; font-size:14px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; cursor:pointer; text-decoration:none; transition:all 0.2s; }
        .btn-ghost:hover { border-color:#fff; background:rgba(255,255,255,0.05); }

        .svc-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:28px 24px; cursor:pointer; transition:all 0.25s; transform-style:preserve-3d; }
        .svc-card:hover { border-color:rgba(232,49,10,0.5); background:rgba(232,49,10,0.05); transform:perspective(600px) translateZ(12px) translateY(-4px); box-shadow:0 20px 40px rgba(232,49,10,0.15); }

        .brand-pill { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:12px 20px; font-size:13px; font-weight:700; color:rgba(255,255,255,0.5); letter-spacing:0.05em; text-transform:uppercase; transition:all 0.2s; text-align:center; }
        .brand-pill:hover { background:rgba(232,49,10,0.1); border-color:rgba(232,49,10,0.3); color:#fff; }

        .stat-block { text-align:center; padding:28px 16px; }

        .process-step { display:flex; gap:20px; align-items:flex-start; padding:24px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:10px; transition:all 0.2s; }
        .process-step:hover { border-color:rgba(232,49,10,0.3); background:rgba(232,49,10,0.03); }

        .contact-input { width:100%; height:48px; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1); border-radius:6px; color:#fff; font-family:inherit; font-size:14px; padding:0 16px; outline:none; transition:border-color 0.2s; }
        .contact-input:focus { border-color:#E8310A; }
        .contact-input::placeholder { color:rgba(255,255,255,0.5); }
        textarea.contact-input { height:120px; padding:14px 16px; resize:none; }

        @media (max-width:768px) {
          .desktop-nav { display:none !important; }
          .mobile-btn { display:flex !important; }
          .hero-actions { flex-direction:column; }
          .hero-actions a, .hero-actions button { justify-content:center; }
          .services-grid { grid-template-columns:1fr !important; }
          .brands-grid { grid-template-columns:repeat(3,1fr) !important; }
          .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .process-grid { grid-template-columns:1fr !important; }
          .contact-grid { grid-template-columns:1fr !important; }
          .footer-inner { flex-direction:column !important; align-items:center !important; text-align:center; gap:24px !important; }
          .section-head { flex-direction:column !important; align-items:flex-start !important; }
          .gear-bg { display:none; }
        }
        @media (min-width:769px) {
          .mobile-btn { display:none !important; }
          .mobile-menu { display:none !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:200, padding:'0 5%', height:68, display:'flex', alignItems:'center', justifyContent:'space-between', background: scrolled ? 'rgba(10,10,10,0.97)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none', transition:'all 0.3s' }}>
        <div style={{ display:'flex', alignItems:'center' }}>
          <img src={jwLogo} alt="JW Tuned" style={{ height:38, objectFit:'contain' }} />
        </div>
        <div className="desktop-nav" style={{ display:'flex', alignItems:'center', gap:28 }}>
          {['#services','#process','#about','#testimonials','#faq','#contact'].map((href,i) => (
            <a key={href} href={href} className="nav-link">{['Services','Process','About','Reviews','FAQ','Contact'][i]}</a>
          ))}
          <a href="https://www.instagram.com/jw_tuned" target="_blank" rel="noreferrer" className="nav-link"><InstagramIcon /></a>
          <a href="tel:+919447403837" className="btn-red" style={{ padding:'9px 18px', fontSize:13 }}>📞 Book Now</a>
          <a href="/dashboard" target="_blank" rel="noopener noreferrer" style={{ background:'none', border:'none', color:'rgba(255,255,255,0.6)', fontSize:12, cursor:'pointer', fontFamily:'inherit', textDecoration:'none' }}>Staff →</a>
        </div>
        <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ background:'none', border:'none', color:'#fff', fontSize:22, cursor:'pointer', display:'flex', alignItems:'center' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{ position:'fixed', top:68, inset:'68px 0 0', background:'#0A0A0A', zIndex:199, padding:'32px 24px', display:'flex', flexDirection:'column', gap:4, overflowY:'auto' }}>
          {['#services','#process','#about','#testimonials','#faq','#contact'].map((href,i) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{ color:'#fff', textDecoration:'none', fontSize:26, fontWeight:800, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', letterSpacing:'-0.3px' }}>
              {['Services','Process','About','Reviews','FAQ','Contact'][i]}
            </a>
          ))}
          <div style={{ display:'flex', gap:12, marginTop:24, flexDirection:'column' }}>
            <a href="tel:+919447403837" className="btn-red" style={{ justifyContent:'center' }}>📞 Book a Service</a>
            <a href="https://wa.me/919447403837" target="_blank" rel="noreferrer" className="btn-ghost" style={{ justifyContent:'center' }}><WhatsAppIcon /> WhatsApp</a>
            <button onClick={() => { setMenuOpen(false); onEnter() }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.6)', fontSize:13, cursor:'pointer', fontFamily:'inherit', marginTop:4 }}>Staff Portal →</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <div 
        style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', padding:'100px 5% 80px', overflow:'hidden' }} 
        onMouseMove={handleMouseMove} 
        onMouseLeave={() => setMousePos(p => ({ ...p, active: false }))}
        onClick={() => {
          setClickPulse(false);
          clearTimeout(clickTimeout.current);
          setTimeout(() => setClickPulse(true), 10);
          clickTimeout.current = setTimeout(() => setClickPulse(false), 600);
        }}
      >

        {/* Layered background */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, #0A0A0A 0%, #0F0F0F 40%, #110808 100%)' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(232,49,10,0.06) 1px, transparent 1px)', backgroundSize:'40px 40px', transition: 'transform 0.1s ease-out', transform: `translate(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px)` }} />
        <div style={{ position:'absolute', top:'10%', right:'-10%', width:'60%', height:'80%', background:'radial-gradient(ellipse, rgba(232,49,10,0.15) 0%, transparent 65%)', pointerEvents:'none' }} />

        {/* Subtle Background Logo Following Mouse */}
        <div style={{ position: 'absolute', left: mousePos.active ? mousePos.cx : '80%', top: mousePos.active ? mousePos.cy : '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0, transition: mousePos.active ? 'left 0.15s ease-out, top 0.15s ease-out' : 'left 0.8s cubic-bezier(0.2, 1, 0.2, 1), top 0.8s cubic-bezier(0.2, 1, 0.2, 1)' }}>
          <img
            src={jwLogo}
            alt=""
            style={{
              width: 'clamp(300px, 45vw, 700px)',
              animation: 'logoFloat 12s ease-in-out infinite'
            }}
            className={clickPulse ? 'logo-ripple' : ''}
          />
        </div>

        {/* Floating 3D gears */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transition: 'transform 0.1s ease-out', transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)` }}>
          <div className="gear-bg">
            <FloatingGear size={180} x="62%" y="8%" duration={25} opacity={0.12} />
            <FloatingGear size={100} x="78%" y="55%" duration={18} opacity={0.08} blur={1} />
            <FloatingGear size={60}  x="55%" y="70%" duration={12} opacity={0.04} blur={2} />
          </div>
        </div>

        {/* 3D floating cube accent */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transition: 'transform 0.1s ease-out', transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}>
          <div className="gear-bg" style={{ position:'absolute', right:'8%', top:'20%', width:160, height:160, transformStyle:'preserve-3d', animation:'float 6s ease-in-out infinite' }}>
            <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))', border:'1px solid rgba(255,255,255,0.15)', borderRadius:16, backdropFilter:'blur(4px)', transform:'perspective(400px) rotateX(15deg) rotateY(-15deg)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ position:'absolute', inset:1, background:'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)', borderRadius:15 }} />
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:48 }}>🔧</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transition: 'transform 0.1s ease-out', transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)` }}>
          <div style={{ position:'absolute', right:'18%', bottom:'15%', width:100, height:100, transformStyle:'preserve-3d', animation:'floatDelay 8s ease-in-out infinite' }} className="gear-bg">
            <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, transform:'perspective(300px) rotateX(-10deg) rotateY(20deg)' }}>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:30 }}>⚡</div>
            </div>
          </div>
        </div>

        <div style={{ position:'relative', zIndex:1, width:'100%', margin:'0 auto' }}>
          <div style={{ maxWidth:660 }}>
            <div className="fade-up d1" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(232,49,10,0.1)', border:'1px solid rgba(232,49,10,0.25)', borderRadius:3, padding:'6px 14px', fontSize:11, fontWeight:700, color:'#E8310A', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:24 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#E8310A', display:'inline-block', animation:'pulse3d 2s ease infinite' }} />
              Kottayam's Trusted Auto Workshop
            </div>

            <h1 className="fade-up d2" style={{ fontSize:'clamp(46px,8.5vw,84px)', fontWeight:900, lineHeight:1.0, letterSpacing:'-2px', marginBottom:22 }}>
              YOUR<br />
              <em style={{ fontStyle:'italic', color:'#E8310A' }}>PERFORMANCE</em><br />
              PARTNER.
            </h1>

            <p className="fade-up d3" style={{ fontSize:'clamp(15px,1.8vw,18px)', color:'rgba(255,255,255,0.85)', lineHeight:1.75, maxWidth:460, marginBottom:36 }}>
              Professional servicing for all cars and two-wheelers in Kottayam. Genuine parts, transparent pricing, WhatsApp updates at every step.
            </p>

            <div className="fade-up d4 hero-actions" style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href="tel:+919447403837" className="btn-red" style={{ fontSize:15, padding:'16px 32px', animation:'pulse3d 3s ease infinite' }}>
                📞 Book a Service
              </a>
              <a href="https://wa.me/919447403837" target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize:15, padding:'15px 32px' }}>
                <WhatsAppIcon /> WhatsApp Us
              </a>
              <a href="https://www.instagram.com/jw_tuned" target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize:15, padding:'15px 32px' }}>
                <InstagramIcon /> Follow Us
              </a>
            </div>

            <div className="fade-up d4" style={{ marginTop:36, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'rgba(255,255,255,0.7)' }}>
                <span style={{ color:'#22C55E' }}>●</span> Open Today · 9 AM – 7 PM
              </div>
              <div style={{ width:1, height:14, background:'rgba(255,255,255,0.12)' }} />
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>📍 Kottayam, Kerala</div>
              <div style={{ width:1, height:14, background:'rgba(255,255,255,0.12)' }} />
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>+91 9447403837</div>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transition: 'transform 0.1s ease-out', transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}>
          <div style={{ position:'absolute', bottom:'-3%', right:'-1%', fontSize:'clamp(70px,14vw,170px)', fontWeight:900, color:'rgba(255,255,255,0.015)', letterSpacing:'-6px', userSelect:'none', pointerEvents:'none', lineHeight:1 }}>TUNED</div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background:'#E8310A', borderTop:'1px solid rgba(255,255,255,0.1)', padding:'0 5%' }}>
        <div style={{ margin:'0 auto', width:'100%', display:'grid' }} className="stats-grid" data-cols="4">
          {stats.map((s, i) => (
            <div key={s.label} className="stat-block" style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
              <div style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:900, letterSpacing:'-1px', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.9)', marginTop:5, fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div id="services" style={{ padding:'clamp(60px,8vw,100px) 5%' }}>
        <div style={{ margin:'0 auto', width:'100%' }}>
          <div style={{ marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#E8310A', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>// Services</div>
            <div className="section-head" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:20 }}>
              <h2 style={{ fontSize:'clamp(30px,5vw,52px)', fontWeight:900, letterSpacing:'-1.5px', lineHeight:1.05 }}>
                OUR<br />SERVICES
              </h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.75)', maxWidth:320, lineHeight:1.7 }}>
                From quick fixes to full overhauls — we handle everything your vehicle needs.
              </p>
            </div>
          </div>

          <div className="services-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {services.map((s, i) => (
              <TiltCard key={s.title} style={{}}>
                <div className="svc-card" onClick={() => setActiveService(activeService === i ? null : i)}>
                  <div style={{ fontSize:36, marginBottom:16 }}>{s.icon}</div>
                  <h3 style={{ fontSize:17, fontWeight:800, marginBottom:10, letterSpacing:'-0.3px' }}>{s.title}</h3>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.8)', lineHeight:1.7, marginBottom:16 }}>{s.desc}</p>
                  <a href="tel:+919447403837" className="btn-red" style={{ fontSize:12, padding:'9px 16px' }}>Book Now →</a>
                </div>
              </TiltCard>
            ))}
          </div>

          {/* Looking for something else */}
          <div style={{ marginTop:32, background:'rgba(232,49,10,0.05)', border:'1px solid rgba(232,49,10,0.15)', borderRadius:10, padding:'24px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>Looking for something else?</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.8)', fontStyle:'italic' }}>We offer many additional services — just ask.</div>
            </div>
            <a href="https://wa.me/919447403837" target="_blank" rel="noreferrer" className="btn-red"><WhatsAppIcon /> Ask on WhatsApp</a>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div id="about" style={{ background:'#0F0F0F', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'clamp(60px,8vw,100px) 5%', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:400, height:400, background:'radial-gradient(circle, rgba(232,49,10,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ margin:'0 auto', width:'100%', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:60, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#E8310A', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>// About</div>
            <h2 style={{ fontSize:'clamp(30px,5vw,48px)', fontWeight:900, letterSpacing:'-1px', lineHeight:1.05, marginBottom:24 }}>
              ABOUT<br />JW TUNED
            </h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.85)', lineHeight:1.8, marginBottom:20 }}>
              JW Tuned is a professional auto service workshop based in Kottayam, Kerala. We specialise in servicing both two-wheelers and four-wheelers with a focus on quality, transparency, and customer satisfaction.
            </p>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.85)', lineHeight:1.8, marginBottom:32 }}>
              With over 5 years of hands-on experience, our team has serviced 1000+ vehicles across all major brands. We believe in honest work, genuine parts, and keeping you informed at every step.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href="tel:+919447403837" className="btn-red">📞 Call Us</a>
              <a href="https://www.instagram.com/jw_tuned" target="_blank" rel="noreferrer" className="btn-ghost"><InstagramIcon /> Our Work</a>
            </div>
          </div>

          {/* 3D feature list */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { icon:'📸', t:'Photo Documentation', d:'Every vehicle photographed on arrival. Every dent logged. Zero disputes at delivery.' },
              { icon:'💬', t:'WhatsApp Updates', d:'Real-time status updates sent to your phone throughout the service.' },
              { icon:'🧾', t:'Transparent Billing', d:'Itemised bills showing every part and labour charge. No hidden costs.' },
              { icon:'🔩', t:'Genuine Parts Only', d:'We use only manufacturer-recommended parts. Your warranty stays intact.' },
            ].map(f => (
              <TiltCard key={f.t} style={{}}>
                <div style={{ display:'flex', gap:16, alignItems:'flex-start', padding:'16px 18px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, transition:'all 0.2s' }}>
                  <span style={{ fontSize:24, flexShrink:0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, marginBottom:4 }}>{f.t}</div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.75)', lineHeight:1.6 }}>{f.d}</div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROCESS ── */}
      <div id="process" style={{ padding:'clamp(60px,8vw,100px) 5%' }}>
        <div style={{ margin:'0 auto', width:'100%' }}>
          <div style={{ marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#E8310A', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>// How It Works</div>
            <h2 style={{ fontSize:'clamp(30px,5vw,52px)', fontWeight:900, letterSpacing:'-1.5px', lineHeight:1.05 }}>OUR PROCESS</h2>
          </div>

          <div className="process-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {[
              { step:'01', icon:'📞', t:'Book', d:'Call or WhatsApp us to schedule your service at a convenient time.' },
              { step:'02', icon:'🔍', t:'Inspect', d:'We photograph your vehicle and do a full inspection, then share an estimate.' },
              { step:'03', icon:'🔧', t:'Service', d:'Our mechanics carry out the agreed work using genuine parts.' },
              { step:'04', icon:'✅', t:'Deliver', d:'Vehicle ready notification on WhatsApp. Itemised bill shared before pickup.' },
            ].map((p, i) => (
              <TiltCard key={p.step} style={{}}>
                <div className="process-step" style={{ flexDirection:'column', position:'relative', overflow:'hidden' }}>
                  <div style={{ fontSize:60, fontWeight:900, color:'rgba(232,49,10,0.08)', position:'absolute', top:-10, right:10, lineHeight:1, pointerEvents:'none' }}>{p.step}</div>
                  <div style={{ fontSize:32, marginBottom:14, position:'relative' }}>{p.icon}</div>
                  <div style={{ fontSize:16, fontWeight:800, marginBottom:8, position:'relative' }}>{p.t}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.75)', lineHeight:1.65, position:'relative' }}>{p.d}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>

      {/* ── BRANDS ── */}
      <div style={{ background:'#0F0F0F', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'clamp(48px,6vw,72px) 0', overflow:'hidden' }}>
        <div style={{ margin:'0 auto', width:'100%', padding:'0 5%' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#E8310A', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>// Brands</div>
          <h2 style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:900, letterSpacing:'-1px' }}>
            BRANDS THAT<br /><em style={{ fontStyle:'italic', color:'#E8310A' }}>WE SERVICE</em>
          </h2>
        </div>
        <div style={{ position:'relative', marginTop: 32 }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'10%', background:'linear-gradient(to right, #0F0F0F, transparent)', zIndex:2, pointerEvents:'none' }} />
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'10%', background:'linear-gradient(to left, #0F0F0F, transparent)', zIndex:2, pointerEvents:'none' }} />
          <div className="scroll-track" style={{ animationDuration: '35s' }}>
            {marqueeBrands.map((b, i) => (
              <div key={i} style={{ paddingRight: 20 }}>
                <div className="brand-card">
                  <img src={`https://cdn.simpleicons.org/${b.slug}/ffffff`} alt={b.name} style={{ height: 36, width: 36, objectFit: 'contain' }} title={b.name} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div id="testimonials" style={{ padding:'clamp(60px,8vw,100px) 0', overflow:'hidden' }}>
        <div style={{ margin:'0 auto', width:'100%', padding:'0 5%' }}>
          <div style={{ marginBottom:52, textAlign:'center' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#E8310A', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>// Testimonials</div>
            <h2 style={{ fontSize:'clamp(30px,5vw,52px)', fontWeight:900, letterSpacing:'-1.5px', lineHeight:1.05 }}>
              WHAT OUR<br /><em style={{ fontStyle:'italic', color:'#E8310A' }}>CUSTOMERS SAY</em>
            </h2>
          </div>
        </div>
        
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'10%', background:'linear-gradient(to right, #0A0A0A, transparent)', zIndex:2, pointerEvents:'none' }} />
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'10%', background:'linear-gradient(to left, #0A0A0A, transparent)', zIndex:2, pointerEvents:'none' }} />
          <div className="scroll-track" style={{ animationDuration: '50s' }}>
            {marqueeTestimonials.map((t, i) => (
              <div key={i} style={{ width: 380, paddingRight: 24, flexShrink: 0, height: '100%' }}>
                <TiltCard style={{ height: '100%' }}>
                  <div className="svc-card" style={{ padding:'32px 24px', display:'flex', flexDirection:'column', height:'100%' }}>
                    <div style={{ fontSize:14, marginBottom:16 }}>{t.rating}</div>
                    <p style={{ fontSize:15, color:'rgba(255,255,255,0.9)', lineHeight:1.7, fontStyle:'italic', flex:1, marginBottom:24 }}>"{t.text}"</p>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(232,49,10,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#E8310A', fontWeight:800, fontSize:14 }}>{t.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:800 }}>{t.name}</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>{t.vehicle}</div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" style={{ padding:'clamp(60px,8vw,100px) 5%' }}>
        <div style={{ margin:'0 auto', width:'100%' }}>
          <div style={{ marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#E8310A', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>// FAQ</div>
            <h2 style={{ fontSize:'clamp(28px,5vw,52px)', fontWeight:900, letterSpacing:'-1.5px', lineHeight:1.05 }}>
              FREQUENTLY ASKED<br /><em style={{ fontStyle:'italic', color:'#E8310A' }}>QUESTIONS</em>
            </h2>
          </div>
          <div style={{ maxWidth:780 }}>
            {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </div>

      {/* ── CONTACT ── */}
      <div id="contact" style={{ background:'#0F0F0F', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'clamp(60px,8vw,100px) 5%', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:500, height:500, background:'radial-gradient(circle, rgba(232,49,10,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ margin:'0 auto', width:'100%' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#E8310A', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>// Contact</div>
          <h2 style={{ fontSize:'clamp(28px,5vw,52px)', fontWeight:900, letterSpacing:'-1.5px', lineHeight:1.05, marginBottom:52 }}>
            GET IN TOUCH<br /><em style={{ fontStyle:'italic', color:'#E8310A' }}>WITH US</em>
          </h2>

          <div className="contact-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'start' }}>

            {/* Info */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[
                { icon:'📞', label:'Phone / WhatsApp', val:'+91 9447403837', href:'tel:+919447403837' },
                { icon:'📍', label:'Location', val:'Kottayam, Kerala', href:'https://maps.google.com' },
                { icon:<InstagramIcon />, label:'Instagram', val:'@jw_tuned', href:'https://www.instagram.com/jw_tuned' },
              ].map(c => (
                <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ textDecoration:'none', display:'flex', gap:16, alignItems:'center', padding:'20px 22px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, transition:'all 0.2s', color:'#fff' }}>
                  <div style={{ width:44, height:44, background:'rgba(232,49,10,0.1)', border:'1px solid rgba(232,49,10,0.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{c.label}</div>
                    <div style={{ fontSize:16, fontWeight:800 }}>{c.val}</div>
                  </div>
                </a>
              ))}

              {/* Hours */}
              <div style={{ padding:'20px 22px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10 }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>🕐 Working Hours</div>
                {[
                  { d:'Mon – Fri', t:'8:00 AM – 7:00 PM', o:true },
                  { d:'Saturday',  t:'8:00 AM – 5:00 PM', o:true },
                  { d:'Sunday',    t:'Closed',             o:false },
                ].map(h => (
                  <div key={h.d} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:14 }}>
                    <span style={{ color:'rgba(255,255,255,0.85)' }}>{h.d}</span>
                    <span style={{ fontWeight:700, color: h.o ? '#22C55E' : '#EF4444' }}>{h.t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:32 }}>
              <div style={{ fontSize:16, fontWeight:800, marginBottom:6 }}>Send us a message</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:24 }}>We'll get back to you on WhatsApp.</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <input className="contact-input" placeholder="Your Name" value={formData.name} onChange={e => setFormData(p => ({...p, name:e.target.value}))} />
                <input className="contact-input" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData(p => ({...p, phone:e.target.value}))} inputMode="tel" />
                <textarea className="contact-input" placeholder="Describe your issue or service needed..." value={formData.message} onChange={e => setFormData(p => ({...p, message:e.target.value}))} />
                
                <a href={`https://wa.me/919447403837?text=${encodeURIComponent(`Hi JW Tuned! My name is ${formData.name}. ${formData.message}`)}`}
                  target="_blank" rel="noreferrer"
                  className="btn-red"
                  style={{ justifyContent:'center', marginTop:4 }}
                >
                  <WhatsAppIcon /> Send via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'28px 5%' }}>
        <div style={{ margin:'0 auto', width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }} className="footer-inner">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src={jwLogo} alt="JW Tuned" style={{ height:30, objectFit:'contain' }} />
            <div>
              <div style={{ fontWeight:900, fontSize:14, letterSpacing:'-0.3px' }}>JW TUNED</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', letterSpacing:'0.1em' }}>KOTTAYAM · KERALA</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:20, alignItems:'center', flexWrap:'wrap', justifyContent:'center' }}>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>© {new Date().getFullYear()} JW Tuned</span>
            <a href="https://www.instagram.com/jw_tuned" target="_blank" rel="noreferrer" style={{ color:'rgba(255,255,255,0.7)', fontSize:13, textDecoration:'none' }}><InstagramIcon /></a>
            <a href="https://wa.me/919447403837" target="_blank" rel="noreferrer" style={{ color:'rgba(255,255,255,0.7)', fontSize:13, textDecoration:'none' }}><WhatsAppIcon /></a>
          </div>
          <button onClick={onEnter} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.05em' }}>
            Staff Portal →
          </button>
        </div>
      </div>

    </div>
  )
}