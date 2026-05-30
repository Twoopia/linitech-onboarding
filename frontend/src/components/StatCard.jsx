export default function StatCard({ icon: Icon, label, value, sub, color = '#7C3AED' }) {
  return (
    <div
      className="card p-5 flex flex-col gap-3 animate"
      style={{ minHeight: 120 }}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#6B5E4E' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={15} color={color} />
        </div>
      </div>
      <div>
        <p className="font-syne font-bold text-3xl" style={{ color: '#E8D5B5', lineHeight: 1 }}>
          {value ?? '—'}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: '#6B5E4E' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}
