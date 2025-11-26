import React, { useState } from 'react'
import './Studio24Hour.css'

function Studio24Hour({ onBack }) {
  const [hasTakenCourse, setHasTakenCourse] = useState(null)
  const [email, setEmail] = useState('')
  const [courseDate, setCourseDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    setSubmitted(true)
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
        <button onClick={onBack} className="back-btn-studio">‹</button>
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
        <button onClick={() => setHasTakenCourse(null)} className="back-btn-studio">‹</button>
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
            <button type="submit" className="btn-submit">
              Join Waitlist
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="studio-24-container">
      <button onClick={onBack} className="back-btn-studio">‹</button>
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
      </div>
    </div>
  )
}

export default Studio24Hour

