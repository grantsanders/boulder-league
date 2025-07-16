import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const voter_id = searchParams.get('voter_id')

  let query = supabase.schema('boulder-league').from('votes').select('*')
  if (voter_id) query = query.eq('voter_id', voter_id)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, votes: data })
} 