import React from 'react'
import './LandingPage.css'

function LandingPage({ onStartBooking }) {
  return (
    <div className="landing-page">
      <div className="landing-container">
        <header className="landing-header">
          <h1 className="landing-title">PotteryChicago</h1>
        </header>
        
        <div className="links-grid">
          <a 
            href="https://ThePotteryLoop.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-card"
          >
            <div className="link-card-content">
              <h2 className="link-title">The Pottery Loop</h2>
              <p className="link-subtitle">Come check out our pottery studio</p>
            </div>
            <div className="link-arrow">→</div>
          </a>

          <button 
            onClick={onStartBooking}
            className="link-card link-card-button"
          >
            <div className="link-card-content">
              <h2 className="link-title">Private Bookings!</h2>
              <p className="link-subtitle">Let us know about your Bachelorette, birthday, corporate event or other!</p>
            </div>
            <div className="link-arrow">→</div>
          </button>

          <a 
            href="https://ThePotteryLoop.com/Pickup" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-card"
          >
            <div className="link-card-content">
              <h2 className="link-title">Pickup</h2>
              <p className="link-subtitle"></p>
            </div>
            <div className="link-arrow">→</div>
          </a>

          <a 
            href="https://ThePotteryLoop.com/Contact" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-card"
          >
            <div className="link-card-content">
              <h2 className="link-title">Contact us</h2>
              <p className="link-subtitle"></p>
            </div>
            <div className="link-arrow">→</div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

