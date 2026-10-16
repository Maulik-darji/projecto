import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import AdminPage from './components/Admin/AdminPage'
import NotFound from './components/Admin/NotFound'

// Handles #admin or #/admin hash redirects for static host flexibility
function HashRedirector() {
  const navigate = useNavigate()
  useEffect(() => {
    if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      navigate('/admin', { replace: true })
    }
  }, [navigate])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <HashRedirector />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
