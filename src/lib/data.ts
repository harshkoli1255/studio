// In-memory data store
import type { Candidate, User, Vote } from '@/lib/types';

let users: User[] = [];

let candidates: Candidate[] = [];

let votes: Vote[] = [];


export const db = {
  getUserByNameAndCode: (name: string, code: string) => {
    return users.find((user) => user.name === name && user.code === code);
  },

  getUserById: (id: string) => {
    return users.find((user) => user.id === id);
  },
  
  getUsers: () => users,

  getCandidates: () => {
    return candidates.sort((a,b) => a.id - b.id);
  },

  addCandidate: (candidateData: Omit<Candidate, 'id' | 'voteCount'>) => {
    const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
    const newCandidate: Candidate = { ...candidateData, id: newId, voteCount: 0 };
    candidates.push(newCandidate);
    return newCandidate;
  },

  castVote: (voterId: string, candidateId: number) => {
    const user = db.getUserById(voterId);
    if (!user || user.hasVoted) {
      return false;
    }

    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return false;
    }

    user.hasVoted = true;
    candidate.voteCount += 1;
    const newVote: Vote = {
        id: votes.length + 1,
        voterId,
        candidateId,
        timestamp: new Date(),
    }
    votes.push(newVote);
    return true;
  },

  getVoteCounts: () => {
    return candidates.map(c => ({
      id: c.id,
      name: c.name,
      voteCount: c.voteCount,
    }));
  },
  
  getTotalVotes: () => votes.length,

  getTotalVoters: () => users.length,

  resetVotes: () => {
    candidates = candidates.map(c => ({ ...c, voteCount: 0 }));
    users = users.map(u => ({ ...u, hasVoted: false }));
    votes = [];
  },
};
