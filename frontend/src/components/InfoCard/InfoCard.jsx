export default function InfoCard({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="bg-componente1 rounded-xl p-3 flex items-center justify-center">
        <Icon size={28} className="text-texto2" />
      </div>
      <div>
        <p className="text-sm font-medium text-texto1">{label}</p>
        <p className="text-xl font-bold text-texto1">{value}</p>
      </div>
    </div>
  )
}
