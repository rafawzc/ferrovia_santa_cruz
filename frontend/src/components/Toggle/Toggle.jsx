export default function Toggle({ label, checked, onChange, id }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 select-none">
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div className="h-6 w-10 rounded-full border border-border bg-texto1/20 transition-colors duration-200 peer-checked:border-transparent peer-checked:bg-componente1" />
        <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-texto2 shadow-xs transition-transform duration-200 peer-checked:translate-x-4" />
      </div>
      <span className="text-xs text-texto1">{label}</span>
    </label>
  )
}
