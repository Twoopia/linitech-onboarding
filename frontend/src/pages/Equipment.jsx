import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ArrowRight, ArrowLeft, RefreshCw, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { equipmentApi, employeesApi } from '../services/api'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useAuth } from '../contexts/AuthContext'

const TYPES = ['Notebook', 'Desktop', 'Monitor', 'Headset', 'Teclado', 'Mouse', 'Celular', 'Tablet', 'Impressora', 'Outro']
const EMPTY_FORM = { type: '', brand: '', model: '', serial_number: '', notes: '' }

export default function Equipment() {
  const [equipment, setEquipment] = useState([])
  const [employees, setEmployees] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [assignModal, setAssignModal] = useState(null)
  const [assignEmpId, setAssignEmpId] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const { isRH } = useAuth()
  const load = () => {
    equipmentApi.list().then((r) => setEquipment(r.data))
    employeesApi.list().then((r) => setEmployees(r.data))
  }
  useEffect(() => { load() }, [])

  const empName = (id) => employees.find((e) => e.id === id)?.name ?? '—'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await equipmentApi.create(form)
      toast.success('Equipamento cadastrado')
      setModalOpen(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eq) => {
    if (!confirm(`Remover ${eq.type} (${eq.serial_number})?`)) return
    await equipmentApi.remove(eq.id)
    toast.success('Equipamento removido')
    load()
  }

  const handleAssign = async () => {
    if (!assignEmpId) return
    await equipmentApi.assign(assignModal.id, Number(assignEmpId))
    toast.success('Equipamento atribuído')
    setAssignModal(null)
    load()
  }

  const handleReturn = async (eq) => {
    await equipmentApi.return(eq.id)
    toast.success('Equipamento devolvido')
    load()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        {!isRH && (
          <span className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: '#FBBF24' }}>
            <Lock size={12} /> Modo visualização
          </span>
        )}
        {isRH && (
          <button className="btn-primary ml-auto" onClick={() => { setModalOpen(true); setForm(EMPTY_FORM) }}>
            <Plus size={15} />
            Novo Equipamento
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Tipo / Marca</th>
              <th>Modelo</th>
              <th>Nº de Série</th>
              <th>Status</th>
              <th>Colaborador</th>
              <th style={{ width: 140 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipment.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10" style={{ color: '#6B5E4E' }}>
                  Nenhum equipamento cadastrado
                </td>
              </tr>
            )}
            {equipment.map((eq) => (
              <tr key={eq.id}>
                <td>
                  <div>
                    <p style={{ color: '#E8D5B5', fontWeight: 500 }}>{eq.type}</p>
                    <p className="text-xs" style={{ color: '#6B5E4E' }}>
                      {eq.brand ?? '—'}
                    </p>
                  </div>
                </td>
                <td style={{ color: '#C9B99A' }}>{eq.model ?? '—'}</td>
                <td>
                  <code className="text-xs" style={{ color: '#9D6EFF' }}>
                    {eq.serial_number}
                  </code>
                </td>
                <td>
                  <Badge status={eq.status} />
                </td>
                <td className="text-sm" style={{ color: eq.employee_id ? '#C9B99A' : '#6B5E4E' }}>
                  {eq.employee_id ? empName(eq.employee_id) : '—'}
                </td>
                <td>
                  {isRH && (
                    <div className="flex items-center gap-1">
                      {eq.status === 'available' || eq.status === 'returned' ? (
                        <button onClick={() => { setAssignModal(eq); setAssignEmpId('') }} title="Atribuir"
                          className="w-7 h-7 rounded flex items-center justify-center" style={{ color: '#9D6EFF' }}>
                          <ArrowRight size={14} />
                        </button>
                      ) : eq.status === 'assigned' ? (
                        <button onClick={() => handleReturn(eq)} title="Devolver"
                          className="w-7 h-7 rounded flex items-center justify-center" style={{ color: '#FBBF24' }}>
                          <ArrowLeft size={14} />
                        </button>
                      ) : null}
                      <button onClick={() => handleDelete(eq)}
                        className="w-7 h-7 rounded flex items-center justify-center" style={{ color: '#F87171' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add equipment modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Equipamento">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Tipo</label>
              <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="">Selecionar...</option>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>Marca</label>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Dell, Apple..." />
            </div>
            <div>
              <label>Modelo</label>
              <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="XPS 15, MacBook Pro..." />
            </div>
            <div>
              <label>Número de série</label>
              <input required value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} placeholder="SN-00001" />
            </div>
            <div className="col-span-2">
              <label>Observações</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Estado, acessórios..." />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <RefreshCw size={14} className="animate-spin" />}
              Cadastrar
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Atribuir equipamento" width={400}>
        {assignModal && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg p-3" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-medium" style={{ color: '#E8D5B5' }}>{assignModal.type}</p>
              <p className="text-xs" style={{ color: '#6B5E4E' }}>{assignModal.serial_number}</p>
            </div>
            <div>
              <label>Colaborador</label>
              <select value={assignEmpId} onChange={(e) => setAssignEmpId(e.target.value)}>
                <option value="">Selecionar...</option>
                {employees
                  .filter((e) => e.status !== 'inactive')
                  .map((e) => (
                    <option key={e.id} value={e.id}>{e.name} — {e.department}</option>
                  ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setAssignModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAssign} disabled={!assignEmpId}>
                <ArrowRight size={14} />
                Atribuir
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
