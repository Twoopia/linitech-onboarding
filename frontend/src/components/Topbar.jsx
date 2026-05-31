import { useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'

const titles = {
  '/': 'Dashboard',
  '/colaboradores': 'Colaboradores',
  '/checklist': 'Checklist de Onboarding',
  '/equipamentos': 'Equipamentos',
  '/provisionamento': 'Provisionamento de Contas',
  '/logs': 'Logs do Sistema',
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()

  return (
    <header className="topbar sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-14">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#C9B99A' }}
        >
          <Menu size={16} />
        </button>
        <h1 className="font-syne font-semibold text-sm md:text-base" style={{ color: '#E8D5B5' }}>
          {titles[pathname] ?? 'Linitech'}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#6B5E4E' }}>
          <Bell size={15} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-syne"
          style={{ background: 'rgba(124,58,237,0.2)', color: '#9D6EFF', border: '1px solid rgba(124,58,237,0.3)' }}>
          A
        </div>
      </div>
    </header>
  )
}
