import React from 'react'
import './ContactPage.css'

function ContactPage({ onBack }) {
  const email = 'PotteryChicago@gmail.com'
  const instagramUrl = 'https://www.instagram.com/potterychicago/'

  return (
    <div className="contact-container">
      <button onClick={onBack} className="back-btn-studio">BACK</button>
      <div className="contact-card">
        <h1>Contact Us</h1>
        <p className="intro-text">
          We'd love to hear from you! Reach out to us via Instagram or email.
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

          <a
            href={`mailto:${email}`}
            className="contact-option email-option"
          >
            <div className="contact-icon">✉️</div>
            <h2>Via Email</h2>
            <p>Send us an email</p>
            <div className="contact-arrow">→</div>
          </a>
        </div>

        <div className="email-display">
          <p className="email-label">Or copy our email address:</p>
          <div className="email-copy-box">
            <span className="email-address">{email}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(email)
                alert('Email address copied to clipboard!')
              }}
              className="copy-button"
              aria-label="Copy email address"
            >
              📋
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage

