import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define interfaces for type safety
interface Config {
  focusAreas: string[];
  teamNames: string[];
}

interface SelectionState {
  usedIndices: number[];
}

// Path to JSON config file
const configPath = path.join(process.cwd(), 'public', 'config.json');

// In-memory state to track used indices (persists during server runtime)
let state: SelectionState = { usedIndices: [] };

export async function GET() {
  try {
    // Read and parse the JSON config file
    const fileContent = await fs.readFile(configPath, 'utf-8');
    const config: Config = JSON.parse(fileContent);

    // Ensure both arrays have the same length
    if (config.focusAreas.length !== config.teamNames.length) {
      return NextResponse.json(
        { error: 'Focus areas and team names arrays must have the same length' },
        { status: 500 }
      );
    }

    // Get available indices (not yet used)
    const totalItems = config.focusAreas.length;
    const availableIndices = Array.from({ length: totalItems }, (_, i) => i).filter(
      (index) => !state.usedIndices.includes(index)
    );

    // Check if all items are exhausted
    if (availableIndices.length === 0) {
      return NextResponse.json(
        { error: 'All focus areas and team names have been used. No more pairs available.' },
        { status: 410 } // 410 Gone - resource no longer available
      );
    }

    // Select random index from available indices
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

    // Get the paired focus area and team name
    const selectedFocusArea = config.focusAreas[randomIndex];
    const selectedTeamName = config.teamNames[randomIndex];

    // Update used state
    state.usedIndices.push(randomIndex);

    return NextResponse.json(
      { focusArea: selectedFocusArea, teamName: selectedTeamName },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load configuration or generate selection' },
      { status: 500 }
    );
  }
}