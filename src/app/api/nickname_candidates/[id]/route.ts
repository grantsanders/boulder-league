import { createClient } from '@/lib/server'
import { getSupabaseSchema } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await context.params

  const { error } = await supabase
    .schema(getSupabaseSchema())
    .from('nickname_candidates')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}