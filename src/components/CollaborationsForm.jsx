import React, { useState } from 'react'
import './CollaborationsForm.css'

function CollaborationsForm({ onBack }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneCountry: '+1',
    organization: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      tiktok: '',
      website: '',
      other: ''
    },
    communityGoals: '',
    eventVision: '',
    eventType: '',
    expectedAttendance: ''
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization/Group name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!formData.communityGoals.trim()) {
      newErrors.communityGoals = 'Please describe your community goals'
    }
    if (!formData.eventVision.trim()) {
      newErrors.eventVision = 'Please describe your vision for the event'
    }
    if (!formData.eventType.trim()) {
      newErrors.eventType = 'Please describe the type of event you have in mind'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    } else {
      onBack()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateStep2()) {
      try {
        const API_URL = import.meta.env.VITE_AWS_API_URL?.replace('/booking', '/collaborations') || ''
        
        if (API_URL) {
          const submissionData = {
            ...formData,
            submittedAt: new Date().toISOString()
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
            throw new Error(errorData.message || `Server error: ${response.status}`)
          }
          
          const result = await response.json()
          console.log('Collaboration application submitted successfully:', result)
        } else {
          console.log('API not configured. Application data:', formData)
        }
        
        setSubmitted(true)
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('Submission error:', error)
            }
        // Still show success to user
        setSubmitted(true)
      }
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const updateSocialMedia = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  if (submitted) {
    return (
      <div className="collaborations-container">
        <div className="collaborations-card">
          <div className="success-icon">✓</div>
          <h2>Thank you!</h2>
          <p>We've received your collaboration inquiry. We'll be in touch soon!</p>
          <button onClick={onBack} className="btn-back">
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="collaborations-container">
      <button onClick={handleBack} className="back-btn-studio">BACK</button>
      <div className="collaborations-card">
        <h1>Collaborations</h1>
        <p className="intro-text">
          Host groups in chicago? Have a social following or community? We would love to connect!
        </p>

        {step === 1 ? (
          <div className="form-step">
            <h2>About You & Your Organization</h2>
            
            <div className="form-group">
              <label className="form-label">What's your name? *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Your Name"
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@email.com"
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone number *</label>
              <div className="phone-input-group">
                <select
                  value={formData.phoneCountry}
                  onChange={(e) => updateFormData('phoneCountry', e.target.value)}
                  className="phone-country"
                >
                  <option value="+1">United States (+1)</option>
                  <option value="+44">United Kingdom (+44)</option>
                  <option value="+33">France (+33)</option>
                  <option value="+49">Germany (+49)</option>
                  <option value="+81">Japan (+81)</option>
                  <option value="+86">China (+86)</option>
                  <option value="+91">India (+91)</option>
                  <option value="+52">Mexico (+52)</option>
                  <option value="+55">Brazil (+55)</option>
                  <option value="+61">Australia (+61)</option>
                </select>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="(555) 123-4567"
                />
              </div>
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Organization / Group Name *</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => updateFormData('organization', e.target.value)}
                className={`form-input ${errors.organization ? 'error' : ''}`}
                placeholder="Your Organization or Group Name"
              />
              {errors.organization && <div className="error-message">{errors.organization}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Social Media & Online Presence</label>
              <div className="social-media-grid">
                <div className="social-input-group">
                  <label className="social-label">Instagram</label>
                  <input
                    type="text"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                    className="form-input"
                    placeholder="@yourhandle"
                  />
                </div>
                <div className="social-input-group">
                  <label className="social-label">Facebook</label>
                  <input
                    type="text"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                    className="form-input"
                    placeholder="facebook.com/yourpage"
                  />
                </div>
                <div className="social-input-group">
                  <label className="social-label">Twitter/X</label>
                  <input
                    type="text"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                    className="form-input"
                    placeholder="@yourhandle"
                  />
                </div>
                <div className="social-input-group">
                  <label className="social-label">TikTok</label>
                  <input
                    type="text"
                    value={formData.socialMedia.tiktok}
                    onChange={(e) => updateSocialMedia('tiktok', e.target.value)}
                    className="form-input"
                    placeholder="@yourhandle"
                  />
                </div>
                <div className="social-input-group">
                  <label className="social-label">Website</label>
                  <input
                    type="url"
                    value={formData.socialMedia.website}
                    onChange={(e) => updateSocialMedia('website', e.target.value)}
                    className="form-input"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="social-input-group">
                  <label className="social-label">Other</label>
                  <input
                    type="text"
                    value={formData.socialMedia.other}
                    onChange={(e) => updateSocialMedia('other', e.target.value)}
                    className="form-input"
                    placeholder="Other social media or platform"
                  />
                </div>
              </div>
            </div>

            <button onClick={handleNext} className="btn-next">
              Next →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-step">
            <h2>Your Vision & Goals</h2>

            <div className="form-group">
              <label className="form-label">What are your community goals? *</label>
              <textarea
                value={formData.communityGoals}
                onChange={(e) => updateFormData('communityGoals', e.target.value)}
                className={`form-input ${errors.communityGoals ? 'error' : ''}`}
                rows="4"
                placeholder="Tell us about your community, what you're building, and your goals..."
              />
              {errors.communityGoals && (
                <div className="error-message">{errors.communityGoals}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">What is your vision for the event? *</label>
              <textarea
                value={formData.eventVision}
                onChange={(e) => updateFormData('eventVision', e.target.value)}
                className={`form-input ${errors.eventVision ? 'error' : ''}`}
                rows="4"
                placeholder="Describe your vision for the collaboration event, what you hope to achieve, and how pottery fits into your plans..."
              />
              {errors.eventVision && (
                <div className="error-message">{errors.eventVision}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">What type of event do you have in mind? *</label>
              <textarea
                value={formData.eventType}
                onChange={(e) => updateFormData('eventType', e.target.value)}
                className={`form-input ${errors.eventType ? 'error' : ''}`}
                rows="3"
                placeholder="e.g., Workshop series, one-time event, team building, community gathering, etc."
              />
              {errors.eventType && (
                <div className="error-message">{errors.eventType}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Expected Attendance (optional)</label>
              <input
                type="text"
                value={formData.expectedAttendance}
                onChange={(e) => updateFormData('expectedAttendance', e.target.value)}
                className="form-input"
                placeholder="e.g., 20-30 people, 50+, etc."
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setStep(1)} className="btn-back-form">
                ← Back
              </button>
              <button type="submit" className="btn-submit">
                Submit Inquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CollaborationsForm

