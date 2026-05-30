import { useEffect, useState, useCallback } from 'react'
import { Users, Clock, CheckCircle, Monitor, TrendingUp, Activity, RefreshCw } from 'lucide-react'
import { dashboardApi } from '../services/api'
import StatCard from '../components/StatCard'

const ACTION_ICONS = {
  created: '✦',
  updated: '◈',
  deleted: '✕',
  completed: '✓',
  uncompleted: '○',
  assigned: '→',
  returned: '←',
  credentials_generated: '⚿',
}

const ENTITY_LABELS = {
  employee: 'Colaborador',
  equipment: 'Equipamento',
  checklist: 'Checklist',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  return `${Math.floor(hrs / 24)}d atrás`
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, recentRes] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.recent(),
      ])
      setStats(statsRes.data)
      setRecent(recentRes.data)
    } catch {
      setError('Não foi possível carregar os dados. Verifique se o servidor está online.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e, i) => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 80)
      }),
      { threshold: 0.1 },
    )
    // Observe after a tick so elements are mounted
    setTimeout(() => document.querySelectorAll('.animate').forEach((el) => observer.observe(el)), 100)
    return () => observer.disconnect()
  }, [load])

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm mb-4" style={{ color: '#F87171' }}>{error}</p>
        <button className="btn-ghost" onClick={load}><RefreshCw size={14} /> Tentar novamente</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest" style={{ color: '#6B5E4E' }}>Visão geral</p>
        <button
          onClick={load}
          disabled={loading}
          className="btn-ghost py-1.5 px-3 text-xs"
          style={{ fontSize: '0.75rem' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total de Colaboradores" value={stats?.employees.total}
          sub={`${stats?.employees.inactive ?? 0} inativos`} color="#7C3AED" />
        <StatCard icon={Clock} label="Em Andamento" value={stats?.employees.in_progress}
          sub={`${stats?.employees.pending ?? 0} pendentes`} color="#FBBF24" />
        <StatCard icon={CheckCircle} label="Concluídos" value={stats?.employees.completed}
          sub={`${stats?.checklist.percentage ?? 0}% das tarefas`} color="#4ADE80" />
        <StatCard icon={Monitor} label="Equipamentos" value={stats?.equipment.total}
          sub={`${stats?.equipment.assigned ?? 0} atribuídos`} color="#9D6EFF" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Progress card */}
        <div className="card p-5 animate">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} color="#7C3AED" />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#6B5E4E' }}>
              Progresso Geral
            </span>
          </div>
          <p className="font-syne font-bold text-4xl mb-1" style={{ color: '#E8D5B5' }}>
            {stats?.checklist.percentage ?? 0}%
          </p>
          <p className="text-xs mb-4" style={{ color: '#6B5E4E' }}>
            {stats?.checklist.completed ?? 0} de {stats?.checklist.total ?? 0} tarefas concluídas
          </p>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${stats?.checklist.percentage ?? 0}%`, background: 'linear-gradient(90deg, #7C3AED, #9D6EFF)' }} />
          </div>
          <div className="flex justify-between mt-4 gap-3">
            {[
              { label: 'Pendentes', val: stats?.employees.pending, color: '#FBBF24' },
              { label: 'Andamento', val: stats?.employees.in_progress, color: '#9D6EFF' },
              { label: 'Concluídos', val: stats?.employees.completed, color: '#4ADE80' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex-1 text-center">
                <p className="font-syne font-bold text-xl" style={{ color }}>{val ?? 0}</p>
                <p className="text-xs" style={{ color: '#6B5E4E' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card p-5 lg:col-span-2 animate">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} color="#7C3AED" />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#6B5E4E' }}>
              Atividade Recente
            </span>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: '#6B5E4E' }}>
              Nenhuma atividade registrada
            </p>
          ) : (
            recent.map((log, i) => (
              <div key={log.id} className="flex items-start gap-3 py-3"
                style={{ borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(124,58,237,0.12)', color: '#9D6EFF' }}>
                  {ACTION_ICONS[log.action] ?? '•'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: '#C9B99A' }}>{log.details}</p>
                  <p className="text-xs" style={{ color: '#6B5E4E' }}>{ENTITY_LABELS[log.entity] ?? log.entity}</p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: '#6B5E4E' }}>{timeAgo(log.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
