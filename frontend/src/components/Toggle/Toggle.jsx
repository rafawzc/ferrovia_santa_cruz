export default function Toggle({ label, checked, onChange, id }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 cursor-pointer select-none"
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-10 h-6 rounded-full bg-texto1/20 border border-border peer-checked:bg-componente1 peer-checked:border-transparent transition-colors duration-200" />
        <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-texto2 shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
      </div>
      <span className="text-xs text-texto1">{label}</span>
    </label>
  )
}
