'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Stock, SortField, SortDirection } from '@/types/stock'

interface ScreenerTableProps {
  stocks: Stock[]
  selectedStock: Stock | null
  onSelectStock: (stock: Stock) => void
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  selectedIndex: number
}

function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '-'
  if (Math.abs(value) >= 1e12) return (value / 1e12).toFixed(1) + 'T'
  if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + 'B'
  if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'M'
  return value.toFixed(decimals)
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '-'
  return (value * 100).toFixed(1)
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high'
  if (score >= 50) return 'score-mid'
  return 'score-low'
}

function getActionBadge(action: string): string {
  switch (action) {
    case 'BUY': return 'badge-buy'
    case 'HOLD': return 'badge-hold'
    case 'AVOID': return 'badge-avoid'
    default: return ''
  }
}

function getRiskLabel(altmanZ: number | null | undefined): { label: string; className: string } {
  if (altmanZ === null || altmanZ === undefined || isNaN(altmanZ)) return { label: '-', className: '' }
  if (altmanZ >= 3) return { label: 'LOW', className: 'text-bloomberg-green' }
  if (altmanZ >= 1.8) return { label: 'MED', className: 'text-bloomberg-yellow' }
  return { label: 'HIGH', className: 'text-bloomberg-red' }
}

function getTrendIcon(trend: string): { icon: string; className: string } {
  if (trend === 'ACCUMULATION') return { icon: 'ACC ↑', className: 'trend-up' }
  if (trend === 'DISTRIBUTION') return { icon: 'DIST ↓', className: 'trend-down' }
  return { icon: '-', className: '' }
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '-'
  return value.toLocaleString('id-ID')
}

function formatChange(change: number | null | undefined, previous: number | null | undefined): { text: string; pct: string; className: string } {
  if (change === null || change === undefined || isNaN(change)) return { text: '-', pct: '', className: '' }
  const pctChange = previous && previous > 0 ? (change / previous) * 100 : 0
  const sign = change > 0 ? '+' : ''
  const className = change > 0 ? 'text-bloomberg-green' : change < 0 ? 'text-bloomberg-red' : ''
  return {
    text: `${sign}${change.toLocaleString('id-ID')}`,
    pct: `(${sign}${pctChange.toFixed(1)}%)`,
    className
  }
}

// Column definitions: key, label, initial width, sortable, align
const columns = [
  { key: 'icon', label: '', width: 26, sortable: false, align: 'left' },
  { key: 'ticker', label: 'TICKER', width: 60, sortable: false, align: 'left' },
  { key: 'name', label: 'NAME', width: 469, sortable: false, align: 'left' },
  { key: 'sector', label: 'SECTOR', width: 200, sortable: false, align: 'right' },
  { key: 'sub_sector', label: 'SUBSEC', width: 355, sortable: false, align: 'right' },
  { key: 'group', label: 'GROUP', width: 239, sortable: false, align: 'right' },
  { key: 'price', label: 'PRICE', width: 75, sortable: false, align: 'right' },
  { key: 'change', label: 'CHG%', width: 75, sortable: false, align: 'right' },
  { key: 'market_cap', label: 'MCAP', width: 65, sortable: true, align: 'right' },
  { key: 'pbv', label: 'PBV', width: 55, sortable: true, align: 'right' },
  { key: 'pe_ttm', label: 'PE', width: 55, sortable: true, align: 'right' },
  { key: 'roe', label: 'ROE', width: 55, sortable: true, align: 'right' },
  { key: 'dividend_yield', label: 'DY%', width: 50, sortable: true, align: 'right' },
  { key: 'debt_to_equity', label: 'D/E', width: 50, sortable: false, align: 'right' },
  { key: 'free_float', label: 'FF%', width: 50, sortable: true, align: 'right' },
  { key: 'intrinsic_price', label: 'INTR', width: 65, sortable: false, align: 'right' },
  { key: 'score', label: 'SCR', width: 45, sortable: true, align: 'right' },
  { key: 'action', label: 'ACT', width: 55, sortable: false, align: 'right' },
  { key: 'trend', label: 'TREND', width: 65, sortable: false, align: 'right' },
]

export default function ScreenerTable({
  stocks,
  selectedStock,
  onSelectStock,
  sortField,
  sortDirection,
  onSort,
  selectedIndex,
}: ScreenerTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [columnWidths, setColumnWidths] = useState<number[]>(columns.map(c => c.width))
  const [resizing, setResizing] = useState<{ index: number; startX: number; startWidth: number } | null>(null)

  const virtualizer = useVirtualizer({
    count: stocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 20,
  })

  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < stocks.length) {
      virtualizer.scrollToIndex(selectedIndex, { align: 'auto' })
    }
  }, [selectedIndex, stocks.length, virtualizer])

  const sortableFields: SortField[] = ['score', 'pbv', 'pe_ttm', 'roe', 'fcf_ttm', 'market_cap', 'free_float', 'dividend_yield']

  const handleSort = (field: string) => {
    if (sortableFields.includes(field as SortField)) {
      onSort(field as SortField)
    }
  }

  const handleMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault()
    setResizing({ index, startX: e.clientX, startWidth: columnWidths[index] })
  }, [columnWidths])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return
    const diff = e.clientX - resizing.startX
    const newWidth = Math.max(30, resizing.startWidth + diff)
    setColumnWidths(prev => {
      const newWidths = [...prev]
      newWidths[resizing.index] = newWidth
      return newWidths
    })
  }, [resizing])

  const handleMouseUp = useCallback(() => {
    setResizing(null)
  }, [])

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [resizing, handleMouseMove, handleMouseUp])

  const gridTemplate = columnWidths.map(w => `${w}px`).join(' ')

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return <span className="text-bloomberg-orange ml-1">{sortDirection === 'desc' ? '▼' : '▲'}</span>
  }

  return (
    <div className="screener-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div
        className="table-header"
        style={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          height: 32,
          alignItems: 'center',
          padding: '0 10px',
          gap: 0,
          flexShrink: 0,
          fontSize: 12,
        }}
      >
        {columns.map((col, idx) => (
          <div
            key={col.key}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <span
              className={col.sortable ? 'cursor-pointer hover:text-bloomberg-orange' : ''}
              onClick={() => col.sortable && handleSort(col.key)}
            >
              {col.label}
              {col.sortable && <SortIcon field={col.key} />}
            </span>
            {idx < columns.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 6,
                  cursor: 'col-resize',
                  background: resizing?.index === idx ? '#FF6B00' : 'transparent',
                }}
                onMouseDown={(e) => handleMouseDown(idx, e)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FF6B0066')}
                onMouseLeave={(e) => (e.currentTarget.style.background = resizing?.index === idx ? '#FF6B00' : 'transparent')}
              />
            )}
          </div>
        ))}
      </div>

      {/* Scrollable Body */}
      <div
        ref={parentRef}
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const stock = stocks[virtualRow.index] as Stock & { price?: number; previous?: number; change?: number; icon_url?: string }
            const isSelected = selectedStock?.stock_code === stock.stock_code
            const trend = getTrendIcon(stock.shareholder_trend_latest)
            const priceChange = formatChange(stock.change, stock.previous)

            return (
              <div
                key={stock.stock_code}
                data-index={virtualRow.index}
                className={`table-row cursor-pointer ${isSelected ? 'selected' : ''}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: gridTemplate,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 32,
                  transform: `translateY(${virtualRow.start}px)`,
                  alignItems: 'center',
                  padding: '0 10px',
                  gap: 0,
                  fontSize: 13,
                }}
                onClick={() => onSelectStock(stock)}
              >
                {/* Icon */}
                <div style={{ width: 22, height: 22, borderRadius: 4, overflow: 'hidden', background: '#1E2530', flexShrink: 0 }}>
                  {stock.icon_url && <img src={stock.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div className="font-semibold text-bloomberg-orange" style={{ paddingLeft: 6, paddingRight: 8, whiteSpace: 'nowrap' }}>{stock.stock_code}</div>
                <div className="text-gray-400" style={{ paddingRight: 8, whiteSpace: 'nowrap', overflow: 'hidden' }}>{stock.name}</div>
                <div className="text-gray-500" style={{ width: '100%', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden' }}>{stock.sector}</div>
                <div className="text-gray-500" style={{ width: '100%', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden' }}>{stock.sub_sector}</div>
                <div className="text-bloomberg-blue" style={{ width: '100%', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden' }}>{stock.group || '-'}</div>
                <div className="font-medium" style={{ width: '100%', textAlign: 'right' }}>{formatPrice(stock.price)}</div>
                <div className={`font-medium ${priceChange.className}`} style={{ width: '100%', textAlign: 'right' }}>{priceChange.pct || '-'}</div>
                <div style={{ width: '100%', textAlign: 'right' }}>{formatNumber(stock.market_cap)}</div>
                <div style={{ width: '100%', textAlign: 'right' }}>{formatNumber(stock.pbv)}</div>
                <div style={{ width: '100%', textAlign: 'right' }}>{formatNumber(stock.pe_ttm, 1)}</div>
                <div className={stock.roe > 0.15 ? 'text-bloomberg-green' : ''} style={{ width: '100%', textAlign: 'right' }}>{formatPercent(stock.roe)}</div>
                <div className={stock.dividend_yield > 0.05 ? 'text-bloomberg-green' : ''} style={{ width: '100%', textAlign: 'right' }}>{formatPercent(stock.dividend_yield)}</div>
                <div className={stock.debt_to_equity > 1 ? 'text-bloomberg-red' : ''} style={{ width: '100%', textAlign: 'right' }}>{formatNumber(stock.debt_to_equity)}</div>
                <div className={stock.free_float < 0.2 ? 'warning-badge' : ''} style={{ width: '100%', textAlign: 'right' }}>{formatPercent(stock.free_float)}</div>
                <div className="text-bloomberg-yellow" style={{ width: '100%', textAlign: 'right' }}>{formatNumber(stock.intrinsic_price, 0)}</div>
                <div className={`font-bold ${getScoreClass(stock.score)}`} style={{ width: '100%', textAlign: 'right' }}>{stock.score ?? '-'}</div>
                <div style={{ width: '100%', textAlign: 'right' }}><span className={`badge ${getActionBadge(stock.action)}`}>{stock.action}</span></div>
                <div className={trend.className} style={{ width: '100%', textAlign: 'right' }}>{trend.icon}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {stocks.length === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="text-bloomberg-muted">
          <div className="text-center">
            <div className="text-lg mb-2">NO MATCHING STOCKS</div>
            <div className="text-sm">Relax filters</div>
          </div>
        </div>
      )}
    </div>
  )
}
