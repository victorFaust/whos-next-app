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

const historyPath = path.join(process.cwd(), 'public', 'teamHistory.json');

export async function GET() {
  try {
    // Select random participants
    const selected = pickRandomParticipants(3);
    const stats = getStats();

    // Handle no participants case
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

    // Call the /api/teams handler directly
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

    // Validate team data
    if (!teamResult.teamName || !teamResult.focusArea) {
      throw new Error('Invalid team data: Missing teamName or focusArea');
    }

    // Save to team history
    let history: TeamSelection[] = [];
    try {
      const fileContent = await fs.readFile(historyPath, 'utf-8');
      history = fileContent ? JSON.parse(fileContent) : [];
      if (!Array.isArray(history)) {
        console.warn('teamHistory.json is not an array, resetting to []');
        history = [];
      }
    } catch (error) {
      console.warn('Failed to read teamHistory.json, initializing as []:', error);
      await fs.writeFile(historyPath, JSON.stringify([]));
      history = [];
    }

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
      { error: `Failed to select participants: ${error}` },
      { status: 500 }
    );
  }
}