export default function InfoCard({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-primary p-3">
        <Icon size={28} className="text-on-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xl font-bold text-text">{value}</p>
      </div>
    </div>
  )
}
