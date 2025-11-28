import React from 'react'
import './DiscountPage.css'

function DiscountPage({ onBack }) {
  return (
    <div className="discount-container">
      <button onClick={onBack} className="back-btn-studio">BACK</button>
      <div className="discount-card">
        <h1>How to use discount code</h1>
        <div className="discount-content">
          <p className="discount-instruction">
            Apply <strong>"BlackFriday20"</strong> in the promo code section at checkout at{' '}
            <a 
              href="https://ThePotteryLoop.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="discount-link"
            >
              ThePotteryLoop.com
            </a>
          </p>
          <div className="discount-image-container">
            <img 
              src="https://i.imgur.com/N0TmsQw.jpeg" 
              alt="How to apply discount code"
              className="discount-image"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiscountPage

