// In-memory data store with file persistence
import type { Candidate, User, Vote, PastWinner } from '@/lib/types';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src', 'lib', 'data.json');

interface AppData {
  users: User[];
  candidates: Candidate[];
  votes: Vote[];
  pastWinners: PastWinner[];
  electionStart: string | null;
  electionEnd: string | null;
}

let data: AppData | null = null;

function loadDataFromFile(): AppData {
  try {
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      if (fileContent.trim()) {
        const parsedData = JSON.parse(fileContent);
        // Ensure all keys are present, especially new ones like pastWinners
        return {
          users: parsedData.users || [],
          candidates: parsedData.candidates || [],
          votes: parsedData.votes || [],
          pastWinners: parsedData.pastWinners || [],
          electionStart: parsedData.electionStart || null,
          electionEnd: parsedData.electionEnd || null,
        };
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
    pastWinners: [],
    electionStart: null,
    electionEnd: null,
  };
  // Don't write file on load, only on save
  return defaultData;
}

function getData(): AppData {
  data = loadDataFromFile();
  return data;
}

function saveData(dataToSave: AppData): void {
  data = dataToSave;
  try {
    fs.writeFileSync(dataPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}


function generateUniqueCode(currentData: AppData) {
  let code: string;
  let isUnique = false;
  while(!isUnique) {
    code = randomBytes(4).toString('hex').toUpperCase();
    if(!currentData.users.find(u => u.code === code)) {
      isUnique = true;
    }
  }
  return code!;
}

function generateUniqueId(type: 'user' | 'candidate', currentData: AppData) {
    let id: string;
    let isUnique = false;

    if (type === 'user') {
      while(!isUnique) {
        id = randomBytes(16).toString('hex');
        if(!currentData.users.find(u => u.id === id)) {
          isUnique = true;
        }
      }
    } else { // candidate
        const maxId = currentData.candidates.length > 0 ? Math.max(...currentData.candidates.map(c => c.id), 0) : 0;
        id = (maxId + 1).toString();
    }
    return id!;
}


export const db = {
  getUserByNameAndCode: (name: string, code: string) => {
    const currentData = getData();
    return currentData.users.find((user) => user.name.toLowerCase() === name.toLowerCase() && user.code === code.toUpperCase());
  },

  getUserById: (id: string) => {
    const currentData = getData();
    return currentData.users.find((user) => user.id === id);
  },
  
  getUsers: () => {
    const currentData = getData();
    return [...currentData.users].sort((a,b) => a.name.localeCompare(b.name))
  },

  addVoter: (name: string) => {
    const currentData = getData();
    if (currentData.users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('A voter with this name already exists.');
    }
    const newUser: User = {
        id: generateUniqueId('user', currentData),
        name,
        code: generateUniqueCode(currentData),
        hasVoted: false,
    }
    currentData.users.push(newUser);
    saveData(currentData);
    return db.getUsers();
  },

  deleteVoter: (id: string) => {
    const currentData = getData();
    const userIndex = currentData.users.findIndex(u => u.id === id);
    if(userIndex === -1) {
        throw new Error('Voter not found.');
    }
    // Also remove any votes by this user
    currentData.votes = currentData.votes.filter(v => v.voterId !== id);
    currentData.users.splice(userIndex, 1);
    saveData(currentData);
  },

  getCandidates: () => {
    const currentData = getData();
    const voteCounts: {[key: number]: number} = {};
    currentData.votes.forEach(vote => {
      voteCounts[vote.candidateId] = (voteCounts[vote.candidateId] || 0) + 1;
    });

    const candidatesWithCounts = currentData.candidates.map(c => ({
      ...c,
      voteCount: voteCounts[c.id] || 0,
    }));
    
    return candidatesWithCounts.sort((a,b) => a.name.localeCompare(b.name));
  },
  
  getPastWinners: () => {
    const currentData = getData();
    if (!currentData.pastWinners) {
      return [];
    }
    return currentData.pastWinners.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addCandidate: (candidateData: Omit<Candidate, 'id' | 'voteCount'>) => {
    const currentData = getData();
    const newId = parseInt(generateUniqueId('candidate', currentData));
    const newCandidate: Candidate = { ...candidateData, id: newId, voteCount: 0 };
    currentData.candidates.push(newCandidate);
    saveData(currentData);
    return db.getCandidates();
  },

  deleteCandidate: (id: number) => {
    const currentData = getData();
    const candidateIndex = currentData.candidates.findIndex(c => c.id === id);
    if(candidateIndex === -1) {
        throw new Error('Candidate not found.');
    }
     // Also remove any votes for this candidate
    currentData.votes = currentData.votes.filter(v => v.candidateId !== id);
    currentData.candidates.splice(candidateIndex, 1);
    saveData(currentData);
  },
  
  getElectionStatus: () => {
    const currentData = getData();
    const now = new Date();
    const start = currentData.electionStart ? new Date(currentData.electionStart) : null;
    const end = currentData.electionEnd ? new Date(currentData.electionEnd) : null;
    
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
    const currentData = getData();
    currentData.electionStart = start ? start.toISOString() : null;
    currentData.electionEnd = end ? end.toISOString() : null;
    saveData(currentData);
    return {
      start: currentData.electionStart ? new Date(currentData.electionStart) : null,
      end: currentData.electionEnd ? new Date(currentData.electionEnd) : null,
    }
  },

  castVote: (voterId: string, candidateId: number) => {
    let currentData = getData();
    const electionStatus = db.getElectionStatus();
    if(electionStatus.status !== 'active') {
        return { success: false, message: 'The election is not currently active.' };
    }
    
    const user = currentData.users.find((user) => user.id === voterId);
    if (!user) {
      return { success: false, message: 'Invalid user.' };
    }
    if (user.hasVoted) {
      return { success: false, message: 'You have already voted.' };
    }

    const candidate = currentData.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return { success: false, message: 'Invalid candidate.' };
    }

    user.hasVoted = true;
    
    const newVote: Vote = {
        id: currentData.votes.length > 0 ? Math.max(...currentData.votes.map(v => v.id), 0) + 1 : 1,
        voterId,
        candidateId,
        timestamp: new Date(),
    }
    currentData.votes.push(newVote);
    saveData(currentData);
    return { success: true, message: 'Your vote has been successfully cast!' };
  },
  
  getTotalVotes: () => {
    const currentData = getData();
    return currentData.votes.length
  },

  getTotalVoters: () => {
    const currentData = getData();
    return currentData.users.length
  },
  
  endElection: () => {
    const currentData = getData();
    const now = new Date();
    const { start } = currentData;
    const electionStart = (start && new Date(start) < now) ? start : new Date(now.getTime() - 1000).toISOString();
    currentData.electionStart = electionStart;
    currentData.electionEnd = now.toISOString();

    const candidates = db.getCandidates();
    const totalVotes = db.getTotalVotes();
    
    if (candidates.length > 0 && totalVotes > 0) {
        const maxVotes = Math.max(...candidates.map(c => c.voteCount));
        const winners = candidates.filter(c => c.voteCount === maxVotes);
        
        const newWinnerRecord: PastWinner = {
            date: now,
            winners: winners.map(({id, name, voteCount}) => ({id, name, voteCount})),
            totalVotes,
        }
        if (!currentData.pastWinners) currentData.pastWinners = [];
        currentData.pastWinners.push(newWinnerRecord);
    }
    
    saveData(currentData);
  },

  resetVotes: () => {
    const currentData = getData();
    currentData.users.forEach(u => u.hasVoted = false);
    currentData.votes = [];
    currentData.electionStart = null;
    currentData.electionEnd = null;
    saveData(currentData);
  },
};
