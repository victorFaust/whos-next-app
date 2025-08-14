import { NextResponse } from 'next/server';
import { resetStore } from '@/lib/store';

export async function POST() {
  try {
    resetStore();
    return NextResponse.json({ success: true, message: 'List reset successfully' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Failed to reset list' }, { status: 500 });
  }
}
