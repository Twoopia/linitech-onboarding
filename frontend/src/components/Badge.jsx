const STATUS_MAP = {
  // Employee
  pending: { label: 'Pendente', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  in_progress: { label: 'Em Andamento', color: '#9D6EFF', bg: 'rgba(157,110,255,0.1)' },
  completed: { label: 'Concluído', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
  inactive: { label: 'Inativo', color: '#6B5E4E', bg: 'rgba(107,94,78,0.1)' },
  // Equipment
  available: { label: 'Disponível', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
  assigned: { label: 'Atribuído', color: '#9D6EFF', bg: 'rgba(157,110,255,0.1)' },
  returned: { label: 'Devolvido', color: '#6B5E4E', bg: 'rgba(107,94,78,0.1)' },
  maintenance: { label: 'Manutenção', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
}

export default function Badge({ status }) {
  const cfg = STATUS_MAP[status] ?? { label: status, color: '#6B5E4E', bg: 'rgba(107,94,78,0.1)' }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}25` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.color }}
      />
      {cfg.label}
    </span>
  )
}
