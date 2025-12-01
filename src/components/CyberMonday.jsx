import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CyberMonday.css'

function CyberMonday() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    consent: false
  })
  const [errors, setErrors] = useState({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.consent) {
      newErrors.consent = 'You must agree to receive emails to spin the wheel'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSpin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setIsSpinning(true)
    setErrors({})
    setResult(null)

    try {
      // Get the base API URL and construct the cybermonday endpoint
      const baseUrl = import.meta.env.VITE_AWS_API_URL || ''
      let API_URL = ''
      
      if (baseUrl) {
        // Replace /booking with /cybermonday-play, or append /cybermonday-play if no /booking found
        if (baseUrl.includes('/booking')) {
          API_URL = baseUrl.replace('/booking', '/cybermonday-play')
        } else {
          // If the URL doesn't have /booking, try to append /cybermonday-play
          API_URL = baseUrl.replace(/\/$/, '') + '/cybermonday-play'
        }
      }
      
      if (!API_URL) {
        // Fallback: simulate a result if API is not configured
        if (import.meta.env.DEV) {
          console.warn('API not configured. Cyber Monday data:', formData)
        }
        const offers = [
          { code: 'CANDLE5', label: 'Get $5 off our Ceramic Candles class', link: 'https://www.thepotteryloop.com/event-details/winter-candle-workshop-2025-12-06-13-30' },
          { code: 'CANDLE10', label: 'Get $10 off our Ceramic Candles class when you bring a friend', link: 'https://www.thepotteryloop.com/event-details/winter-candle-workshop-2025-12-06-13-30' },
          { code: 'WHEEL10', label: 'Get $10 off a Wheel Throwing class', link: 'https://www.thepotteryloop.com/service-page/intro-pottery-wheel-class' },
          { code: 'JAN30', label: 'Get $30 off any multi-week Wheel course in January', link: 'https://potterychicago.com/january-courses' },
          { code: 'HAND10', label: 'Get $10 off a Handbuilding Workshop', link: 'https://www.thepotteryloop.com/service-page/handbuilding-workshop' },
          { code: '$20Mug', label: 'Get $20 off a mug glazing class', link: 'https://www.thepotteryloop.com/booking-calendar/the-perfect-mug?referral=service_details_widget&timezone=America%2FChicago&location=' },
          { code: 'MYSTERY15', label: 'Mystery deal: Get 15% off any one pottery class of your choice', link: 'https://thepotteryloop.com' }
        ]
        const randomOffer = offers[Math.floor(Math.random() * offers.length)]
        
        setTimeout(() => {
          const wheelElement = document.querySelector('.pottery-wheel')
          if (wheelElement) {
            wheelElement.classList.add('fade-out')
          }
          setTimeout(() => {
            setIsSpinning(false)
            setResult({
              success: true,
              offerLabel: randomOffer.label,
              code: randomOffer.code,
              link: randomOffer.link
            })
            setIsSubmitting(false)
          }, 300) // Reduced from 500ms
        }, 2500) // Reduced from 3000ms
        return
      }

      const submissionData = {
        name: formData.name,
        email: formData.email,
        consent: true
      }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || `Server error: ${response.status} ${response.statusText}`
        if (import.meta.env.DEV) {
          console.error('API Error:', errorMessage, response)
        }
        throw new Error(errorMessage)
      }
      
      const resultData = await response.json()
      if (import.meta.env.DEV) {
        console.log('Cyber Monday spin successful', resultData)
      }

      // Simulate spinning animation (2.5 seconds for 3 full rotations)
      setTimeout(() => {
        // Start fade out
        const wheelElement = document.querySelector('.pottery-wheel')
        if (wheelElement) {
          wheelElement.classList.add('fade-out')
        }
        
        // Show result after fade completes
        setTimeout(() => {
          setIsSpinning(false)
          setResult({
            success: true,
            offerLabel: resultData.offerLabel,
            code: resultData.code,
            link: resultData.link || 'https://thepotteryloop.com'
          })
          setIsSubmitting(false)
        }, 300) // Wait for fade-out animation (reduced from 500ms)
      }, 2500) // Reduced from 3000ms
    } catch (error) {
      // Only log errors in development, but always show user-friendly error
      if (import.meta.env.DEV) {
        console.error('Submission error:', error)
      }
      setIsSpinning(false)
      let errorMessage = 'Failed to spin the wheel. Please try again.'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }
      
      setErrors({ submit: errorMessage })
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const isFormValid = formData.name.trim() && 
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && 
                     formData.consent

  return (
    <div className="cybermonday-page">
      <button 
        onClick={() => navigate('/')}
        className="cybermonday-back-btn"
        aria-label="Back to home"
      >
        ←
      </button>
      <div className="cybermonday-container">
        <div className="cybermonday-card">
          {!result && (
            <>
              <h1>Spin the digital pottery wheel for a discount on actual classes!!</h1>
              <p className="cybermonday-subheading">
                Fill in your details, spin once, and we'll email you a discount code. Valid for 24 hours only.
              </p>
            </>
          )}

          {!result ? (
            <>
              <form onSubmit={handleSpin} className="cybermonday-form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Your Name"
                    className={errors.name ? 'error' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="you@email.com"
                    className={errors.email ? 'error' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group checkbox-group">
                  <label htmlFor="consent" className="checkbox-label">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={formData.consent}
                      onChange={(e) => updateFormData('consent', e.target.checked)}
                      disabled={isSubmitting}
                    />
                    <span>I agree to receive my discount code and future offers by email.</span>
                  </label>
                  {errors.consent && <span className="error-message">{errors.consent}</span>}
                </div>

                {errors.submit && (
                  <div className="error-message submit-error">{errors.submit}</div>
                )}

                <div className="wheel-container">
                  <div className="wheel-background">
                    <img 
                      src="https://i.imgur.com/m0pnAZo.png" 
                      alt="Pottery wheel" 
                      className="wheel-bg-image"
                    />
                    {!result && (
                      <div 
                        className={`pottery-wheel ${isSpinning ? 'spinning' : ''}`}
                        onClick={isFormValid && !isSubmitting ? handleSpin : undefined}
                        style={isFormValid && !isSubmitting ? { cursor: 'pointer' } : {}}
                      >
                        <div className="wheel-center">
                          {isSpinning ? '🌀' : '🏺'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="spin-button"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? 'Spinning...' : 'Spin the pottery wheel'}
                </button>
              </form>
            </>
          ) : (
            <div className="result-container">
              <h1 className="result-congrats">Congrats!</h1>
              <div className="result-emoji">🎁</div>
              <h2 className="result-title">{result.offerLabel}</h2>
              {result.link && (
                <a 
                  href={result.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="result-link"
                >
                  Book your class at The Pottery Loop
                </a>
              )}
              <div className="result-code">
                <span className="code-label">Your discount code:</span>
                <span className="code-value">{result.code}</span>
              </div>
              <p className="result-message">
                We've emailed your discount code and booking link to <strong>{formData.email}</strong>. Valid for 24 hours only.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CyberMonday
