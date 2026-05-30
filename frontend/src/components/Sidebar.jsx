import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, CheckSquare, Monitor, ScrollText, Package, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/colaboradores', icon: Users, label: 'Colaboradores' },
  { to: '/checklist', icon: CheckSquare, label: 'Checklist' },
  { to: '/equipamentos', icon: Monitor, label: 'Equipamentos' },
  { to: '/provisionamento', icon: Package, label: 'Provisionamento' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
]

const ROLE_LABELS = { rh: 'RH', ti: 'TI', gestor: 'Gestor' }
const ROLE_COLORS = {
  rh:     { color: '#9D6EFF', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
  ti:     { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)' },
  gestor: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
}

export default function Sidebar() {
  const { logout, role } = useAuth()
  const navigate = useNavigate()
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.rh

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    toast.success('Sessão encerrada')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-40"
      style={{ background: '#0D0D0D', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
          </svg>
        </div>
        <div>
          <p className="font-syne font-bold text-base leading-none" style={{ color: '#E8D5B5', letterSpacing: '-0.02em' }}>
            linitech
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6B5E4E' }}>onboarding</p>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1 mt-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => isActive
              ? { background: 'rgba(124,58,237,0.15)', color: '#9D6EFF', border: '1px solid rgba(124,58,237,0.2)' }
              : { color: '#6B5E4E', border: '1px solid transparent' }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300">
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 flex flex-col gap-2">
        {/* Role badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg"
          style={{ background: roleStyle.bg, border: `1px solid ${roleStyle.border}` }}>
          <span className="text-xs font-semibold" style={{ color: roleStyle.color }}>
            {ROLE_LABELS[role] ?? role}
          </span>
          <span className="text-xs" style={{ color: roleStyle.color, opacity: 0.7 }}>
            {role === 'rh' ? 'Acesso completo' : 'Visualização'}
          </span>
        </div>

        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: '#6B5E4E', border: '1px solid transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.06)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6B5E4E'; e.currentTarget.style.background = 'transparent' }}>
          <LogOut size={15} />
          Sair da sessão
        </button>

        <div className="rounded-lg p-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
            <span className="text-xs font-medium" style={{ color: '#4ADE80' }}>Sistema online</span>
          </div>
          <p className="text-xs" style={{ color: '#6B5E4E' }}>linitech.com · v1.0</p>
        </div>
      </div>
    </aside>
  )
}
