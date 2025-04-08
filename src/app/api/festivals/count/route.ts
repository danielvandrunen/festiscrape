import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('festivals')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'partyflock');

    if (error) {
      console.error('Error getting festival count:', error);
      return NextResponse.json({ error: 'Failed to get festival count' }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Error getting festival count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 