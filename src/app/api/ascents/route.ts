import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const climber_uuid = searchParams.get('climber_uuid')

  let query = supabase.schema('boulder-league').from('ascents').select('*')
  if (climber_uuid) query = query.eq('climber_uuid', climber_uuid)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, ascents: data })
} 