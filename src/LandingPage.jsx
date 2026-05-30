import { useEffect, useRef, useState } from 'react'
import jwLogo from './assets/jwlogo.svg'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{ verticalAlign: 'middle' }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.48-1.46-1.653-1.756-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.452-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{ verticalAlign: 'middle' }}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.067 3.282.148 4.771 1.649 4.919 4.932.055 1.265.067 1.645.067 4.849 0 3.205-.012 3.584-.067 4.849-.148 3.281-1.637 4.783-4.919 4.932-1.266.055-1.646.067-4.85.067-3.204 0-3.584-.012-4.849-.067-3.283-.149-4.772-1.651-4.92-4.932-.054-1.265-.067-1.644-.067-4.849 0-3.204.013-3.584.067-4.849.148-3.281 1.637-4.784 4.92-4.932 1.265-.055 1.645-.067 4.849-.067zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

export default function LandingPage({ onEnter }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeService, setActiveService] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const services = [
    { icon: '🔧', title: 'Full Service', short: 'Engine & Filters', desc: 'Complete periodic maintenance — engine oil, air filter, oil filter, spark plugs, coolant top-up, and full vehicle inspection.' },
    //{ icon: '❄️', title: 'AC Service', short: 'Cooling System', desc: 'Gas refilling, compressor diagnostics, condenser cleaning, and full AC overhaul to keep you cool on Kerala roads.' },
    //{ icon: '🛞', title: 'Tyres & Wheels', short: 'Alignment & Balancing', desc: 'Puncture repair, new tyre fitting, wheel balancing and four-wheel alignment for precise, smooth handling.' },
    { icon: '⚡', title: 'Electricals', short: 'Wiring & Battery', desc: 'Battery replacement, alternator testing, starter motor repair, wiring diagnosis, and all electrical fault finding.' },
    { icon: '🏍️', title: 'Two-Wheelers', short: 'Bikes & Scooters', desc: 'Engine tune-up, chain and sprocket service, brake pads, tyre change — everything your bike or scooter needs.' },
    { icon: '🔩', title: 'Suspension', short: 'Brakes & Shocks', desc: 'Shock absorber replacement, brake pad and disc service, drum brake overhauling for safe, comfortable driving.' },
  ]

  const stats = [
    { value: '5+', label: 'Years in Business' },
    { value: '1000+', label: 'Vehicles Serviced' },
    { value: '2 & 4', label: 'Wheeler Specialists' },
    { value: '100%', label: 'Genuine Parts' },
  ]

  const whys = [
    { icon: '📸', title: 'Photo Documentation on Arrival', desc: 'Every vehicle photographed at check-in. Every scratch documented. Zero disputes.' },
    { icon: <WhatsAppIcon />, title: 'WhatsApp Updates', desc: "Status updates sent to your phone as work progresses. No need to call and ask." },
    { icon: '🧾', title: 'Clear Billing', desc: 'Every part and labour charge itemised. No hidden costs. No surprises at pickup.' },
    { icon: '👨‍🔧', title: 'Expert Mechanics', desc: 'Trained technicians with experience across all major Indian and international brands.' },
  ]

  return (
    <div style={{ background: '#0A0A0A', color: '#fff', fontFamily: "'Barlow', 'Segoe UI', sans-serif", overflowX: 'hidden', minHeight: '100vh' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        .nav-link {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #fff; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #E8310A; color: #fff;
          border: none; border-radius: 4px;
          padding: 14px 28px;
          font-family: inherit; font-size: 14px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
          cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-primary:hover { background: #FF3D0D; transform: translateY(-1px); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #fff;
          border: 1.5px solid rgba(255,255,255,0.25); border-radius: 4px;
          padding: 13px 28px;
          font-family: inherit; font-size: 14px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
          cursor: pointer; text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .btn-outline:hover { border-color: #fff; background: rgba(255,255,255,0.05); }

        .service-tab {
          padding: 14px 20px;
          border: none; border-left: 3px solid transparent;
          background: transparent; color: rgba(255,255,255,0.45);
          font-family: inherit; font-size: 14px; font-weight: 600;
          text-align: left; cursor: pointer; width: 100%;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .service-tab:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.03); }
        .service-tab.active { color: #fff; border-left-color: #E8310A; background: rgba(232,49,10,0.08); }

        .why-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 28px 24px;
          transition: border-color 0.2s, background 0.2s;
        }
        .why-card:hover { border-color: rgba(232,49,10,0.4); background: rgba(232,49,10,0.04); }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .stat-block { text-align: center; padding: 28px 16px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.25s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.4s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.55s; opacity: 0; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .hero-btns { flex-direction: column; align-items: stretch; }
          .hero-btns a, .hero-btns button { justify-content: center; }
          .services-layout { flex-direction: column !important; }
          .services-tabs { flex-direction: row !important; overflow-x: auto; border-left: none !important; border-right: none !important; border-bottom: 2px solid rgba(255,255,255,0.06) !important; }
          .service-tab { border-left: none !important; border-bottom: 3px solid transparent; white-space: nowrap; }
          .service-tab.active { border-bottom-color: #E8310A !important; border-left-color: transparent !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .footer-grid { flex-direction: column !important; gap: 32px !important; align-items: center !important; text-align: center; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stat-dividers > div { border-right: 1px solid rgba(255,255,255,0.2) !important; border-bottom: 1px solid rgba(255,255,255,0.2) !important; }
          .stat-dividers > div:nth-child(2n) { border-right: none !important; }
          .stat-dividers > div:nth-child(n+3) { border-bottom: none !important; }
          .section-header { align-items: flex-start !important; flex-direction: column !important; gap: 12px !important; }
        }

        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 200, padding: '0 5%', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(10,10,10,0.97)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none', transition: 'all 0.3s' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={jwLogo} alt="JW Tuned Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        </div>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#services" className="nav-link">Services</a>
          <a href="#why" className="nav-link">Why Us</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="https://www.instagram.com/jw_tuned?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="nav-link">Instagram</a>
          <a href="tel:+91XXXXXXXXXX" className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>📞 Book Service</a>
          <button onClick={onEnter} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Staff →</button>
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{ position: 'fixed', top: 68, left: 0, right: 0, bottom: 0, background: '#0A0A0A', zIndex: 199, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['#services', '#why', '#contact'].map((href, i) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: 28, fontWeight: 800, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', letterSpacing: '-0.5px' }}>
              {['Services', 'Why Us', 'Contact'][i]}
            </a>
          ))}
          <a href="https://www.instagram.com/jw_tuned?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: 28, fontWeight: 800, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', letterSpacing: '-0.5px' }}>
            Instagram
          </a>
          <a href="tel:+91XXXXXXXXXX" className="btn-primary" style={{ marginTop: 24, justifyContent: 'center' }}>📞 Book a Service</a>
          <button onClick={() => { setMenuOpen(false); onEnter() }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>Staff Portal →</button>
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 5% 80px', overflow: 'hidden' }}>

        {/* Background elements */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0A0A0A 0%, #111827 50%, #0A0A0A 100%)' }} />
        <div style={{ position: 'absolute', top: '15%', right: '-5%', width: '55%', height: '70%', background: 'radial-gradient(ellipse, rgba(232,49,10,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(24,95,165,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Diagonal accent line */}
        <div style={{ position: 'absolute', top: 0, right: '30%', width: 1, height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04), transparent)', transform: 'skewX(-15deg)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{ maxWidth: 680 }}>

            <div className="fade-up fade-up-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,49,10,0.12)', border: '1px solid rgba(232,49,10,0.3)', borderRadius: 3, padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#E8310A', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8310A', display: 'inline-block' }} />
              Kottayam's Trusted Auto Workshop
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontSize: 'clamp(44px, 8vw, 80px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 24 }}>
              PRECISION<br />
              <em style={{ fontStyle: 'italic', color: '#E8310A' }}>AUTO CARE</em><br />
              FOR EVERY VEHICLE.
            </h1>

            <p className="fade-up fade-up-3" style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 480, marginBottom: 40 }}>
              Expert servicing for cars and bikes in Kottayam. Genuine parts, transparent pricing, and WhatsApp updates at every step.
            </p>

            <div className="fade-up fade-up-4 hero-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="tel:+91XXXXXXXXXX" className="btn-primary" style={{ fontSize: 15, padding: '16px 32px' }}>
                📞 Book a Service
              </a>
              <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: 15, padding: '15px 32px' }}>
                <WhatsAppIcon /> WhatsApp Us
              </a>
              <a href="https://www.instagram.com/jw_tuned?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: 15, padding: '15px 32px' }}>
                <InstagramIcon /> Instagram
              </a>
            </div>

            <div className="fade-up fade-up-4" style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                <span style={{ color: '#22C55E', fontSize: 16 }}>●</span> Open Today · 9 AM – 7 PM
              </div>
              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>📍 Kottayam, Kerala</div>
            </div>
          </div>
        </div>

        {/* Large background text */}
        <div style={{ position: 'absolute', bottom: '-2%', right: '-2%', fontSize: 'clamp(80px, 15vw, 180px)', fontWeight: 900, color: 'rgba(255,255,255,0.02)', letterSpacing: '-8px', userSelect: 'none', pointerEvents: 'none', lineHeight: 1 }}>
          TUNED
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background: '#E8310A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }} className="stats-grid stat-dividers">
          {stats.map((s, i) => (
            <div key={s.label} className="stat-block" style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
              <div style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div id="services" style={{ padding: 'clamp(60px, 8vw, 100px) 5%', maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#E8310A', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>What We Do</div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.05 }}>
            COMPLETE AUTO<br />SERVICE & REPAIR
          </h2>
        </div>

        <div className="services-layout" style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>

          {/* Tabs */}
          <div className="services-tabs" style={{ display: 'flex', flexDirection: 'column', borderLeft: 'none', borderRight: '1px solid rgba(255,255,255,0.07)', minWidth: 220, background: 'rgba(255,255,255,0.01)' }}>
            {services.map((s, i) => (
              <button key={s.title} className={`service-tab${activeService === i ? ' active' : ''}`} onClick={() => setActiveService(i)}>
                <span style={{ marginRight: 10 }}>{s.icon}</span>{s.title}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, paddingLeft: 28 }}>{s.short}</div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: 'clamp(28px, 5%, 52px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>{services[activeService].icon}</div>
            <h3 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 16 }}>
              {services[activeService].title}
            </h3>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 440, marginBottom: 28 }}>
              {services[activeService].desc}
            </p>
            <a href="tel:+91XXXXXXXXXX" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              Book This Service →
            </a>
          </div>
        </div>
      </div>

      {/* ── WHY US ── */}
      <div id="why" style={{ background: '#111', padding: 'clamp(60px, 8vw, 100px) 5%', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#E8310A', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Why Choose Us</div>
              <h2 style={{ fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.05 }}>
                WE DO IT<br />DIFFERENTLY.
              </h2>
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 340, lineHeight: 1.7 }}>
              Every workshop claims to be the best. Here's what actually sets JW Tuned apart.
            </p>
          </div>

          <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {whys.map(w => (
              <div key={w.title} className="why-card">
                <div style={{ fontSize: 32, marginBottom: 18 }}>{w.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 10 }}>{w.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTACT ── */}
      <div id="contact" style={{ padding: 'clamp(60px, 8vw, 100px) 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#E8310A', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Get In Touch</div>
          <h2 style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 52 }}>
            VISIT US OR<br />CALL AHEAD.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

            <div style={{ background: '#E8310A', borderRadius: 8, padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}><WhatsAppIcon /></div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>Call / WhatsApp</div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 20 }}>+91 9447403837</div>
              <a href="tel:+91XXXXXXXXXX" className="btn-outline" style={{ fontSize: 13, padding: '10px 20px' }}>Call Now</a>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>📍</div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>Location</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Kottayam, Kerala</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20 }}>Your Street Address<br />Kerala — 686001</div>
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: 13, padding: '10px 20px' }}>Open Maps</a>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>🕐</div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, color: 'rgba(255,255,255,0.4)' }}>Working Hours</div>
              {[
                { day: 'Mon – Fri', time: '8:00 AM – 7:00 PM', open: true },
                { day: 'Saturday',  time: '8:00 AM – 5:00 PM', open: true },
                { day: 'Sunday',    time: 'Closed',             open: false },
              ].map(h => (
                <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{h.day}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: h.open ? '#22C55E' : '#EF4444' }}>{h.time}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}><InstagramIcon /></div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>Social Media</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Instagram</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20 }}>Follow us for daily<br />updates and projects.</div>
              <a href="https://www.instagram.com/jw_tuned?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: 13, padding: '10px 20px' }}>Follow @jw_tuned</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '32px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }} className="footer-grid">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <img src={jwLogo} alt="JW Tuned Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.3px' }}>JW TUNED</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>KOTTAYAM · KERALA</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} JW Tuned. All rights reserved.
            </div>
            <a href="https://www.instagram.com/jw_tuned?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13 }}>Instagram</a>
          </div>
          <button onClick={onEnter} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em' }}>
            Staff Portal →
          </button>
        </div>
      </div>

    </div>
  )
}