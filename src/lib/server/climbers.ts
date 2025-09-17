import { createClient } from '../client';
import { Climber } from '../interfaces/user-info';
import type { Ascent } from '../interfaces/scoring';

export async function getClimberProfile(userId: string): Promise<Climber | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('climbers')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as Climber;
}

export async function getClimberLogbook(userId: string): Promise<Ascent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ascents')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) return [];
  return (data as Ascent[]) || [];
}
