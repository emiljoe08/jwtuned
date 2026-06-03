import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// If URL is /dashboard, skip landing page
const startAtDashboard = window.location.pathname === '/dashboard'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App startAtDashboard={startAtDashboard} />
  </StrictMode>,
)