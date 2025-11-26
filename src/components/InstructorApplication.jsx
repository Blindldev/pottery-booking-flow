import React, { useState } from 'react'
import './InstructorApplication.css'

function InstructorApplication({ onBack }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneCountry: '+1',
    experience: '',
    experienceDescription: '',
    howFoundOut: '',
    awarePartTime: false,
    startDate: ''
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
    if (!formData.experience) {
      newErrors.experience = 'Please select your experience'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!formData.experienceDescription.trim()) {
      newErrors.experienceDescription = 'Please describe your experience'
    }
    if (!formData.howFoundOut.trim()) {
      newErrors.howFoundOut = 'Please let us know how you found out about us'
    }
    if (!formData.awarePartTime) {
      newErrors.awarePartTime = 'Please acknowledge that you understand the position is part-time'
    }
    if (!formData.startDate.trim()) {
      newErrors.startDate = 'Please let us know when you can start'
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateStep2()) {
      // Here you would typically send this data to your backend
      console.log('Application submitted:', formData)
      setSubmitted(true)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  if (submitted) {
    return (
      <div className="instructor-container">
        <div className="instructor-card">
          <div className="success-icon">✓</div>
          <h2>Thank you!</h2>
          <p>We've received your application. We'll be in touch soon!</p>
          <button onClick={onBack} className="btn-back">
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="instructor-container">
      <button onClick={handleBack} className="back-btn-studio">BACK</button>
      <div className="instructor-card">
        <h1>The Pottery Loop Studio Staff Application</h1>
        <p className="intro-text">
          As we grow we are looking for talented individuals to grow with us. If you have experience, we would greatly appreciate your application!
        </p>

        {step === 1 ? (
          <div className="form-step">
            <h2>About you</h2>
            
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
              <label className="form-label">What relevant experience do you have? *</label>
              <div className="radio-group">
                <label className={`radio-option ${formData.experience === 'wheel' ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    name="experience"
                    value="wheel"
                    checked={formData.experience === 'wheel'}
                    onChange={(e) => updateFormData('experience', e.target.value)}
                  />
                  <span>Comfortable Teaching Pottery Wheel Classes</span>
                </label>
                <label className={`radio-option ${formData.experience === 'handbuilding' ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    name="experience"
                    value="handbuilding"
                    checked={formData.experience === 'handbuilding'}
                    onChange={(e) => updateFormData('experience', e.target.value)}
                  />
                  <span>General Instruction (Hand-building and Painting)</span>
                </label>
                <label className={`radio-option ${formData.experience === 'both' ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    name="experience"
                    value="both"
                    checked={formData.experience === 'both'}
                    onChange={(e) => updateFormData('experience', e.target.value)}
                  />
                  <span>Both</span>
                </label>
              </div>
              {errors.experience && <div className="error-message">{errors.experience}</div>}
            </div>

            <button onClick={handleNext} className="btn-next">
              Next →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-step">
            <h2>More About You</h2>

            <div className="form-group">
              <label className="form-label">Please describe your experience with pottery. *</label>
              <textarea
                value={formData.experienceDescription}
                onChange={(e) => updateFormData('experienceDescription', e.target.value)}
                className={`form-input ${errors.experienceDescription ? 'error' : ''}`}
                rows="4"
                placeholder="Ex: I dug clay up and almost ate it"
              />
              {errors.experienceDescription && (
                <div className="error-message">{errors.experienceDescription}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">How did you find out about The Pottery Loop (PotteryChicago)? *</label>
              <textarea
                value={formData.howFoundOut}
                onChange={(e) => updateFormData('howFoundOut', e.target.value)}
                className={`form-input ${errors.howFoundOut ? 'error' : ''}`}
                rows="3"
                placeholder="Was walking from canada to texas and took a pit stop"
              />
              {errors.howFoundOut && (
                <div className="error-message">{errors.howFoundOut}</div>
              )}
            </div>

            <div className="form-group">
              <label className={`checkbox-option ${formData.awarePartTime ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.awarePartTime}
                  onChange={(e) => updateFormData('awarePartTime', e.target.checked)}
                />
                <span>I am aware work here is part time and not consistent (unfortunately) due to it being a small and new studio *</span>
              </label>
              {errors.awarePartTime && (
                <div className="error-message">{errors.awarePartTime}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">When are you able to start? *</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => updateFormData('startDate', e.target.value)}
                className={`form-input ${errors.startDate ? 'error' : ''}`}
                placeholder="e.g., Immediately, January 2025, etc."
              />
              {errors.startDate && <div className="error-message">{errors.startDate}</div>}
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setStep(1)} className="btn-back-form">
                ← Back
              </button>
              <button type="submit" className="btn-submit">
                Submit Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default InstructorApplication

