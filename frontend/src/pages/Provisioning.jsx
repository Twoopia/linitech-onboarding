import { useEffect, useState, useCallback } from 'react'
import {
  Mail, MessageSquare, Github, Lock, Key, Eye, EyeOff,
  Copy, Check, RefreshCw, CheckCircle2, Package,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { employeesApi } from '../services/api'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useAuth } from '../contexts/AuthContext'

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Aguardando entrega' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'inactive', label: 'Inativos' },
]

function CopyBtn({ value, small }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className="flex items-center justify-center rounded transition-colors flex-shrink-0"
      style={{
        width: small ? 24 : 28,
        height: small ? 24 : 28,
        background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
        color: copied ? '#4ADE80' : '#6B5E4E',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  )
}

function CredRow({ icon: Icon, label, value, color, masked, onToggleMask }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12` }}>
        <Icon size={13} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#6B5E4E' }}>{label}</p>
        <code className="text-sm font-mono" style={{ color: '#E8D5B5' }}>
          {masked ? '●'.repeat(Math.min(value?.length ?? 8, 14)) : value}
        </code>
      </div>
      <div className="flex items-center gap-1">
        {onToggleMask && (
          <button onClick={onToggleMask}
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ color: '#6B5E4E', background: 'rgba(255,255,255,0.04)' }}>
            {masked ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
        )}
        <CopyBtn value={value} small />
      </div>
    </div>
  )
}

function CredentialCard({ emp, onStatusChange }) {
  const [showPass, setShowPass] = useState(false)
  const [regen, setRegen] = useState(false)
  const [regenModal, setRegenModal] = useState(false)
  const [newCreds, setNewCreds] = useState(null)
  const { isRH } = useAuth()

  const handleDeliver = async () => {
    if (emp.status !== 'pending') return
    await employeesApi.update(emp.id, { status: 'in_progress' })
    toast.success('Credenciais marcadas como entregues')
    onStatusChange()
  }

  const handleRegen = async () => {
    setRegen(true)
    try {
      const res = await employeesApi.regenerate(emp.id)
      setNewCreds(res.data)
      setRegenModal(true)
      toast.success('Senha regenerada com sucesso')
      onStatusChange()
    } finally {
      setRegen(false)
    }
  }

  const copyAll = () => {
    const text = [
      `Colaborador: ${emp.name}`,
      `E-mail corporativo: ${emp.corporate_email}`,
      `Teams: ${emp.corporate_email}`,
      `GitHub: @${emp.username}`,
      `Login: ${emp.username}`,
      `Senha temporária: ${emp.temp_password}`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    toast.success('Todas as credenciais copiadas')
  }

  const isDelivered = emp.status !== 'pending'

  return (
    <>
      <div className="card overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-bold text-sm flex-shrink-0"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#9D6EFF' }}>
              {emp.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-syne font-semibold text-sm" style={{ color: '#E8D5B5' }}>{emp.name}</p>
              <p className="text-xs" style={{ color: '#6B5E4E' }}>
                {emp.position} · {emp.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={emp.status} />
            <span className="text-xs" style={{ color: '#6B5E4E' }}>Início: {emp.start_date}</span>
          </div>
        </div>

        {/* Credentials */}
        <div className="p-4 grid grid-cols-1 gap-2 xl:grid-cols-2">
          <CredRow icon={Mail} label="E-mail Corporativo" value={emp.corporate_email} color="#9D6EFF" />
          <CredRow icon={MessageSquare} label="Microsoft Teams" value={emp.corporate_email} color="#FBBF24" />
          <CredRow icon={Github} label="Conta GitHub" value={`@${emp.username}`} color="#E8D5B5" />
          <CredRow icon={Lock} label="Login do Sistema" value={emp.username} color="#4ADE80" />
          <div className="md:col-span-2">
            <CredRow
              icon={Key}
              label="Senha Temporária"
              value={emp.temp_password}
              color="#F87171"
              masked={!showPass}
              onToggleMask={() => setShowPass((v) => !v)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-4 pb-4">
          <div className="flex gap-2">
            <button onClick={copyAll} className="btn-ghost py-1.5 px-3 text-xs">
              <Copy size={12} />
              Copiar tudo
            </button>
            {isRH && (
              <button onClick={handleRegen} disabled={regen} className="btn-ghost py-1.5 px-3 text-xs">
                <RefreshCw size={12} className={regen ? 'animate-spin' : ''} />
                Regenerar senha
              </button>
            )}
          </div>

          {isRH && emp.status === 'pending' ? (
            <button onClick={handleDeliver} className="btn-primary py-1.5 px-3" style={{ fontSize: '0.75rem' }}>
              <CheckCircle2 size={13} />
              Marcar como entregue
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#4ADE80' }}>
              <CheckCircle2 size={13} />
              {emp.status === 'pending' ? 'Aguardando entrega' : 'Credenciais entregues'}
            </span>
          )}
        </div>
      </div>

      {/* Regen result modal */}
      <Modal open={regenModal} onClose={() => setRegenModal(false)} title="Nova senha gerada" width={420}>
        {newCreds && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: '#C9B99A' }}>
              A senha anterior foi invalidada. Entregue as novas credenciais ao colaborador.
            </p>
            <CredRow icon={Lock} label="Login" value={newCreds.username} color="#4ADE80" />
            <CredRow icon={Key} label="Nova senha temporária" value={newCreds.temp_password} color="#F87171" />
            <button className="btn-primary w-full justify-center" onClick={() => setRegenModal(false)}>
              Fechar
            </button>
          </div>
        )}
      </Modal>
    </>
  )
}

export default function Provisioning() {
  const [employees, setEmployees] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await employeesApi.list()
      setEmployees(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter ? employees.filter((e) => e.status === filter) : employees

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={15} color="#7C3AED" />
          <p className="text-xs uppercase tracking-widest" style={{ color: '#6B5E4E' }}>
            {filtered.length} pacote{filtered.length !== 1 ? 's' : ''} de credenciais
          </p>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
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

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs"
        style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)', color: '#9D6EFF' }}>
        <Key size={13} className="flex-shrink-0 mt-0.5" />
        <span>
          Esta página é de uso exclusivo da equipe de RH/TI. As senhas temporárias devem ser entregues
          presencialmente ao colaborador e alteradas no primeiro acesso.
          Colaboradores com status <strong>Aguardando entrega</strong> precisam receber suas credenciais.
        </span>
      </div>

      {/* Cards */}
      {loading && (
        <div className="text-center py-10 text-sm" style={{ color: '#6B5E4E' }}>Carregando...</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: '#6B5E4E' }}>
          Nenhum colaborador encontrado para este filtro.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map((emp) => (
          <CredentialCard key={emp.id} emp={emp} onStatusChange={load} />
        ))}
      </div>
    </div>
  )
}
