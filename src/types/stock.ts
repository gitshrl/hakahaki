export interface Shareholder {
  name: string
  percentage: number
  value: string
  badges: string[]
  id: string
}

export interface ShareholderTrend {
  shareholder_date: string
  total_share: number
  change: number
  change_formatted: string
}

export interface Broker {
  broker_id?: string
  broker_name: string
  type?: string
}

export interface Stock {
  _id?: string
  date: string
  stock_code: string
  name: string
  sector: string
  sub_sector: string
  indexes: string[]
  price?: number
  previous?: number
  change?: number
  icon_url?: string
  corp_action_active: boolean
  trading_limit: boolean
  margin_trading: boolean
  tradeable: number
  ipo_amount: number | null
  ipo_board: string
  ipo_date: string
  ipo_price: number
  ipo_registrar: string
  ipo_shares: number
  ipo_underwriters: Broker[]
  ipo_administrative_bureau: string
  ipo_free_float: number
  shareholder_top1_pct: number
  shareholder_top3_pct: number
  has_controlling_shareholder: boolean
  shareholder_count: number
  shareholders: Shareholder[]
  shareholder_trends: ShareholderTrend[]
  shareholder_trend_latest: string
  market_cap: number
  free_float: number
  pe_ttm: number
  pbv: number
  ps: number
  ev_ebitda: number
  earnings_yield: number
  roe: number
  roa: number
  roic: number
  net_margin: number
  operating_margin: number
  fcf_ttm: number
  fcf_per_share: number
  operating_cashflow: number
  revenue_yoy: number
  net_income_yoy: number
  debt_to_equity: number
  interest_coverage: number
  current_ratio: number
  quick_ratio: number
  altman_z: number
  book_value_per_share: number
  eps_ttm: number
  dividend_yield: number
  payout_ratio: number
  fair_pbv: number
  intrinsic_price: number
  action: 'BUY' | 'HOLD' | 'AVOID'
  score: number
  tag: string
  group: string
}

export type SortField = 'score' | 'pbv' | 'pe_ttm' | 'roe' | 'fcf_ttm' | 'market_cap' | 'free_float' | 'dividend_yield'
export type SortDirection = 'asc' | 'desc'

export interface FilterState {
  search: string
  sectors: string[]
  subSectors: string[]
  tags: string[]
  actions: string[]
  scoreRange: [number, number]
  preset: string | null
}
