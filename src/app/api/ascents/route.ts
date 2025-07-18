import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const climber_uuid = searchParams.get('climber_uuid')

  let query = supabase.schema('boulder-league-dev').from('ascents').select('*')
  if (climber_uuid) query = query.eq('user_id', climber_uuid) // Use user_id instead of climber_uuid

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, ascents: data })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    const { name, absolute_grade, climber_uuid, working_grade_when_sent, is_flash, sent_date, create_date } = body

    if (!name || absolute_grade === undefined || !climber_uuid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, absolute_grade, and climber_uuid are required' 
      }, { status: 400 })
    }

    // Create the ascent record
    const { data, error } = await supabase
      .schema('boulder-league-dev')
      .from('ascents')
      .insert([{
        name,
        description: body.description || '',
        working_grade_when_sent: working_grade_when_sent || 0,
        absolute_grade,
        is_flash: is_flash || false,
        sent_date: sent_date || new Date().toISOString().split('T')[0],
        create_date: create_date || new Date().toISOString(),
        user_id: climber_uuid // Try user_id instead of climber_uuid
      }])
      .select()

    if (error) {
      console.error('Error inserting ascent:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, ascent: data[0] })
  } catch (error) {
    console.error('Error in POST /api/ascents:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}