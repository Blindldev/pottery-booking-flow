import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import BookingFlow from './components/BookingFlow'
import Studio24Hour from './components/Studio24Hour'
import InstructorApplication from './components/InstructorApplication'
import CollaborationsForm from './components/CollaborationsForm'
import ContactPage from './components/ContactPage'
import JanuaryCourses from './components/JanuaryCourses'
import DiscountPage from './components/DiscountPage'
import CyberMonday from './components/CyberMonday'
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

function CollaborationsPage() {
  const navigate = useNavigate()

  return <CollaborationsForm onBack={() => navigate('/')} />
}

function ContactPageWrapper() {
  const navigate = useNavigate()

  return <ContactPage onBack={() => navigate('/')} />
}

function JanuaryCoursesPage() {
  const navigate = useNavigate()

  return <JanuaryCourses onBack={() => navigate('/')} />
}

function DiscountPageWrapper() {
  const navigate = useNavigate()

  return <DiscountPage onBack={() => navigate('/')} />
}

function CyberMondayPage() {
  return <CyberMonday />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/january-courses" element={<JanuaryCoursesPage />} />
      <Route path="/private-bookings" element={<BookingPage />} />
      <Route path="/open-studio" element={<Studio24Page />} />
      <Route path="/teach" element={<TeachPage />} />
      <Route path="/collaborations" element={<CollaborationsPage />} />
      <Route path="/contact" element={<ContactPageWrapper />} />
      <Route path="/discount" element={<DiscountPageWrapper />} />
      {/* Cyber Monday route removed - keeping component for future reference
      <Route path="/cybermonday" element={<CyberMondayPage />} />
      */}
    </Routes>
  )
}

export default App
