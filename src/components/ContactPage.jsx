import React, { useState } from 'react'
import './ContactPage.css'

function ContactPage({ onBack }) {
  const instagramUrl = 'https://www.instagram.com/potterychicago/'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
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
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const API_URL = import.meta.env.VITE_AWS_API_URL?.replace('/booking', '/contact') || ''
      
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
        console.log('Contact message submitted successfully:', result)
      } else {
        console.log('API not configured. Contact data:', formData)
      }
      
      setSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      setErrors({ submit: error.message || 'Failed to send message. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  if (submitted) {
    return (
      <div className="contact-container">
        <button onClick={onBack} className="back-btn-studio">BACK</button>
        <div className="contact-card">
          <div className="success-icon">✓</div>
          <h2>Thank you!</h2>
          <p>We've received your message. We'll get back to you soon!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="contact-container">
      <button onClick={onBack} className="back-btn-studio">BACK</button>
      <div className="contact-card">
        <h1>Contact Us</h1>
        <p className="intro-text">
          We'd love to hear from you! Reach out to us via Instagram or send us a message below.
        </p>

        <div className="contact-options">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-option instagram-option"
          >
            <div className="contact-icon">📷</div>
            <h2>Via Instagram DM</h2>
            <p>Send us a direct message on Instagram</p>
            <div className="contact-arrow">→</div>
          </a>
        </div>

        <div className="contact-form-section">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Your Name"
                className={errors.name ? 'error' : ''}
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
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => updateFormData('message', e.target.value)}
                placeholder="Tell us what's on your mind..."
                rows="5"
                className={errors.message ? 'error' : ''}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>

            {errors.submit && (
              <div className="error-message submit-error">{errors.submit}</div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactPage

