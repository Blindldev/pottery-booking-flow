import React, { useState } from 'react'
import BookingFlow from './components/BookingFlow'
import './App.css'

function App() {
  return (
    <div className="app">
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
