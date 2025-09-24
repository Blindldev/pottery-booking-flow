import React from 'react'

function SuccessStep() {
  return (
    <div className="success-content">
      <div className="success-icon-container">
        <div className="success-icon">🏺</div>
        <div className="success-ring"></div>
        <div className="success-sparkles">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">✨</div>
          <div className="sparkle sparkle-3">✨</div>
          <div className="sparkle sparkle-4">✨</div>
        </div>
      </div>
      
      <div className="success-message">
        <p className="success-text">
          Thanks! We'll contact you within 24 hours to confirm availability and next steps to book your pottery experience.
        </p>
      </div>
      
      <div className="success-details">
        <div className="detail-card">
          <div className="detail-icon">📧</div>
          <div className="detail-text">
            <h3>Email Confirmation</h3>
            <p>Check your inbox for booking details</p>
          </div>
        </div>
        
        <div className="detail-card">
          <div className="detail-icon">📞</div>
          <div className="detail-text">
            <h3>Text Message</h3>
            <p>We may text or call to discuss your event</p>
          </div>
        </div>
        
        <div className="detail-card">
          <div className="detail-icon">🎨</div>
          <div className="detail-text">
            <h3>Custom Planning</h3>
            <p>Tailored experience just for you</p>
          </div>
        </div>
      </div>
      
      <div className="success-footer">
        <p className="footer-text">
          Ready to get your hands dirty? We can't wait to see what you'll create!
        </p>
        <div className="footer-brand">
          <span className="brand-text">PotteryChicago</span>
          <span className="brand-location">The Pottery Loop • 1770 W Berteau Ave</span>
        </div>
      </div>
    </div>
  )
}

export default SuccessStep
