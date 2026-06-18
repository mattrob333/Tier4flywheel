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

const clerkAppearance = {
  options: {
    logoImageUrl: '/brand/tier4-icon-color.png',
    logoLinkUrl: '/',
    socialButtonsVariant: 'blockButton',
  },
  variables: {
    colorPrimary: '#5EC08A',
    colorPrimaryForeground: '#0B1426',
    colorBackground: '#1A1F2E',
    colorForeground: '#F0F2F5',
    colorMuted: '#111827',
    colorMutedForeground: 'rgba(240,242,245,.68)',
    colorInput: '#0B1426',
    colorInputForeground: '#F0F2F5',
    colorBorder: 'rgba(255,255,255,.14)',
    colorRing: 'rgba(94,192,138,.42)',
    colorShadow: '#000000',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontFamilyButtons: 'Inter, system-ui, sans-serif',
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: {
      width: '100%',
    },
    cardBox: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: '#1A1F2E',
      border: '1px solid rgba(255,255,255,.12)',
      boxShadow: '0 28px 90px rgba(0,0,0,.38)',
    },
    card: {
      backgroundColor: '#1A1F2E',
    },
    logoImage: {
      width: '42px',
      height: '42px',
      objectFit: 'contain',
      filter: 'drop-shadow(0 0 14px rgba(94,192,138,.3))',
    },
    headerTitle: {
      color: '#F0F2F5',
      fontWeight: 800,
    },
    headerSubtitle: {
      color: 'rgba(240,242,245,.68)',
    },
    formFieldLabel: {
      color: '#F0F2F5',
      fontWeight: 650,
    },
    formFieldInput: {
      backgroundColor: '#0B1426',
      borderColor: 'rgba(255,255,255,.14)',
      color: '#F0F2F5',
    },
    formFieldInputShowPasswordButton: {
      color: 'rgba(240,242,245,.68)',
    },
    formButtonPrimary: {
      backgroundColor: '#5EC08A',
      color: '#0B1426',
      fontWeight: 800,
      boxShadow: '0 0 24px rgba(94,192,138,.2)',
    },
    socialButtonsBlockButton: {
      backgroundColor: '#0B1426',
      borderColor: 'rgba(255,255,255,.14)',
      color: '#F0F2F5',
    },
    socialButtonsBlockButtonText: {
      color: '#F0F2F5',
      fontWeight: 650,
    },
    dividerLine: {
      backgroundColor: 'rgba(255,255,255,.12)',
    },
    dividerText: {
      color: 'rgba(240,242,245,.54)',
    },
    footer: {
      backgroundColor: '#111827',
      borderTop: '1px solid rgba(255,255,255,.08)',
    },
    footerActionText: {
      color: 'rgba(240,242,245,.62)',
    },
    footerActionLink: {
      color: '#5EC08A',
      fontWeight: 700,
    },
    identityPreviewText: {
      color: '#F0F2F5',
    },
    formFieldAction: {
      color: '#5EC08A',
      fontWeight: 700,
    },
    formFieldHintText: {
      color: 'rgba(240,242,245,.54)',
    },
    alertText: {
      color: '#F0F2F5',
    },
    formResendCodeLink: {
      color: '#5EC08A',
    },
  },
}

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
    <ClerkProvider publishableKey={clerkPublishableKey} appearance={clerkAppearance}>
      {routes}
    </ClerkProvider>
  ) : (
    routes
  ),
)
