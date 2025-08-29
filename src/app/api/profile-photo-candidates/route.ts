import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  let query = supabase.schema('boulder-league-dev').from('profile_photo_candidates').select('*')
  if (user_id) query = query.eq('user_id', user_id)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, candidates: data })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { user_id, image_url, submitted_by } = body
  const supabase = await createClient()

  if (!user_id || !image_url || !submitted_by) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .schema('boulder-league-dev')
    .from('profile_photo_candidates')
    .insert([{ user_id, image_url, submitted_by }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, candidates: data })
}