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

function getData(): AppData {
  try {
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      if (fileContent.trim()) {
        return JSON.parse(fileContent);
      }
    }
  } catch (error) {
    console.error('Error loading or parsing data, initializing with empty state:', error);
  }
  
  // Return a default structure if file doesn't exist or is empty
  const defaultData: AppData = {
    users: [],
    candidates: [],
    votes: [],
    electionStart: null,
    electionEnd: null,
  };
  saveData(defaultData);
  return defaultData;
}


function saveData(data: AppData): void {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}


function generateUniqueCode(data: AppData) {
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

function generateUniqueId(type: 'user' | 'candidate', data: AppData) {
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
    const data = getData();
    return data.users.find((user) => user.name.toLowerCase() === name.toLowerCase() && user.code === code.toUpperCase());
  },

  getUserById: (id: string) => {
    const data = getData();
    return data.users.find((user) => user.id === id);
  },
  
  getUsers: () => {
    const data = getData();
    return [...data.users].sort((a,b) => a.name.localeCompare(b.name))
  },

  addVoter: (name: string) => {
    const data = getData();
    if (data.users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('A voter with this name already exists.');
    }
    const newUser: User = {
        id: generateUniqueId('user', data),
        name,
        code: generateUniqueCode(data),
        hasVoted: false,
    }
    data.users.push(newUser);
    saveData(data);
    return db.getUsers();
  },

  deleteVoter: (id: string) => {
    const data = getData();
    const userIndex = data.users.findIndex(u => u.id === id);
    if(userIndex === -1) {
        throw new Error('Voter not found.');
    }
    // Also remove any votes by this user
    data.votes = data.votes.filter(v => v.voterId !== id);
    data.users.splice(userIndex, 1);
    saveData(data);
  },

  getCandidates: () => {
    const data = getData();
    const voteCounts: {[key: number]: number} = {};
    data.votes.forEach(vote => {
      voteCounts[vote.candidateId] = (voteCounts[vote.candidateId] || 0) + 1;
    });

    const candidatesWithCounts = data.candidates.map(c => ({
      ...c,
      voteCount: voteCounts[c.id] || 0,
    }));
    
    return candidatesWithCounts.sort((a,b) => a.name.localeCompare(b.name));
  },

  addCandidate: (candidateData: Omit<Candidate, 'id' | 'voteCount'>) => {
    const data = getData();
    const newId = parseInt(generateUniqueId('candidate', data));
    const newCandidate: Candidate = { ...candidateData, id: newId, voteCount: 0 };
    data.candidates.push(newCandidate);
    saveData(data);
    return db.getCandidates();
  },

  deleteCandidate: (id: number) => {
    const data = getData();
    const candidateIndex = data.candidates.findIndex(c => c.id === id);
    if(candidateIndex === -1) {
        throw new Error('Candidate not found.');
    }
     // Also remove any votes for this candidate
    data.votes = data.votes.filter(v => v.candidateId !== id);
    data.candidates.splice(candidateIndex, 1);
    saveData(data);
  },
  
  getElectionStatus: () => {
    const data = getData();
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
    const data = getData();
    data.electionStart = start ? start.toISOString() : null;
    data.electionEnd = end ? end.toISOString() : null;
    saveData(data);
    return {
      start: data.electionStart ? new Date(data.electionStart) : null,
      end: data.electionEnd ? new Date(data.electionEnd) : null,
    }
  },

  castVote: (voterId: string, candidateId: number) => {
    let data = getData();
    const electionStatus = db.getElectionStatus();
    if(electionStatus.status !== 'active') {
        return { success: false, message: 'The election is not currently active.' };
    }
    
    const user = data.users.find((user) => user.id === voterId);
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
    
    const newVote: Vote = {
        id: data.votes.length > 0 ? Math.max(...data.votes.map(v => v.id), 0) + 1 : 1,
        voterId,
        candidateId,
        timestamp: new Date(),
    }
    data.votes.push(newVote);
    saveData(data);
    return { success: true, message: 'Your vote has been successfully cast!' };
  },
  
  getTotalVotes: () => {
    const data = getData();
    return data.votes.length
  },

  getTotalVoters: () => {
    const data = getData();
    return data.users.length
  },

  resetVotes: () => {
    const data = getData();
    data.users.forEach(u => u.hasVoted = false);
    data.votes = [];
    data.electionStart = null;
    data.electionEnd = null;
    saveData(data);
  },
};
