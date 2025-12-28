import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import VideosPage from './pages/VideosPage'
import UploadPage from './pages/UploadPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout>
                <VideosPage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/upload"
          element={
            <RequireAuth>
              <Layout>
                <UploadPage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
