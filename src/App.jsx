import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import BookingFlow from './components/BookingFlow'
import Studio24Hour from './components/Studio24Hour'
import InstructorApplication from './components/InstructorApplication'
import './App.css'

function BookingPage() {
  const navigate = useNavigate()

  return (
    <div className="app">
      <button 
        onClick={() => navigate('/')}
        className="back-to-landing-btn"
        aria-label="Back to home"
      >
        BACK
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

function Studio24Page() {
  const navigate = useNavigate()

  return <Studio24Hour onBack={() => navigate('/')} />
}

function TeachPage() {
  const navigate = useNavigate()

  return <InstructorApplication onBack={() => navigate('/')} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/private-bookings" element={<BookingPage />} />
      <Route path="/open-studio" element={<Studio24Page />} />
      <Route path="/teach" element={<TeachPage />} />
    </Routes>
  )
}

export default App
