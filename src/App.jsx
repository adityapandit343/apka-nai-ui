import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import AnalyticsPage from './pages/AnalyticsPage'
import DashboardPage from './pages/DashboardPage'
import CustomerPage from './pages/CustomerPage'
import NearbyShopsPage from './pages/NearbyShopsPage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/common/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" role="ShopOwner" />} />
          <Route path="/register" element={<AuthPage mode="register" role="ShopOwner" />} />
          <Route path="/customer/login" element={<AuthPage mode="login" role="Customer" />} />
          <Route path="/customer/register" element={<AuthPage mode="register" role="Customer" />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/analytics/" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/dashboard/settings/" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/customer/" element={<NearbyShopsPage />} />
          <Route path="/customer/:shopId" element={<CustomerPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
