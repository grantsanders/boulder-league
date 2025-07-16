import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const uuid = searchParams.get('uuid')

  let query = supabase.schema('boulder-league-dev').from('climbers').select('*')
  if (uuid) query = query.eq('id', uuid)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, climbers: data })
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { climber_uuid, new_score } = body

    if (!climber_uuid || new_score === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: climber_uuid and new_score are required' 
      }, { status: 400 })
    }

    // Update the climber's running score
    const { data, error } = await supabase
      .schema('boulder-league-dev')
      .from('climbers')
      .update({ running_score: new_score })
      .eq('id', climber_uuid)
      .select()

    if (error) {
      console.error('Error updating climber score:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, climber: data[0] })
  } catch (error) {
    console.error('Error in PUT /api/climbers:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 