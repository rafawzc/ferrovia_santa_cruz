export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-componente1 text-texto1'
              : 'bg-componente3 text-texto1 hover:bg-componente3/80'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
