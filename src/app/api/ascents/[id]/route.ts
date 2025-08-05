import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing ascent id' }, { status: 400 })
  }

  const { error } = await supabase
    .schema('boulder-league-dev')
    .from('ascents')
    .delete()
    .eq('id', id)

  if (error) {
    console.log(error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
} 