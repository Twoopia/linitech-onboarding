import { useEffect, useState } from 'react'
import { Filter } from 'lucide-react'
import { logsApi } from '../services/api'

const ACTION_COLORS = {
  created: '#4ADE80',
  updated: '#9D6EFF',
  deleted: '#F87171',
  completed: '#4ADE80',
  uncompleted: '#FBBF24',
  assigned: '#9D6EFF',
  returned: '#C9B99A',
  credentials_generated: '#FBBF24',
}

const ACTION_LABELS = {
  created: 'Criado',
  updated: 'Atualizado',
  deleted: 'Removido',
  completed: 'Concluído',
  uncompleted: 'Reaberto',
  assigned: 'Atribuído',
  returned: 'Devolvido',
  credentials_generated: 'Credenciais',
}

const ENTITY_LABELS = {
  employee: 'Colaborador',
  equipment: 'Equipamento',
  checklist: 'Checklist',
}

const FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'employee', label: 'Colaboradores' },
  { value: 'equipment', label: 'Equipamentos' },
  { value: 'checklist', label: 'Checklist' },
]

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    logsApi.list(filter || undefined).then((r) => setLogs(r.data))
  }, [filter])

  return (
    <div className="flex flex-col gap-5">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} style={{ color: '#6B5E4E' }} />
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                filter === f.value
                  ? { background: 'rgba(124,58,237,0.15)', color: '#9D6EFF', border: '1px solid rgba(124,58,237,0.2)' }
                  : { background: 'transparent', color: '#6B5E4E', border: '1px solid transparent' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log list */}
      <div className="card divide-y" style={{ '--tw-divide-opacity': 1 }}>
        {logs.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: '#6B5E4E' }}>
            Nenhum log encontrado
          </div>
        )}
        {logs.map((log) => {
          const color = ACTION_COLORS[log.action] ?? '#6B5E4E'
          return (
            <div
              key={log.id}
              className="flex items-start gap-4 px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              {/* Action badge */}
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 mt-0.5"
                style={{ background: `${color}12`, color, border: `1px solid ${color}25`, minWidth: 90, justifyContent: 'center' }}
              >
                {ACTION_LABELS[log.action] ?? log.action}
              </span>

              {/* Entity badge */}
              <span
                className="text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#6B5E4E', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {ENTITY_LABELS[log.entity] ?? log.entity}
              </span>

              {/* Details */}
              <p className="flex-1 text-sm" style={{ color: '#C9B99A' }}>
                {log.details}
              </p>

              {/* Meta */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs" style={{ color: '#6B5E4E' }}>{formatDate(log.created_at)}</p>
                <p className="text-xs" style={{ color: '#6B5E4E' }}>por {log.user}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
