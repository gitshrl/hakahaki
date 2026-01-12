'use client'

import { Stock } from '@/types/stock'

interface StockDetailProps {
  stock: Stock | null
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
  return (value * 100).toFixed(2) + '%'
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '-'
  return 'Rp ' + value.toLocaleString('id-ID')
}

function MetricRow({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-terminal-border">
      <span className="text-bloomberg-muted">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="section-header">{title}</div>
      <div className="p-3">{children}</div>
    </div>
  )
}

export default function StockDetail({ stock }: StockDetailProps) {
  if (!stock) {
    return (
      <div className="detail-panel flex items-center justify-center h-full">
        <div className="text-center text-bloomberg-muted">
          <div className="text-lg mb-2">SELECT A STOCK</div>
          <div className="text-sm">Use ↑↓ keys or click a row</div>
        </div>
      </div>
    )
  }

  const scoreClass = stock.score >= 80 ? 'text-bloomberg-green' : stock.score >= 50 ? 'text-bloomberg-yellow' : 'text-bloomberg-red'
  const actionClass = stock.action === 'BUY' ? 'badge-buy' : stock.action === 'HOLD' ? 'badge-hold' : 'badge-avoid'

  return (
    <div className="detail-panel">
      {/* Header */}
      <div className="p-4 border-b border-terminal-border bg-terminal-header">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-bloomberg-orange">{stock.stock_code}</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${scoreClass}`}>{stock.score}</span>
            <span className={`badge ${actionClass}`}>{stock.action}</span>
          </div>
        </div>
        <div className="text-sm text-bloomberg-muted truncate">{stock.name}</div>
        <div className="flex gap-2 mt-2 text-xs">
          <span className="text-bloomberg-muted">{stock.sector}</span>
          <span className="text-terminal-border">|</span>
          <span className="text-bloomberg-muted">{stock.sub_sector}</span>
        </div>

        {/* Warning Badges */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {stock.free_float < 0.2 && (
            <span className="text-xs px-2 py-1 bg-yellow-900/30 text-bloomberg-yellow">⚠ LOW FF ({formatPercent(stock.free_float)})</span>
          )}
          {stock.has_controlling_shareholder && (
            <span className="text-xs px-2 py-1 bg-blue-900/30 text-bloomberg-blue">🧱 CTRL</span>
          )}
          {stock.fcf_ttm > 0 && (
            <span className="text-xs px-2 py-1 bg-green-900/30 text-bloomberg-green">💰 CASH</span>
          )}
          {stock.altman_z < 2 && (
            <span className="text-xs px-2 py-1 bg-red-900/30 text-bloomberg-red">❌ RISK</span>
          )}
        </div>
      </div>

      {/* Overview */}
      <Section title="Overview">
        <MetricRow label="Market Cap" value={formatNumber(stock.market_cap)} />
        <MetricRow label="Free Float" value={formatPercent(stock.free_float)} valueClass={stock.free_float < 0.2 ? 'text-bloomberg-yellow' : ''} />
        <MetricRow label="IPO Date" value={stock.ipo_date || '-'} />
        <MetricRow label="IPO Price" value={formatCurrency(stock.ipo_price)} />
        <MetricRow label="IPO Board" value={stock.ipo_board || '-'} />
        {stock.group && <MetricRow label="Group" value={stock.group} />}
      </Section>

      {/* Valuation */}
      <Section title="Valuation">
        <MetricRow label="P/E (TTM)" value={formatNumber(stock.pe_ttm, 1)} />
        <MetricRow label="P/BV" value={formatNumber(stock.pbv)} valueClass={stock.pbv < stock.fair_pbv ? 'text-bloomberg-green' : ''} />
        <MetricRow label="Fair P/BV" value={formatNumber(stock.fair_pbv)} />
        <MetricRow label="P/S" value={formatNumber(stock.ps)} />
        <MetricRow label="EV/EBITDA" value={formatNumber(stock.ev_ebitda, 1)} />
        <MetricRow label="Earnings Yield" value={formatPercent(stock.earnings_yield)} />
        <MetricRow label="Intrinsic Price" value={formatCurrency(stock.intrinsic_price)} valueClass="text-bloomberg-blue" />
      </Section>

      {/* Quality */}
      <Section title="Quality">
        <MetricRow label="ROE" value={formatPercent(stock.roe)} valueClass={stock.roe > 0.15 ? 'text-bloomberg-green' : ''} />
        <MetricRow label="ROA" value={formatPercent(stock.roa)} />
        <MetricRow label="ROIC" value={formatPercent(stock.roic)} />
        <MetricRow label="Net Margin" value={formatPercent(stock.net_margin)} />
        <MetricRow label="Operating Margin" value={formatPercent(stock.operating_margin)} />
        <MetricRow label="EPS (TTM)" value={formatCurrency(stock.eps_ttm)} />
        <MetricRow label="Book Value/Share" value={formatCurrency(stock.book_value_per_share)} />
      </Section>

      {/* Cash Flow */}
      <Section title="Cash Flow">
        <MetricRow label="FCF (TTM)" value={formatNumber(stock.fcf_ttm)} valueClass={stock.fcf_ttm > 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'} />
        <MetricRow label="FCF/Share" value={formatCurrency(stock.fcf_per_share)} />
        <MetricRow label="Operating CF" value={formatNumber(stock.operating_cashflow)} />
      </Section>

      {/* Growth */}
      <Section title="Growth">
        <MetricRow label="Revenue YoY" value={formatPercent(stock.revenue_yoy)} valueClass={stock.revenue_yoy > 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'} />
        <MetricRow label="Net Income YoY" value={formatPercent(stock.net_income_yoy)} valueClass={stock.net_income_yoy > 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'} />
      </Section>

      {/* Risk */}
      <Section title="Risk">
        <MetricRow label="Debt/Equity" value={formatNumber(stock.debt_to_equity)} valueClass={stock.debt_to_equity > 1 ? 'text-bloomberg-red' : ''} />
        <MetricRow label="Interest Coverage" value={formatNumber(stock.interest_coverage, 1)} />
        <MetricRow label="Current Ratio" value={formatNumber(stock.current_ratio)} />
        <MetricRow label="Quick Ratio" value={formatNumber(stock.quick_ratio)} />
        <MetricRow
          label="Altman Z-Score"
          value={formatNumber(stock.altman_z, 1)}
          valueClass={stock.altman_z >= 3 ? 'text-bloomberg-green' : stock.altman_z >= 1.8 ? 'text-bloomberg-yellow' : 'text-bloomberg-red'}
        />
      </Section>

      {/* Dividend */}
      <Section title="Dividend">
        <MetricRow label="Dividend Yield" value={formatPercent(stock.dividend_yield)} valueClass={stock.dividend_yield > 0.05 ? 'text-bloomberg-green' : ''} />
        <MetricRow label="Payout Ratio" value={formatPercent(stock.payout_ratio)} />
      </Section>

      {/* Ownership */}
      <Section title="Ownership">
        <MetricRow label="Top 1 Holder" value={formatPercent(stock.shareholder_top1_pct)} />
        <MetricRow label="Top 3 Holders" value={formatPercent(stock.shareholder_top3_pct)} valueClass={stock.shareholder_top3_pct > 0.75 ? 'text-bloomberg-yellow' : ''} />
        <MetricRow label="Shareholder Count" value={stock.shareholder_count?.toString() || '-'} />
        <MetricRow
          label="Trend"
          value={stock.shareholder_trend_latest || '-'}
          valueClass={stock.shareholder_trend_latest === 'ACCUMULATION' ? 'text-bloomberg-green' : stock.shareholder_trend_latest === 'DISTRIBUTION' ? 'text-bloomberg-red' : ''}
        />

        {/* Top Shareholders */}
        {stock.shareholders && stock.shareholders.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-bloomberg-muted mb-2">TOP SHAREHOLDERS</div>
            {stock.shareholders.slice(0, 5).map((sh, i) => (
              <div key={i} className="flex justify-between py-1 text-xs border-b border-terminal-border">
                <span className="mr-2">{sh.name}</span>
                <span>{formatPercent(sh.percentage)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Indexes */}
      <Section title="Indexes">
        <div className="flex flex-wrap gap-1">
          {stock.indexes?.map((idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-terminal-header border border-terminal-border">
              {idx}
            </span>
          ))}
        </div>
      </Section>

      {/* IPO Underwriters */}
      {stock.ipo_underwriters && stock.ipo_underwriters.length > 0 && (
        <Section title="IPO Underwriters">
          {stock.ipo_underwriters.map((uw, i) => (
            <div key={i} className="flex justify-between py-1 text-xs border-b border-terminal-border">
              <span>{uw.broker_name}</span>
              <span className="text-bloomberg-muted">{uw.broker_id || ''}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}
