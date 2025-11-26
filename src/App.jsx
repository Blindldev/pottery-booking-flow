import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import BookingFlow from './components/BookingFlow'
import Studio24Hour from './components/Studio24Hour'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing', 'booking', 'studio24'

  const handleStartBooking = () => {
    setCurrentView('booking')
  }

  const handleStudio24Hour = () => {
    setCurrentView('studio24')
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
  }

  if (currentView === 'landing') {
    return <LandingPage onStartBooking={handleStartBooking} onStudio24Hour={handleStudio24Hour} />
  }

  if (currentView === 'studio24') {
    return <Studio24Hour onBack={handleBackToLanding} />
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
