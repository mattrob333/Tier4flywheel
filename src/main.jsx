import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import './index.css'
import App from './App.jsx'
import AuditPage from './pages/AuditPage.jsx'
import AdminHomePage from './pages/AdminHomePage.jsx'
import AdminAuditPage from './pages/AdminAuditPage.jsx'
import AdminSeoAuditPage from './pages/AdminSeoAuditPage.jsx'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const routes = (
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/audit" element={<AdminAuditPage />} />
        <Route path="/admin/seo-audit" element={<AdminSeoAuditPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)

createRoot(document.getElementById('root')).render(
  clerkPublishableKey ? (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      {routes}
    </ClerkProvider>
  ) : (
    routes
  ),
)
