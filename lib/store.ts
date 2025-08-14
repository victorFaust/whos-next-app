// In-memory store for participants with better persistence
export interface Participant {
  id: number;
  email: string;
  name: string;
  role: string;
  picked: boolean;
  excluded: boolean;
}

let nameBank: Participant[] = [];
let nextId = 1;
let initialized = false;

// Add initialization logging
console.log('Store module loaded/reloaded at:', new Date().toISOString());

// Use global object for persistence across hot reloads in development
declare global {
  var __participantsStore: {
    participants: Participant[];
    nextId: number;
  } | undefined;
}

function initializeStore() {
  if (!initialized) {
    // Try to load from global store first (survives hot reloads)
    if (global.__participantsStore) {
      nameBank = global.__participantsStore.participants;
      nextId = global.__participantsStore.nextId;
      console.log('Store: Initialized with', nameBank.length, 'participants from global store');
    } else {
      console.log('Store: Initialized with empty store');
    }
    initialized = true;
  }
}

function saveToGlobalStore() {
  global.__participantsStore = {
    participants: [...nameBank],
    nextId: nextId
  };
}

export function formatEmailToName(email: string): string {
  const [localPart] = email.split('@');
  const [first, last] = localPart.split('.');
  
  const capitalize = (str: string) => 
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  
  return `${capitalize(first || '')} ${capitalize(last || '')}`.trim();
}

export function addParticipants(participants: { email: string; role: string }[]) {
  initializeStore();
  console.log('Store: Adding participants at:', new Date().toISOString(), 'Count:', participants.length);
  nameBank = participants.map(participant => ({
    id: nextId++,
    email: participant.email.trim(),
    name: formatEmailToName(participant.email.trim()),
    role: participant.role.trim(),
    picked: false,
    excluded: false
  }));
  console.log('Store: Name bank now has', nameBank.length, 'participants');
  
  // Save to global store for persistence
  saveToGlobalStore();
}

export function getUnpickedParticipants(): Participant[] {
  initializeStore();
  return nameBank.filter(p => !p.picked && !p.excluded);
}

export function getAllParticipants(): Participant[] {
  initializeStore();
  console.log('Store: Getting all participants at:', new Date().toISOString(), 'count:', nameBank.length);
  return [...nameBank];
}

export function pickRandomParticipants(count: number = 3): Participant[] {
  initializeStore();
  const unpicked = getUnpickedParticipants();
  
  if (unpicked.length === 0) return [];
  
  const selected: Participant[] = [];
  const availableIndices = [...Array(unpicked.length).keys()];
  
  for (let i = 0; i < Math.min(count, unpicked.length); i++) {
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const participantIndex = availableIndices.splice(randomIndex, 1)[0];
    const participant = unpicked[participantIndex];
    
    // Mark as picked
    participant.picked = true;
    selected.push(participant);
  }
  
  // Save updated state to global store
  saveToGlobalStore();
  
  return selected;
}

export function toggleParticipantExclusion(id: number): boolean {
  initializeStore();
  const participant = nameBank.find(p => p.id === id);
  
  if (!participant) {
    return false;
  }
  
  participant.excluded = !participant.excluded;
  console.log('Store: Toggled exclusion for participant:', participant.name, 'Excluded:', participant.excluded);
  
  // Save updated state to global store
  saveToGlobalStore();
  
  return true;
}

export function removeParticipant(id: number): boolean {
  initializeStore();
  const index = nameBank.findIndex(p => p.id === id);
  
  if (index === -1) {
    return false;
  }
  
  nameBank.splice(index, 1);
  console.log('Store: Removed participant with id:', id, 'Remaining count:', nameBank.length);
  
  // Save updated state to global store
  saveToGlobalStore();
  
  return true;
}

export function resetStore() {
  console.log('Store: Resetting store at:', new Date().toISOString());
  nameBank = [];
  nextId = 1;
  
  // Clear global store
  global.__participantsStore = undefined;
}

export function getStats() {
  initializeStore();
  const stats = {
    total: nameBank.length,
    picked: nameBank.filter(p => p.picked).length,
    remaining: nameBank.filter(p => !p.picked && !p.excluded).length,
    excluded: nameBank.filter(p => p.excluded).length
  };
  console.log('Store: Stats at:', new Date().toISOString(), stats);
  return stats;
}

// Get role distribution for statistics
export function getRoleStats() {
  initializeStore();
  const roles = nameBank.reduce((acc, participant) => {
    acc[participant.role] = (acc[participant.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return roles;
}