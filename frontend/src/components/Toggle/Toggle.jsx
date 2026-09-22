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
        <div className="h-6 w-10 rounded-full border border-border bg-foreground/20 transition-colors duration-200 peer-checked:border-transparent peer-checked:bg-primary" />
        <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow-xs transition-transform duration-200 peer-checked:translate-x-4" />
      </div>
      <span className="text-xs text-foreground">{label}</span>
    </label>
  )
}
