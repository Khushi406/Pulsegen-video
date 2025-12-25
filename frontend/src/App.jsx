import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import VideosPage from './pages/VideosPage'
import UploadPage from './pages/UploadPage'
import LoginPage from './pages/LoginPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <nav>
          <Link to="/">Videos</Link> | <Link to="/upload">Upload</Link> | <Link to="/login">Login</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<VideosPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
