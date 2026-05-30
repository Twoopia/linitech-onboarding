import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Checklist from './pages/Checklist'
import Equipment from './pages/Equipment'
import Provisioning from './pages/Provisioning'
import Logs from './pages/Logs'

function AppLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="grain flex h-full bg-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 ml-60">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGuard />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/colaboradores" element={<Employees />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/equipamentos" element={<Equipment />} />
        <Route path="/provisionamento" element={<Provisioning />} />
        <Route path="/logs" element={<Logs />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function LoginGuard() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />
}
