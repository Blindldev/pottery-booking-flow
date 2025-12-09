import React, { useState } from 'react'
import './JanuaryCourses.css'

function JanuaryCourses({ onBack }) {
  const [showDiscountInfo, setShowDiscountInfo] = useState(false)
  
  const courses = [
    {
      day: 'Saturdays',
      image: 'https://i.imgur.com/07bj5iK.png',
      link: 'https://square.link/u/WBCEF4RC?src=sheet',
      skillLevel: 'Beginner',
      duration: '6 week course'
    },
    {
      day: 'Sundays',
      image: 'https://i.imgur.com/nFvhRD4.png',
      link: 'https://square.link/u/7Q12HV8Q?src=sheet',
      skillLevel: 'Beginner',
      duration: '6 week course'
    },
    {
      day: 'Mondays',
      image: 'https://i.imgur.com/Ch3YkAP.png',
      link: 'https://square.link/u/yNcQN6o2?src=sheet',
      skillLevel: 'Beginner',
      duration: '4 week course'
    },
    {
      day: 'Tuesdays',
      image: 'https://i.imgur.com/hOXbuap.png',
      link: 'https://square.link/u/RzhgFvaO?src=sheet',
      skillLevel: 'Intermediate',
      duration: '4 week course'
    }
  ]

  return (
    <div className="january-courses-container">
      <div className="january-courses-card">
        <button onClick={onBack} className="back-btn-studio">BACK</button>
        <h1>January 2026 Courses</h1>
        <p className="intro-text">Select a day to get more details about the course offering</p>
        
        <div className="giftcard-notice">
          <p className="giftcard-notice-text">
            <strong>Gift Card Redemption:</strong> If you purchased a gift card, please email{' '}
            <a href="mailto:potterychicago@gmail.com" className="giftcard-email-link">
              potterychicago@gmail.com
            </a>{' '}
            for redemption as we are currently updating our booking process.
          </p>
        </div>
        
        <div className="courses-grid">
          {courses.map((course, index) => (
            <a
              key={index}
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className="course-card"
            >
              <div className="course-image-container">
                <img 
                  src={course.image} 
                  alt={course.day}
                  className="course-image"
                />
              </div>
              <div className="course-day">{course.day}</div>
              <div className="course-skill-level">{course.skillLevel}</div>
              <div className="course-duration">{course.duration}</div>
            </a>
          ))}
        </div>

        <div className="discount-section">
          <button 
            onClick={() => setShowDiscountInfo(!showDiscountInfo)}
            className="discount-button"
          >
            How to apply discount
          </button>

          {showDiscountInfo && (
            <div className="discount-info">
              <p className="discount-description">
                To apply a discount code, enter it during checkout on the Square booking page. 
                Look for the discount or promo code field when completing your purchase.
              </p>
              <div className="discount-image-container">
                <img 
                  src="https://i.imgur.com/6cCY4cC.png" 
                  alt="How to apply discount"
                  className="discount-image"
                />
              </div>
              <p className="discount-note">
                <strong>Note:</strong> TestingCouponDiscount is not a valid code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JanuaryCourses

