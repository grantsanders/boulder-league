import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get all ascents with climber information
    const { data, error } = await supabase
      .schema('boulder-league-dev')
      .from('ascents')
      .select(`
        *,
        climbers!inner(
          id,
          first_name,
          last_name,
          nickname,
          working_grade,
          ascents_of_next_grade,
          profile_photo_url
        )
      `)
      .order('create_date', { ascending: false })

    if (error) {
      console.error('Error fetching all ascents:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Transform the data to include climber_id for easier use
    const transformedData = data?.map(ascent => ({
      ...ascent,
      climber_id: ascent.user_id, // Map user_id to climber_id for consistency
      climber: ascent.climbers
    })) || []

    return NextResponse.json({ success: true, ascents: transformedData })
  } catch (error) {
    console.error('Error in GET /api/ascents/all:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
