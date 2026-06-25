export default function SeatIcon({ available = true, className = '' }) {
  return (
    <div
      className={`w-8 h-10 ${className}`}
      style={{
        clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
      }}
    />
  )
}
