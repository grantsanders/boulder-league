import { createClient } from '@/lib/server'
import { getSupabaseSchema } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const voter_id = searchParams.get('voter_id')

  let query = supabase.schema(getSupabaseSchema()).from('votes').select('*')
  if (voter_id) query = query.eq('voter_id', voter_id)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, votes: data })
} 


export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { table_type, table_id, ranks, voter_id } = body

  if (!table_type || !table_id || !ranks || !voter_id) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  // Remove previous votes for this voter/table_type/table_id
  await supabase
    .schema(getSupabaseSchema())
    .from('votes')
    .delete()
    .eq('voter_id', voter_id)
    .eq('table_type', table_type)
    .in('table_id', table_id)

  // Insert new votes
  const insertPayload = ranks.map((r: { id: string, rank: number }) => ({
    table_type,
    table_id: r.id,
    ranks: r.rank,
    voter_id,
  }))

  const { data, error } = await supabase
    .schema(getSupabaseSchema())
    .from('votes')
    .insert(insertPayload)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, votes: data })
}