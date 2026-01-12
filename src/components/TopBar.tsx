'use client'

import { FilterState } from '@/types/stock'

interface TopBarProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  sectors: string[]
  subSectors: string[]
  currentDate: string
  stockCount: number
  filteredCount: number
}

const PRESETS = [
  { id: 'strong-buy', label: 'Strong Buy', desc: 'score ≥ 80' },
  { id: 'value', label: 'Value', desc: 'PBV < Fair' },
  { id: 'income', label: 'Income', desc: 'Div > 5%' },
  { id: 'low-risk', label: 'Low Risk', desc: 'Z > 3' },
  { id: 'controlled', label: 'Controlled', desc: 'Top3 > 75%' },
  { id: 'illiquid', label: 'Illiquid', desc: 'FF < 15%' },
]

export default function TopBar({
  filters,
  onFilterChange,
  sectors,
  subSectors,
  currentDate,
  stockCount,
  filteredCount,
}: TopBarProps) {
  return (
    <div className="top-bar flex items-center px-4 gap-3">
      {/* Date Display */}
      <div className="text-bloomberg-orange font-semibold text-sm">
        {currentDate}
      </div>

      <div className="h-4 w-px bg-terminal-border" />

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        style={{ width: 120 }}
        value={filters.search}
        onChange={(e) => onFilterChange({ search: e.target.value })}
      />

      {/* Sector Filter */}
      <select
        value={filters.sectors[0] || ''}
        onChange={(e) => onFilterChange({ sectors: e.target.value ? [e.target.value] : [], subSectors: [] })}
        style={{ width: 120 }}
      >
        <option value="">All Sectors</option>
        {sectors.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Sub Sector Filter */}
      <select
        value={filters.subSectors[0] || ''}
        onChange={(e) => onFilterChange({ subSectors: e.target.value ? [e.target.value] : [] })}
        style={{ width: 150 }}
      >
        <option value="">All Sub Sectors</option>
        {subSectors.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Action Filter */}
      <div className="flex items-center gap-1">
        {['BUY', 'HOLD', 'AVOID'].map((action) => (
          <button
            key={action}
            className={`preset-btn ${filters.actions.includes(action) ? 'active' : ''}`}
            onClick={() => {
              const newActions = filters.actions.includes(action)
                ? filters.actions.filter((a) => a !== action)
                : [...filters.actions, action]
              onFilterChange({ actions: newActions })
            }}
          >
            {action}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-terminal-border" />

      {/* Presets */}
      <div className="flex items-center gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`preset-btn ${filters.preset === preset.id ? 'active' : ''}`}
            onClick={() => onFilterChange({ preset: filters.preset === preset.id ? null : preset.id })}
            title={preset.desc}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="ml-auto text-bloomberg-muted text-xs">
        <span className="text-bloomberg-orange font-semibold">{filteredCount}</span>
        <span> / {stockCount}</span>
      </div>

      {/* Clear */}
      {(filters.search || filters.sectors.length || filters.subSectors.length || filters.actions.length || filters.preset) && (
        <button
          className="text-xs text-bloomberg-muted hover:text-bloomberg-orange"
          onClick={() => onFilterChange({ search: '', sectors: [], subSectors: [], actions: [], tags: [], preset: null })}
        >
          Clear
        </button>
      )}
    </div>
  )
}
