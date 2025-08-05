import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  let query = supabase.schema('boulder-league-dev').from('climbers').select('*')
  if (id) query = query.eq('id', id)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, climbers: data })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏔️ Creating climber record via API...')
    const supabase = await createClient()
    const body = await request.json()

    console.log('📝 Received climber data:', body)

    // Validate required fields
    const { id, first_name, last_name, working_grade } = body

    if (!id || !first_name || !last_name || working_grade === undefined) {
      console.log('❌ Missing required fields:', { id, first_name, last_name, working_grade })
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: id, first_name, last_name, and working_grade are required' 
      }, { status: 400 })
    }

    console.log('✅ Validation passed, inserting climber into database...')

    // Create the climber record
    const { data, error } = await supabase
      .schema('boulder-league-dev')
      .from('climbers')
      .insert([{
        id,
        first_name,
        last_name,
        running_score: 0,
        working_grade,
        ascents_of_next_grade: 0
      }])
      .select()

    if (error) {
      console.error('❌ Database error inserting climber:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('✅ Climber created successfully:', data[0])
    return NextResponse.json({ success: true, climber: data[0] })
  } catch (error) {
    console.error('❌ Unexpected error in POST /api/climbers:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { climber_id, new_score } = body

    if (!climber_id || new_score === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: climber_id and new_score are required' 
      }, { status: 400 })
    }

    // Update the climber's running score
    const { data, error } = await supabase
      .schema('boulder-league-dev')
      .from('climbers')
      .update({ running_score: new_score })
      .eq('id', climber_id)
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