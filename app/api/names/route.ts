import { NextResponse } from 'next/server';
import { getAllParticipants, getStats } from '@/lib/store';

export async function GET() {
  try {
    const participants = getAllParticipants();
    const stats = getStats();
    
    console.log('Names API - Participants:', participants.length, 'Stats:', stats);
    
    return NextResponse.json({
      participants,
      stats
    });
  } catch (error) {
    console.error('Names error:', error);
    return NextResponse.json({ error: 'Failed to get participants' }, { status: 500 });
  }
}
