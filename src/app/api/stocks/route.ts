import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get latest date
    const latestDoc = await db.collection('stockmaster')
      .find({})
      .sort({ date: -1 })
      .limit(1)
      .toArray()

    if (latestDoc.length === 0) {
      return NextResponse.json({ stocks: [], meta: { count: 0, date: null, sectors: [], tags: [] } })
    }

    const latestDate = latestDoc[0].date

    const stocks = await db.collection('stockmaster')
      .find({ date: latestDate }, { projection: { _id: 0 } })
      .toArray()

    const sectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))]
    const subSectors = [...new Set(stocks.map(s => s.sub_sector).filter(Boolean))]
    const tags = [...new Set(stocks.map(s => s.tag).filter(Boolean))]

    return NextResponse.json({
      stocks,
      meta: {
        count: stocks.length,
        date: latestDate,
        sectors: sectors.sort(),
        subSectors: subSectors.sort(),
        tags: tags.sort(),
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    )
  }
}
