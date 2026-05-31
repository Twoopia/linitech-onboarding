import { useEffect, useState } from 'react'
import { Fragment } from 'react'
import {
  Plus, Search, RefreshCw, Pencil, Trash2, Key, CheckSquare,
  Copy, Check, Mail, Lock, MessageSquare, Github, ChevronDown, Layers,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { employeesApi } from '../services/api'
import Modal from '../components/Modal'
import { useAuth } from '../contexts/AuthContext'

const DEPARTMENTS = ['TI', 'RH', 'Financeiro', 'Marketing', 'Comercial', 'Operações', 'Jurídico', 'Diretoria', 'Produto', 'Design']
const STATUSES = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'inactive', label: 'Inativo' },
]
const EMPTY_FORM = { name: '', email: '', department: '', position: '', manager: '', start_date: '' }

/* ── copy button ─────────────────────────────── */
function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false)
  const handle = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors"
      style={{ color: copied ? '#4ADE80' : '#6B5E4E', background: 'rgba(255,255,255,0.04)' }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  )
}

/* ── single account row inside the panel ────── */
function AccountRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
      style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={12} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#6B5E4E' }}>{label}</p>
        <code className="text-sm font-mono" style={{ color: '#E8D5B5' }}>{value ?? '—'}</code>
      </div>
      {value && <CopyBtn value={value} />}
    </div>
  )
}

/* ── inline accounts panel (expanded table row) */
function AccountsPanel({ emp }) {
  return (
    <tr>
      <td colSpan={7} style={{ padding: 0, background: 'rgba(124,58,237,0.04)', borderBottom: '1px solid rgba(124,58,237,0.12)' }}>
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={13} color="#9D6EFF" />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9D6EFF' }}>
              Contas provisionadas — {emp.name}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <AccountRow
              icon={Mail}
              label="E-mail Corporativo"
              value={emp.corporate_email}
              color="#9D6EFF"
            />
            <AccountRow
              icon={MessageSquare}
              label="Microsoft Teams"
              value={emp.corporate_email}
              color="#FBBF24"
            />
            <AccountRow
              icon={Github}
              label="Conta GitHub"
              value={`@${emp.username}`}
              color="#E8D5B5"
            />
            <AccountRow
              icon={Lock}
              label="Login da empresa"
              value={emp.username}
              color="#C9B99A"
            />
          </div>
        </div>
      </td>
    </tr>
  )
}

/* ── provisioning modal after creation ──────── */
function ProvisioningModal({ employee, onClose }) {
  if (!employee) return null
  return (
    <Modal open={!!employee} onClose={onClose} title="Contas Linitech provisionadas" width={500}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-bold text-sm flex-shrink-0"
            style={{ background: 'rgba(124,58,237,0.2)', color: '#9D6EFF' }}>
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-syne font-semibold" style={{ color: '#E8D5B5' }}>{employee.name}</p>
            <p className="text-xs" style={{ color: '#6B5E4E' }}>{employee.position} · {employee.department}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs font-medium" style={{ color: '#4ADE80' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
            4 contas criadas
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { icon: Mail, label: 'E-mail Corporativo', value: employee.corporate_email, color: '#9D6EFF' },
            { icon: MessageSquare, label: 'Microsoft Teams', value: employee.corporate_email, color: '#FBBF24' },
            { icon: Github, label: 'Conta GitHub', value: `@${employee.username}`, color: '#E8D5B5' },
            { icon: Lock, label: 'Login da empresa', value: employee.username, color: '#C9B99A' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg"
              style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}>
                  <Icon size={13} color={color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#6B5E4E' }}>{label}</p>
                  <code className="text-sm font-mono" style={{ color: '#E8D5B5' }}>{value}</code>
                </div>
              </div>
              <CopyBtn value={value} />
            </div>
          ))}

          {/* Senha separada */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg"
            style={{ background: '#0D0D0D', border: '1px solid rgba(248,113,113,0.15)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(248,113,113,0.1)' }}>
                <Key size={13} color="#F87171" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#6B5E4E' }}>Senha temporária</p>
                <code className="text-sm font-mono" style={{ color: '#E8D5B5' }}>{employee.temp_password}</code>
              </div>
            </div>
            <CopyBtn value={employee.temp_password} />
          </div>
        </div>

        <p className="text-xs text-center" style={{ color: '#6B5E4E' }}>
          Salve a senha antes de fechar — não será exibida novamente.
        </p>
        <button className="btn-primary w-full justify-center" onClick={onClose}>
          Entendi, fechar
        </button>
      </div>
    </Modal>
  )
}

/* ── main page ───────────────────────────────── */
export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [provisionModal, setProvisionModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [openAccountsId, setOpenAccountsId] = useState(null)
  const navigate = useNavigate()
  const { isRH } = useAuth()

  const load = () => employeesApi.list().then((r) => setEmployees(r.data))
  useEffect(() => { load() }, [])

  const filtered = employees.filter((e) =>
    [e.name, e.email, e.department, e.corporate_email ?? ''].some((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    )
  )

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (emp) => {
    setEditing(emp)
    setForm({ name: emp.name, email: emp.email, department: emp.department, position: emp.position, manager: emp.manager ?? '', start_date: emp.start_date })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await employeesApi.update(editing.id, form)
        toast.success('Colaborador atualizado')
        setModalOpen(false)
      } else {
        const res = await employeesApi.create(form)
        setModalOpen(false)
        setProvisionModal(res.data)
        toast.success('Colaborador cadastrado — contas provisionadas!')
      }
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (emp) => {
    if (!confirm(`Remover ${emp.name}?`)) return
    await employeesApi.remove(emp.id)
    toast.success('Colaborador removido')
    load()
  }

  const handleRegenerate = async (emp) => {
    const res = await employeesApi.regenerate(emp.id)
    setProvisionModal(res.data)
    toast.success('Credenciais regeneradas')
  }

  const handleStatusChange = async (emp, status) => {
    await employeesApi.update(emp.id, { status })
    load()
  }

  const toggleAccounts = (id) => setOpenAccountsId((prev) => (prev === id ? null : id))

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-xs px-3 h-9 rounded-lg"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={14} style={{ color: '#6B5E4E', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar colaborador..."
            style={{ background: 'transparent', border: 'none', padding: 0, width: '100%', fontSize: '0.875rem' }}
          />
        </div>
        {isRH && (
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={15} />
            Novo Colaborador
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Departamento</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Login</th>
              <th>Início</th>
              <th style={{ width: 120 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10" style={{ color: '#6B5E4E' }}>
                  Nenhum colaborador encontrado
                </td>
              </tr>
            )}
            {filtered.map((emp) => (
              <Fragment key={emp.id}>
                <tr>
                  {/* Nome + botão Contas */}
                  <td>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p style={{ color: '#E8D5B5', fontWeight: 500 }}>{emp.name}</p>
                        {emp.corporate_email && (
                          <button
                            onClick={() => toggleAccounts(emp.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all"
                            style={
                              openAccountsId === emp.id
                                ? { background: 'rgba(124,58,237,0.2)', color: '#9D6EFF', border: '1px solid rgba(124,58,237,0.3)' }
                                : { background: 'rgba(255,255,255,0.04)', color: '#6B5E4E', border: '1px solid rgba(255,255,255,0.06)' }
                            }
                          >
                            <Layers size={10} />
                            Contas
                            <ChevronDown
                              size={10}
                              style={{ transform: openAccountsId === emp.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                            />
                          </button>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: '#6B5E4E' }}>{emp.email}</p>
                    </div>
                  </td>

                  <td style={{ color: '#C9B99A' }}>{emp.department}</td>
                  <td style={{ color: '#C9B99A' }}>{emp.position}</td>

                  {/* Status select */}
                  <td>
                    <select
                      value={emp.status}
                      onChange={(e) => handleStatusChange(emp, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto',
                        color: emp.status === 'completed' ? '#4ADE80' : emp.status === 'in_progress' ? '#9D6EFF' : emp.status === 'inactive' ? '#6B5E4E' : '#FBBF24' }}
                    >
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>

                  <td>
                    <code className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgba(124,58,237,0.1)', color: '#9D6EFF' }}>
                      {emp.username ?? '—'}
                    </code>
                  </td>

                  <td className="text-xs" style={{ color: '#6B5E4E' }}>{emp.start_date}</td>

                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/checklist?emp=${emp.id}`)} title="Ver checklist"
                        className="w-7 h-7 rounded flex items-center justify-center" style={{ color: '#6B5E4E' }}>
                        <CheckSquare size={14} />
                      </button>
                      {isRH && <>
                        <button onClick={() => handleRegenerate(emp)} title="Ver credenciais"
                          className="w-7 h-7 rounded flex items-center justify-center" style={{ color: '#6B5E4E' }}>
                          <Key size={14} />
                        </button>
                        <button onClick={() => openEdit(emp)}
                          className="w-7 h-7 rounded flex items-center justify-center" style={{ color: '#6B5E4E' }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(emp)}
                          className="w-7 h-7 rounded flex items-center justify-center" style={{ color: '#F87171' }}>
                          <Trash2 size={14} />
                        </button>
                      </>}
                    </div>
                  </td>
                </tr>

                {/* Accounts panel — inline expanded row */}
                {openAccountsId === emp.id && <AccountsPanel emp={emp} />}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Colaborador' : 'Novo Colaborador'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!editing && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#9D6EFF' }}>
              <Mail size={12} />
              E-mail @linitech.com, login e contas Teams / Microsoft serão gerados automaticamente
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label>Nome completo</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="João da Silva" />
            </div>
            <div className="col-span-2">
              <label>E-mail pessoal</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="joao@gmail.com" />
            </div>
            <div>
              <label>Departamento</label>
              <select required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Selecionar...</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label>Cargo</label>
              <input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Analista Sr." />
            </div>
            <div>
              <label>Gestor direto</label>
              <input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="Maria Santos" />
            </div>
            <div>
              <label>Data de início</label>
              <input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <RefreshCw size={14} className="animate-spin" />}
              {editing ? 'Salvar alterações' : 'Cadastrar e provisionar'}
            </button>
          </div>
        </form>
      </Modal>

      <ProvisioningModal employee={provisionModal} onClose={() => setProvisionModal(null)} />
    </div>
  )
}
