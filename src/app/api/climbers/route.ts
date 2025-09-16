import { createClient } from '@/lib/server'
import { getSupabaseSchema } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  let query = supabase.schema(getSupabaseSchema()).from('climbers').select('*')
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
    const { id, first_name, last_name, working_grade, ascents_of_next_grade } = body

    if (!id || !first_name || !last_name || !ascents_of_next_grade || working_grade === undefined) {
      console.log('❌ Missing required fields:', { id, first_name, last_name, ascents_of_next_grade, working_grade })
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: id, first_name, last_name, ascents_of_next_grade, and working_grade are required' 
      }, { status: 400 })
    }

    console.log('✅ Validation passed, inserting climber into database...')

    // Create the climber record
    const { data, error } = await supabase
      .schema(getSupabaseSchema())
      .from('climbers')
      .insert([{
        id,
        first_name,
        last_name,
        running_score: 0,
        working_grade,
        ascents_of_next_grade 
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
      .schema(getSupabaseSchema())
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ascents_of_next_grade, promotion_input_needed } = body

    if (!id || ascents_of_next_grade === undefined || promotion_input_needed === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: id, ascents_of_next_grade, and promotion_input_needed are required'
      }, { status: 400 })
    }

    // Update the climber's ascents_of_next_grade and promotion_input_needed
    const { data, error } = await supabase
      .schema(getSupabaseSchema())
      .from('climbers')
      .update({
        ascents_of_next_grade: ascents_of_next_grade,
        promotion_input_needed: promotion_input_needed
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating climber promotion data:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, climber: data[0] })
  } catch (error) {
    console.error('Error in PATCH /api/climbers:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
