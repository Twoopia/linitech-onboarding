import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Circle, ChevronDown, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { employeesApi, checklistApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Checklist() {
  const [searchParams] = useSearchParams()
  const [employees, setEmployees] = useState([])
  const [selectedId, setSelectedId] = useState(searchParams.get('emp') ?? '')
  const [items, setItems] = useState([])
  const [progress, setProgress] = useState(null)
  const { isRH } = useAuth()

  useEffect(() => {
    employeesApi.list().then((r) => setEmployees(r.data))
  }, [])

  useEffect(() => {
    if (!selectedId) { setItems([]); setProgress(null); return }
    checklistApi.get(selectedId).then((r) => setItems(r.data))
    checklistApi.progress(selectedId).then((r) => setProgress(r.data))
  }, [selectedId])

  const toggle = async (item) => {
    try {
      const updated = await checklistApi.updateItem(item.id, !item.completed)
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated.data : i)))
      checklistApi.progress(selectedId).then((r) => setProgress(r.data))
      toast.success(updated.data.completed ? 'Item concluído!' : 'Item reaberto')
    } catch {
      toast.error('Erro ao atualizar item')
    }
  }

  const grouped = items.reduce((acc, item) => {
    const cat = item.category ?? 'Geral'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const selectedEmp = employees.find((e) => String(e.id) === String(selectedId))

  return (
    <div className="flex flex-col gap-5">
      {/* Read-only notice */}
      {!isRH && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: '#FBBF24' }}>
          <Lock size={12} />
          Modo visualização — apenas o RH pode marcar itens do checklist
        </div>
      )}
      {/* Selector */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label style={{ display: 'block', marginBottom: 6 }}>Selecionar colaborador</label>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ paddingRight: 32 }}
            >
              <option value="">Escolha um colaborador...</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.department}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B5E4E', pointerEvents: 'none' }} />
          </div>
        </div>
        {progress && (
          <div className="text-right flex-shrink-0">
            <p className="font-syne font-bold text-3xl" style={{ color: '#E8D5B5' }}>
              {progress.percentage}%
            </p>
            <p className="text-xs" style={{ color: '#6B5E4E' }}>
              {progress.completed}/{progress.total} tarefas
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-1 rounded-full transition-all duration-700"
            style={{ width: `${progress.percentage}%`, background: 'linear-gradient(90deg, #7C3AED, #9D6EFF)' }}
          />
        </div>
      )}

      {/* Employee info */}
      {selectedEmp && (
        <div className="card p-4 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-bold text-sm flex-shrink-0"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#9D6EFF' }}
          >
            {selectedEmp.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium" style={{ color: '#E8D5B5' }}>{selectedEmp.name}</p>
            <p className="text-xs" style={{ color: '#6B5E4E' }}>
              {selectedEmp.position} · {selectedEmp.department} · Início: {selectedEmp.start_date}
            </p>
          </div>
        </div>
      )}

      {/* Checklist grouped by category */}
      {!selectedId && (
        <div className="card p-10 text-center" style={{ color: '#6B5E4E' }}>
          Selecione um colaborador para visualizar o checklist de onboarding
        </div>
      )}

      {selectedId && items.length === 0 && (
        <div className="card p-10 text-center" style={{ color: '#6B5E4E' }}>
          Nenhum item encontrado
        </div>
      )}

      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category} className="card overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#6B5E4E' }}>
              {category}
            </span>
            <span className="text-xs" style={{ color: '#6B5E4E' }}>
              {catItems.filter((i) => i.completed).length}/{catItems.length}
            </span>
          </div>
          <div className="flex flex-col">
            {catItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-start gap-3 px-5 py-4 transition-colors"
                style={{
                  borderBottom: idx < catItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: isRH ? 'pointer' : 'default',
                }}
                onClick={() => isRH && toggle(item)}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {item.completed ? (
                    <CheckCircle2 size={18} color="#4ADE80" />
                  ) : (
                    <Circle size={18} color="#6B5E4E" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: item.completed ? '#6B5E4E' : '#C9B99A',
                      textDecoration: item.completed ? 'line-through' : 'none',
                    }}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs mt-0.5" style={{ color: '#6B5E4E' }}>
                      {item.description}
                    </p>
                  )}
                </div>
                {item.responsible && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#6B5E4E', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {item.responsible}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
