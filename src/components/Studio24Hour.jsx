import React, { useState } from 'react'
import './Studio24Hour.css'

function Studio24Hour({ onBack }) {
  const [hasTakenCourse, setHasTakenCourse] = useState(null)
  const [email, setEmail] = useState('')
  const [courseDate, setCourseDate] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showWaitlistInfo, setShowWaitlistInfo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const API_URL = import.meta.env.VITE_AWS_API_URL?.replace('/booking', '/open-studio') || ''
      
      if (!API_URL) {
        console.error('[Open Studio Form] API endpoint not configured. VITE_AWS_API_URL is missing.')
        setSubmitted(true) // Still show success to user
        return
      }
      
      const submissionData = {
        email: email.trim(),
        courseDate: courseDate.trim(),
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
        const errorMessage = errorData.message || `Server error: ${response.status}`
        console.error('[Open Studio Form] Submission failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          data: submissionData
        })
        setSubmitted(true) // Still show success to user
        return
      }
      
      const result = await response.json()
      
      if (result.success) {
        console.log('[Open Studio Form] Submission successful:', result)
        setSubmitted(true)
      } else {
        console.error('[Open Studio Form] Submission returned unsuccessful:', result)
        setSubmitted(true) // Still show success to user
      }
    } catch (error) {
      // Always log errors to console for debugging
      console.error('[Open Studio Form] Submission error:', {
        error: error.message,
        name: error.name,
        stack: error.stack,
        data: { email: email.trim(), courseDate: courseDate.trim() }
      })
      
      // Still show success to user (better UX)
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="studio-24-container">
        <div className="studio-24-card">
          <div className="success-icon">✓</div>
          <h2>Thank you!</h2>
          <p>We'll follow up with you about the waitlist soon.</p>
          <button onClick={onBack} className="btn-back">
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (hasTakenCourse === false) {
    return (
      <div className="studio-24-container">
        <button onClick={onBack} className="back-btn-studio">BACK</button>
        <div className="studio-24-card">
          <h2>24/7 Studio Access</h2>
          <div className="notice-box">
            <p className="notice-text">
              Currently, our 24/7 space is on waitlist for previous students. We are unable to open the waitlist up beyond this to be fair to our previous students and give them the opportunity to have continued learning.
            </p>
            <p className="notice-text">
              If you're interested in taking a course with us first, check out <a href="https://ThePotteryLoop.com" target="_blank" rel="noopener noreferrer">The Pottery Loop</a> to see our available classes!
            </p>
          </div>
          <button onClick={() => setHasTakenCourse(null)} className="btn-back">
            ← Back
          </button>
        </div>
      </div>
    )
  }

  if (hasTakenCourse === true) {
    return (
      <div className="studio-24-container">
        <div className="studio-24-card">
          <h2>24/7 Studio Access</h2>
          <p className="subtitle">Join the waitlist for 24/7 studio access</p>
          <form onSubmit={handleSubmit} className="waitlist-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="courseDate">When did you take a course with us?</label>
              <input
                type="text"
                id="courseDate"
                value={courseDate}
                onChange={(e) => setCourseDate(e.target.value)}
                required
                placeholder="e.g., Spring 2024, January 2024, etc."
                className="form-input"
              />
            </div>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
            </button>
          </form>
          <button 
            onClick={() => setShowWaitlistInfo(!showWaitlistInfo)}
            className="btn-waitlist-check"
          >
            Already on the waitlist?
          </button>
          {showWaitlistInfo && (() => {
            const getNameFromEmail = (email) => {
              if (!email) return 'Your Name'
              const username = email.split('@')[0]
              // Format name: capitalize first letter of each word, replace dots/underscores with spaces
              return username
                .split(/[._]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
            }
            const userName = getNameFromEmail(email)
            const emailBody = `Hi Mike,%0D%0A%0D%0ACould you please let me know about my status on the open studio Waitlist!%0D%0A%0D%0ABest,%0D%0A${userName}`
            return (
              <div className="waitlist-info-box">
                <p>
                  Send us a{' '}
                  <a 
                    href={`mailto:PotteryChicago@gmail.com?subject=Open Studio Waitlist Status&body=${emailBody}`}
                    className="email-link"
                  >
                    small email
                  </a>
                  {' '}and we can let you know approx where you are in the waitlist!
                </p>
              </div>
            )
          })()}
          <button onClick={() => setHasTakenCourse(null)} className="btn-back">
            ← Back
          </button>
        </div>
      </div>
    )
  }

  return (
      <div className="studio-24-container">
        <div className="studio-24-card">
          <h2>24/7 Studio Access</h2>
          <p className="subtitle">Have you taken a course with us?</p>
        <div className="button-group">
          <button 
            onClick={() => setHasTakenCourse(true)}
            className="btn-option btn-yes"
          >
            Yes
          </button>
          <button 
            onClick={() => setHasTakenCourse(false)}
            className="btn-option btn-no"
          >
            No
          </button>
        </div>
        <button onClick={onBack} className="btn-back">
          ← Back
        </button>
      </div>
    </div>
  )
}

export default Studio24Hour

