import { NextResponse } from 'next/server';
import { getRoleStats } from '@/lib/store';

export async function GET() {
  try {
    const roleStats = getRoleStats();
    
    return NextResponse.json({ 
      success: true, 
      roleStats 
    });
  } catch (error) {
    console.error('Role stats error:', error);
    return NextResponse.json({ error: 'Failed to get role statistics' }, { status: 500 });
  }
}