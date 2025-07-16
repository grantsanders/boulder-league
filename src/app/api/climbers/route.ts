import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const uuid = searchParams.get('uuid')

  let query = supabase.schema('boulder-league').from('climbers').select('*')
  if (uuid) query = query.eq('uuid', uuid)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, climbers: data })
} 