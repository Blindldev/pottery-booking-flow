import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import BookingFlow from './components/BookingFlow'
import './App.css'

function App() {
  const [showBooking, setShowBooking] = useState(false)

  const handleStartBooking = () => {
    setShowBooking(true)
  }

  const handleBackToLanding = () => {
    setShowBooking(false)
  }

  if (!showBooking) {
    return <LandingPage onStartBooking={handleStartBooking} />
  }

  return (
    <div className="app">
      <button 
        onClick={handleBackToLanding}
        className="back-to-landing-btn"
        aria-label="Back to home"
      >
        ← Back
      </button>
      <header className="app-header">
        <h1>PotteryChicago</h1>
        <p>Private Party Booking</p>
      </header>
      <main className="app-main">
        <BookingFlow />
      </main>
    </div>
  )
}

export default App
