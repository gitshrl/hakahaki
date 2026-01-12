'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import TopBar from '@/components/TopBar'
import ScreenerTable from '@/components/ScreenerTable'
import StockDetail from '@/components/StockDetail'
import { Stock, FilterState, SortField, SortDirection } from '@/types/stock'

const initialFilters: FilterState = {
  search: '',
  sectors: [],
  subSectors: [],
  tags: [],
  actions: [],
  scoreRange: [0, 100],
  preset: null,
}

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [meta, setMeta] = useState<{ sectors: string[]; subSectors: string[]; tags: string[] }>({
    sectors: [],
    subSectors: [],
    tags: [],
  })

  // Fetch stocks
  const fetchStocks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stocks')
      if (!res.ok) throw new Error('Failed to fetch stocks')
      const data = await res.json()
      setStocks(data.stocks || [])
      setMeta({
        sectors: data.meta?.sectors || [],
        subSectors: data.meta?.subSectors || [],
        tags: data.meta?.tags || [],
      })
      setCurrentDate(data.meta?.date || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  // Filter and sort stocks
  const filteredStocks = useMemo(() => {
    let result = [...stocks]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(
        (s) =>
          s.stock_code.toLowerCase().includes(search) ||
          s.name?.toLowerCase().includes(search)
      )
    }

    // Sector filter
    if (filters.sectors.length > 0) {
      result = result.filter((s) => filters.sectors.includes(s.sector))
    }

    // Sub Sector filter
    if (filters.subSectors.length > 0) {
      result = result.filter((s) => filters.subSectors.includes(s.sub_sector))
    }

    // Action filter
    if (filters.actions.length > 0) {
      result = result.filter((s) => filters.actions.includes(s.action))
    }

    // Preset filters
    if (filters.preset) {
      switch (filters.preset) {
        case 'strong-buy':
          result = result.filter((s) => s.score >= 80)
          break
        case 'value':
          result = result.filter((s) => s.pbv < s.fair_pbv)
          break
        case 'income':
          result = result.filter((s) => s.dividend_yield > 0.05)
          break
        case 'low-risk':
          result = result.filter((s) => s.altman_z > 3)
          break
        case 'controlled':
          result = result.filter((s) => s.shareholder_top3_pct > 0.75)
          break
        case 'illiquid':
          result = result.filter((s) => s.free_float < 0.15)
          break
      }
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField] ?? 0
        const bVal = b[sortField] ?? 0
        if (sortDirection === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      })
    }

    return result
  }, [stocks, filters, sortField, sortDirection])

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setSelectedIndex(0)
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Pass to table - convert null to undefined for compatibility
  const tableSortField = sortField || undefined

  // Handle stock selection
  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock)
    const idx = filteredStocks.findIndex((s) => s.stock_code === stock.stock_code)
    if (idx >= 0) setSelectedIndex(idx)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur()
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => {
            const newIdx = Math.min(prev + 1, filteredStocks.length - 1)
            setSelectedStock(filteredStocks[newIdx] || null)
            return newIdx
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => {
            const newIdx = Math.max(prev - 1, 0)
            setSelectedStock(filteredStocks[newIdx] || null)
            return newIdx
          })
          break
        case 'Enter':
          if (filteredStocks[selectedIndex]) {
            setSelectedStock(filteredStocks[selectedIndex])
          }
          break
        case 'Escape':
          setFilters(initialFilters)
          break
        case 'f':
        case 'F':
          e.preventDefault()
          document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredStocks, selectedIndex])

  // Select first stock when filtered stocks change
  useEffect(() => {
    if (filteredStocks.length > 0 && !selectedStock) {
      setSelectedStock(filteredStocks[0])
      setSelectedIndex(0)
    }
  }, [filteredStocks, selectedStock])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-terminal-bg">
        <div className="text-bloomberg-orange text-lg">LOADING...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-terminal-bg">
        <div className="text-center">
          <div className="text-bloomberg-red text-lg mb-2">ERROR</div>
          <div className="text-bloomberg-muted">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="terminal-grid">
      <TopBar
        filters={filters}
        onFilterChange={handleFilterChange}
        sectors={meta.sectors}
        subSectors={meta.subSectors}
        currentDate={currentDate}
        stockCount={stocks.length}
        filteredCount={filteredStocks.length}
      />
      <ScreenerTable
        stocks={filteredStocks}
        selectedStock={selectedStock}
        onSelectStock={handleSelectStock}
        sortField={sortField as SortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        selectedIndex={selectedIndex}
      />
      <StockDetail stock={selectedStock} />
    </div>
  )
}
