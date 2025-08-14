import { NextResponse } from 'next/server';
import { pickRandomParticipants, getStats } from '@/lib/store';
import fs from 'fs/promises';
import path from 'path';
import { GET as getTeams } from '../teams/route';

interface TeamSelection {
  teamName: string;
  focusArea: string;
  participants: { id: number; email: string; name: string }[];
  timestamp: string;
}

// Writable location on Vercel
const historyPath = path.join('/tmp', 'teamHistory.json');

export async function GET() {
  try {
    // Select random participants
    const selected = pickRandomParticipants(3);
    const stats = getStats();

    if (selected.length === 0) {
      return NextResponse.json(
        {
          selected: [],
          stats,
          hasMore: stats.remaining > 0,
          error: 'No participants available. Please upload a participant list.',
        },
        { status: 200 }
      );
    }

    // Get team data
    const teamResponse = await getTeams();
    let teamResult;
    try {
      teamResult = await teamResponse.json();
    } catch (jsonError) {
      throw new Error(`Invalid JSON response from /api/teams: ${jsonError}`);
    }

    if (!teamResponse.ok) {
      throw new Error(`Failed to fetch team data: ${teamResult.error || 'Unknown error'}`);
    }

    if (!teamResult.teamName || !teamResult.focusArea) {
      throw new Error('Invalid team data: Missing teamName or focusArea');
    }

    // Read history from /tmp/ (if exists)
    let history: TeamSelection[] = [];
    try {
      const fileContent = await fs.readFile(historyPath, 'utf-8');
      history = fileContent ? JSON.parse(fileContent) : [];
      if (!Array.isArray(history)) {
        console.warn('teamHistory.json is not an array, resetting to []');
        history = [];
      }
    } catch {
      // If file doesn't exist, create it
      await fs.writeFile(historyPath, JSON.stringify([]));
      history = [];
    }

    // Append new record
    history.push({
      teamName: teamResult.teamName,
      focusArea: teamResult.focusArea,
      participants: selected.map(({ id, email, name }) => ({ id, email, name })),
      timestamp: new Date().toISOString(),
    });

    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));

    return NextResponse.json({
      selected,
      stats,
      hasMore: stats.remaining > 0,
    });
  } catch (error) {
    console.error('Play error:', error);
    return NextResponse.json(
      { error: `Failed to select users: ${error}` },
      { status: 500 }
    );
  }
}
