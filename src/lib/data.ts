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
  electionStart: string | null;
  electionEnd: string | null;
}

let data: AppData;

function loadData(): void {
  try {
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      // Avoid parsing empty files
      if (fileContent) {
        data = JSON.parse(fileContent);
        return;
      }
    }
    // If file doesn't exist or is empty, create it with default empty state
    data = {
      users: [],
      candidates: [],
      votes: [],
      electionStart: null,
      electionEnd: null,
    };
    saveData();
  } catch (error) {
    console.error('Error loading data:', error);
     data = {
      users: [],
      candidates: [],
      votes: [],
      electionStart: null,
      electionEnd: null,
    };
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

function generateUniqueId(type: 'user' | 'candidate') {
    let id: string;
    let isUnique = false;

    if (type === 'user') {
      while(!isUnique) {
        id = randomBytes(16).toString('hex');
        if(!data.users.find(u => u.id === id)) {
          isUnique = true;
        }
      }
    } else { // candidate
        const maxId = data.candidates.length > 0 ? Math.max(...data.candidates.map(c => c.id), 0) : 0;
        id = (maxId + 1).toString();
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
        id: generateUniqueId('user'),
        name,
        code: generateUniqueCode(),
        hasVoted: false,
    }
    data.users.push(newUser);
    saveData();
    return db.getUsers();
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
    return [...data.candidates].sort((a,b) => b.voteCount - a.voteCount);
  },

  addCandidate: (candidateData: Omit<Candidate, 'id' | 'voteCount'>) => {
    const newId = parseInt(generateUniqueId('candidate'));
    const newCandidate: Candidate = { ...candidateData, id: newId, voteCount: 0 };
    data.candidates.push(newCandidate);
    saveData();
    return db.getCandidates();
  },
  
  getElectionStatus: () => {
    const now = new Date();
    const start = data.electionStart ? new Date(data.electionStart) : null;
    const end = data.electionEnd ? new Date(data.electionEnd) : null;
    
    let status: 'upcoming' | 'active' | 'ended' | 'not_set' = 'not_set';
    
    if (start && end) {
      if (now < start) {
        status = 'upcoming';
      } else if (now > end) {
        status = 'ended';
      } else {
        status = 'active';
      }
    }
    
    return {
      status,
      start,
      end
    };
  },

  setElectionDates: (start: Date | null, end: Date | null) => {
    data.electionStart = start ? start.toISOString() : null;
    data.electionEnd = end ? end.toISOString() : null;
    saveData();
    return {
      start: data.electionStart ? new Date(data.electionStart) : null,
      end: data.electionEnd ? new Date(data.electionEnd) : null,
    }
  },

  castVote: (voterId: string, candidateId: number) => {
    const electionStatus = db.getElectionStatus();
    if(electionStatus.status !== 'active') {
        return { success: false, message: 'The election is not currently active.' };
    }
    
    const user = db.getUserById(voterId);
    if (!user) {
      return { success: false, message: 'Invalid user.' };
    }
    if (user.hasVoted) {
      return { success: false, message: 'You have already voted.' };
    }

    const candidate = data.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return { success: false, message: 'Invalid candidate.' };
    }

    user.hasVoted = true;
    candidate.voteCount += 1;
    const newVote: Vote = {
        id: data.votes.length > 0 ? Math.max(...data.votes.map(v => v.id), 0) + 1 : 1,
        voterId,
        candidateId,
        timestamp: new Date(),
    }
    data.votes.push(newVote);
    saveData();
    return { success: true, message: 'Your vote has been successfully cast!' };
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
    data.candidates.forEach(c => c.voteCount = 0);
    data.users.forEach(u => u.hasVoted = false);
    data.votes = [];
    data.electionStart = null;
    data.electionEnd = null;
    saveData();
  },
};
