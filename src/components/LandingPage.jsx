import React from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Cyber Monday banner removed - keeping for future reference
        <Link to="/cybermonday" className="discount-banner">
          <span className="discount-banner-text">Cyber Monday Pottery Wheel!</span>
          <span className="discount-banner-arrow">→</span>
        </Link>
        */}
        <header className="landing-header">
          <h1 className="landing-title">PotteryChicago</h1>
          <p className="landing-subtitle">Building a Community Around Pottery in Chicago</p>
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

          <Link 
            to="/courses"
            className="link-card link-card-january-courses"
          >
            <div className="link-card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 className="link-title">Current Courses</h2>
                <span className="new-tag">New Options Added</span>
              </div>
              <p className="link-subtitle"></p>
            </div>
            <div className="link-arrow">→</div>
          </Link>

          <a 
            href="https://checkout.square.site/merchant/MLNSXCSTTDJ0C/checkout/2BV4UL7MOQG63ERFML6N3FIO" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-card link-card-friendwork-social"
          >
            <div className="link-card-content">
              <h2 className="link-title">The Friendwork Collective Social</h2>
              <p className="link-subtitle"></p>
            </div>
            <div className="link-arrow">→</div>
          </a>

          <Link 
            to="/private-bookings"
            className="link-card link-card-private-bookings"
          >
            <div className="link-card-content">
              <h2 className="link-title">Private Bookings!</h2>
              <p className="link-subtitle">Let us know about your Bachelorette, birthday, corporate event or other!</p>
            </div>
            <div className="link-arrow">→</div>
          </Link>

          <Link 
            to="/open-studio"
            className="link-card link-card-24hour"
          >
            <div className="link-card-content">
              <h2 className="link-title">24 Hour Open Studio</h2>
              <p className="link-subtitle"></p>
            </div>
            <div className="link-arrow">→</div>
          </Link>

          <a 
            href="https://www.thepotteryloop.com/booking-calendar/pottery-pickup" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-card link-card-pickup"
          >
            <div className="link-card-content">
              <h2 className="link-title">Pickup</h2>
              <p className="link-subtitle"></p>
            </div>
            <div className="link-arrow">→</div>
          </a>

          <Link 
            to="/teach"
            className="link-card link-card-instructor-positions"
          >
            <div className="link-card-content">
              <h2 className="link-title">Instructor Positions</h2>
              <p className="link-subtitle"></p>
            </div>
            <div className="link-arrow">→</div>
          </Link>

          <a 
            href="https://forms.fillout.com/t/fgJYcLiHgWus" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-card link-card-blind-date"
          >
            <div className="link-card-content">
              <h2 className="link-title">Blind Date Pottery Application</h2>
              <p className="link-subtitle"></p>
            </div>
            <div className="link-arrow">→</div>
          </a>

          <Link 
            to="/collaborations"
            className="link-card link-card-collaborations"
          >
            <div className="link-card-content">
              <h2 className="link-title">Collaborations</h2>
              <p className="link-subtitle">Host groups in chicago? Have a social following or community? We would love to connect!</p>
            </div>
            <div className="link-arrow">→</div>
          </Link>

          <Link 
            to="/contact"
            className="link-card link-card-contact"
          >
            <div className="link-card-content">
              <h2 className="link-title">Contact us</h2>
              <p className="link-subtitle"></p>
            </div>
            <div className="link-arrow">→</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

