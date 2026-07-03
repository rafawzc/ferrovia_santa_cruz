export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
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
