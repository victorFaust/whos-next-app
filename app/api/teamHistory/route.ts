import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface TeamSelection {
  teamName: string;
  focusArea: string;
  participants: { id: number; email: string; name: string }[];
  timestamp: string;
}

// Path to team history JSON file
const historyPath = path.join('/tmp', 'teamHistory.json');

export async function GET() {
  try {
    // Read team history
    let history: TeamSelection[] = [];
    try {
      const fileContent = await fs.readFile(historyPath, 'utf-8');
      history = JSON.parse(fileContent);
    } catch (error) {
      // If file doesn't exist, initialize it
      await fs.writeFile(historyPath, JSON.stringify([]));
    }

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load team history' },
      { status: 500 }
    );
  }
}