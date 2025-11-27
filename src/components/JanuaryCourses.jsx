import React from 'react'
import './JanuaryCourses.css'

function JanuaryCourses({ onBack }) {
  const courses = [
    {
      day: 'Saturdays',
      image: 'https://i.imgur.com/07bj5iK.png',
      link: 'https://square.link/u/WBCEF4RC?src=sheet'
    },
    {
      day: 'Sundays',
      image: 'https://i.imgur.com/07bj5iK.png',
      link: 'https://square.link/u/7Q12HV8Q?src=sheet'
    },
    {
      day: 'Mondays',
      image: 'https://i.imgur.com/Ch3YkAP.png',
      link: 'https://square.link/u/yNcQN6o2?src=sheet'
    },
    {
      day: 'Tuesdays',
      image: 'https://i.imgur.com/hOXbuap.png',
      link: 'https://square.link/u/RzhgFvaO?src=sheet'
    }
  ]

  return (
    <div className="january-courses-container">
      <button onClick={onBack} className="back-btn-studio">BACK</button>
      <div className="january-courses-card">
        <h1>January 2026 Courses</h1>
        <p className="intro-text">Select a day to get more details about the course offering</p>
        
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
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default JanuaryCourses

