import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { fromDb } from './shared'
import jwLogo from './assets/jjw.svg'

/**
 * Customer Feedback and Rating Screen.
 * Allows customers to submit a 1-5 star review and testimonial.
 */
export default function FeedbackScreen() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function loadJob() {
      try {
        const { data, error: fetchError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single()
        
        if (fetchError) throw fetchError
        if (data) {
          setJob(fromDb(data))
        } else {
          setError('Job card not found.')
        }
      } catch (err) {
        setError(err.message || 'Error loading job details.')
      } finally {
        setLoading(false)
      }
    }
    loadJob()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) {
      alert('Please select a star rating.')
      return
    }
    setSubmitting(true)
    try {
      const currentInspection = job.inspection || {}
      const updatedInspection = {
        ...currentInspection,
        feedback: {
          rating,
          comment,
          submittedAt: new Date().toISOString()
        }
      }

      const { error: updateError } = await supabase
        .from('jobs')
        .update({ inspection: updatedInspection })
        .eq('id', job.id)

      if (updateError) throw updateError
      setSubmitted(true)
    } catch (err) {
      alert('Failed to submit feedback: ' + (err.message || err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505', color: '#fff' }}>
        <img src={jwLogo} alt="JW Tuned" style={{ width: 48, height: 48, marginBottom: 16, animation: 'spin 1.2s linear infinite', opacity: 0.7 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Loading job details...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505', color: '#fff', padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Feedback Link Expired or Invalid</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 360, lineHeight: 1.5, marginBottom: 24 }}>
          {error || 'The job card details could not be retrieved.'}
        </p>
        <button onClick={() => navigate('/')} style={{ background: '#E8310A', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Go to Home
        </button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505', color: '#fff', padding: 20, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 24, animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
          ✓
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Thank You!</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 400, lineHeight: 1.6, marginBottom: 32 }}>
          Your feedback has been saved successfully. Your review helps other customers and will be featured on our testimonials wall!
        </p>
        <button onClick={() => navigate('/')} style={{ background: '#fff', color: '#050505', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
          Back to Home Page
        </button>
        <style>{`
          @keyframes scaleUp {
            from { transform: scale(0.6); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050505 0%, #0F0E0E 100%)', color: '#fff', fontFamily: "'Barlow', 'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&display=swap');
        
        .feedback-card {
          width: 100%;
          max-width: 520px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 32px 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          backdrop-filter: blur(8px);
          margin-top: 24px;
        }

        .star {
          font-size: 36px;
          color: rgba(255, 255, 255, 0.15);
          cursor: pointer;
          transition: transform 0.15s, color 0.15s;
          display: inline-block;
          margin: 0 4px;
        }
        
        .star:hover {
          transform: scale(1.2);
        }

        .star.filled {
          color: #E8310A;
          text-shadow: 0 0 12px rgba(232, 49, 10, 0.6);
        }

        .star.hovered {
          color: #FF5A3D;
        }

        .submit-btn {
          width: 100%;
          height: 52px;
          background: #E8310A;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 12px;
        }

        .submit-btn:hover {
          background: #FF3D0D;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(232,49,10,0.4);
        }

        .submit-btn:disabled {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        textarea.feedback-input {
          width: 100%;
          height: 120px;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          padding: 14px;
          outline: none;
          transition: border-color 0.2s;
          resize: none;
          box-sizing: border-box;
        }

        textarea.feedback-input:focus {
          border-color: #E8310A;
          background: rgba(255,255,255,0.06);
        }
      `}</style>

      {/* Brand logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <img src={jwLogo} alt="JW Tuned" style={{ height: 36, objectFit: 'contain' }} />
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.02em' }}>JW Tuned</span>
      </div>

      <div className="feedback-card">
        <h1 style={{ fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 6, letterSpacing: '-0.5px' }}>
          SERVICE FEEDBACK
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
          Rate your experience for job <span style={{ fontFamily: 'monospace', color: '#fff', fontWeight: 600 }}>{job.id}</span>
        </p>

        {/* Vehicle & Customer summary */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Customer</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{job.customerName}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Vehicle</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{job.makeModel}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Reg. Number</div>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{job.regNumber}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Mechanic</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{job.mechanic || '—'}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stars */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overall Rating
            </label>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = star <= rating
                const isHovered = star <= hoverRating
                return (
                  <span
                    key={star}
                    className={`star${isFilled ? ' filled' : ''}${isHovered ? ' hovered' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </span>
                )
              })}
            </div>
            {rating > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#E8310A', marginTop: 4 }}>
                {rating === 1 ? 'Poor 😟' : rating === 2 ? 'Fair 😐' : rating === 3 ? 'Good 🙂' : rating === 4 ? 'Very Good 😊' : 'Excellent! 😍'}
              </span>
            )}
          </div>

          {/* Testimonial text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Testimonial (Optional)
            </label>
            <textarea
              className="feedback-input"
              placeholder="Tell us about the service quality, transparency, parts quality, or communication..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting || rating === 0} className="submit-btn">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
