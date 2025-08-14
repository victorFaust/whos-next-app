import { NextRequest, NextResponse } from 'next/server';
import { getAllParticipants, removeParticipant, toggleParticipantExclusion } from '@/lib/store';

export async function GET() {
  try {
    const participants = getAllParticipants();
    
    return NextResponse.json({ 
      success: true, 
      participants 
    });
  } catch (error) {
    console.error('Get participants error:', error);
    return NextResponse.json({ error: 'Failed to get participants' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!id || !action) {
      return NextResponse.json({ error: 'Participant ID and action are required' }, { status: 400 });
    }
    
    const participantId = parseInt(id);
    if (isNaN(participantId)) {
      return NextResponse.json({ error: 'Invalid participant ID' }, { status: 400 });
    }
    
    if (action === 'toggleExclusion') {
      const success = toggleParticipantExclusion(participantId);
      
      if (!success) {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Participant exclusion status updated' 
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update participant error:', error);
    return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
    }
    
    const participantId = parseInt(id);
    if (isNaN(participantId)) {
      return NextResponse.json({ error: 'Invalid participant ID' }, { status: 400 });
    }
    
    const success = removeParticipant(participantId);
    
    if (!success) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Participant deleted successfully' 
    });
  } catch (error) {
    console.error('Delete participant error:', error);
    return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 });
  }
}