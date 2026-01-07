import React, { useState } from 'react'
import './Courses.css'

function Courses({ onBack }) {
  const [showDiscountInfo, setShowDiscountInfo] = useState(false)
  
  const courses = [
    {
      name: 'Matcha Mondays',
      image: 'https://i.imgur.com/Ch3YkAP.png',
      link: 'https://square.link/u/PG0Un0pH',
      skillLevel: 'Beginner',
      duration: '4 week course',
      startDate: 'Monday February 2nd'
    },
    {
      name: '[Tuesdays] 6 week Course',
      image: 'https://i.imgur.com/hOXbuap.png',
      link: 'https://square.link/u/nohm8WvV',
      skillLevel: 'Beginner',
      duration: '6 week intro course',
      startDate: 'Tuesday January 27th'
    },
    {
      name: 'Wacky Wednesdays Handbuilding Course',
      image: 'https://i.imgur.com/meBD8ZF.png',
      link: 'https://square.link/u/V9k0oImM',
      skillLevel: 'Beginner',
      duration: '5 week All Handbuilding Course',
      startDate: 'Wednesday February 4th'
    }
  ]

  return (
    <div className="courses-container">
      <div className="courses-card">
        <button onClick={onBack} className="back-btn-studio">BACK</button>
        <h1>Current Courses</h1>
        <p className="intro-text">Select a course to get more details and book</p>

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
                  alt={course.name}
                  className="course-image"
                />
              </div>
              <div className="course-day">{course.name}</div>
              <div className="course-skill-level">{course.skillLevel}</div>
              <div className="course-duration">{course.duration}</div>
              <div className="course-start-date">Starts: {course.startDate}</div>
            </a>
          ))}
        </div>

        <div className="intermediate-notice">
          <a 
            href="https://www.instagram.com/Potterychicago" 
            target="_blank" 
            rel="noopener noreferrer"
            className="intermediate-button"
          >
            All current offerings are beginner, DM for intermediate
          </a>
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

        <div className="giftcard-notice">
          <p className="giftcard-notice-text">
            <strong>Gift Card Redemption:</strong> If you purchased a gift card, please email{' '}
            <a href="mailto:potterychicago@gmail.com" className="giftcard-email-link">
              potterychicago@gmail.com
            </a>{' '}
            for redemption as we are currently updating our booking process.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Courses

