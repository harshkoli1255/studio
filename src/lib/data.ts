// In-memory data store with file persistence
import type { Candidate, User, Vote } from '@/lib/types';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src', 'lib', 'data.json');

interface AppData {
  users: User[];
  candidates: Candidate[];
  votes: Vote[];
}

let data: AppData = {
  users: [],
  candidates: [],
  votes: [],
};

function loadData(): void {
  try {
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      data = JSON.parse(fileContent);
    } else {
      saveData();
    }
  } catch (error) {
    console.error('Error loading data:', error);
    saveData(); // Create the file if it's corrupted or unreadable
  }
}

function saveData(): void {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Load data on initial startup
loadData();


function generateUniqueCode() {
  let code: string;
  let isUnique = false;
  while(!isUnique) {
    code = randomBytes(4).toString('hex').toUpperCase();
    if(!data.users.find(u => u.code === code)) {
      isUnique = true;
    }
  }
  return code!;
}

function generateUniqueId() {
    let id: string;
    let isUnique = false;
    while(!isUnique) {
      id = randomBytes(16).toString('hex');
      if(!data.users.find(u => u.id === id)) {
        isUnique = true;
      }
    }
    return id!;
}


export const db = {
  getUserByNameAndCode: (name: string, code: string) => {
    return data.users.find((user) => user.name.toLowerCase() === name.toLowerCase() && user.code.toLowerCase() === code.toLowerCase());
  },

  getUserById: (id: string) => {
    return data.users.find((user) => user.id === id);
  },
  
  getUsers: () => [...data.users].sort((a,b) => a.name.localeCompare(b.name)),

  addVoter: (name: string) => {
    if (data.users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('A voter with this name already exists.');
    }
    const newUser: User = {
        id: generateUniqueId(),
        name,
        code: generateUniqueCode(),
        hasVoted: false,
    }
    data.users.push(newUser);
    saveData();
    return newUser;
  },

  deleteVoter: (id: string) => {
    const userIndex = data.users.findIndex(u => u.id === id);
    if(userIndex === -1) {
        throw new Error('Voter not found.');
    }
    data.users.splice(userIndex, 1);
    saveData();
  },

  getCandidates: () => {
    return [...data.candidates].sort((a,b) => a.id - b.id);
  },

  addCandidate: (candidateData: Omit<Candidate, 'id' | 'voteCount'>) => {
    const newId = data.candidates.length > 0 ? Math.max(...data.candidates.map(c => c.id)) + 1 : 1;
    const newCandidate: Candidate = { ...candidateData, id: newId, voteCount: 0 };
    data.candidates.push(newCandidate);
    saveData();
    return newCandidate;
  },

  castVote: (voterId: string, candidateId: number) => {
    const user = db.getUserById(voterId);
    if (!user || user.hasVoted) {
      return false;
    }

    const candidate = data.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return false;
    }

    user.hasVoted = true;
    candidate.voteCount += 1;
    const newVote: Vote = {
        id: data.votes.length + 1,
        voterId,
        candidateId,
        timestamp: new Date(),
    }
    data.votes.push(newVote);
    saveData();
    return true;
  },

  getVoteCounts: () => {
    return data.candidates.map(c => ({
      id: c.id,
      name: c.name,
      voteCount: c.voteCount,
    }));
  },
  
  getTotalVotes: () => data.votes.length,

  getTotalVoters: () => data.users.length,

  resetVotes: () => {
    data.candidates = data.candidates.map(c => ({ ...c, voteCount: 0 }));
    data.users = data.users.map(u => ({ ...u, hasVoted: false }));
    data.votes = [];
    saveData();
  },
};
