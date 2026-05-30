import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertTriangle, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../services/api'

const ROLES = [
  { value: 'rh', label: 'RH', desc: 'Acesso completo' },
  { value: 'ti', label: 'TI', desc: 'Visualização' },
  { value: 'gestor', label: 'Gestor', desc: 'Visualização' },
]

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!role) { setError('Selecione seu cargo antes de continuar.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(username, password, role)
      login(res.data.access_token, res.data.role)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Erro ao conectar. Verifique se o servidor está online.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grain min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0D0D0D' }}>
      <div className="w-full" style={{ maxWidth: 400 }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', boxShadow: '0 0 40px rgba(124,58,237,0.35)' }}>
            <svg width="26" height="26" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="font-syne font-bold text-2xl" style={{ color: '#E8D5B5', letterSpacing: '-0.03em' }}>
            linitech
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B5E4E' }}>Sistema de Onboarding · Acesso restrito</p>
        </div>

        <div className="card p-6 flex flex-col gap-5">

          {/* Role pills */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#6B5E4E' }}>
              Selecione seu cargo
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const active = role === r.value
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all"
                    style={active
                      ? { background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.4)', color: '#9D6EFF' }
                      : { background: '#161616', border: '1px solid rgba(255,255,255,0.06)', color: '#6B5E4E' }
                    }
                  >
                    <span className="font-syne font-bold text-sm">{r.label}</span>
                    <span className="text-xs" style={{ color: active ? '#9D6EFF' : '#6B5E4E', opacity: 0.8 }}>
                      {r.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg text-xs"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label>Usuário</label>
              <input required autoFocus autoComplete="username"
                value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="linitech" />
            </div>
            <div>
              <label>Senha</label>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: '#6B5E4E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !role} className="btn-primary w-full justify-center mt-1"
              style={{ height: 42, opacity: !role ? 0.5 : 1 }}>
              {loading ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> : <LogIn size={15} />}
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Demo box */}
        <div className="mt-4 rounded-xl p-4"
          style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.18)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9D6EFF' }}>
            Acesso para demonstração
          </p>
          <div className="flex flex-col gap-2 text-xs">
            {[
              { label: 'Usuário', value: 'linitech' },
              { label: 'Senha', value: 'lini@2026' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span style={{ color: '#6B5E4E' }}>{label}</span>
                <code style={{ color: '#E8D5B5' }}>{value}</code>
              </div>
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />
            <div className="flex items-center justify-between">
              <span style={{ color: '#6B5E4E' }}>RH</span>
              <span style={{ color: '#9D6EFF' }}>Acesso completo</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#6B5E4E' }}>TI / Gestor</span>
              <span style={{ color: '#6B5E4E' }}>Somente visualização</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#6B5E4E' }}>
          © 2026 Linitech · Projeto de portfólio
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
