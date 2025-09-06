// In-memory data store
import type { Candidate, User, Vote } from '@/lib/types';

let users: User[] = [
  { id: '1', email: 'student1@college.edu', hasVoted: false },
  { id: '2', email: 'student2@college.edu', hasVoted: false },
  { id: '3', email: 'student3@college.edu', hasVoted: false },
  { id: '4', email: 'student4@college.edu', hasVoted: true },
  { id: '5', email: 'student5@college.edu', hasVoted: false },
  { id: '6', email: 'student6@college.edu', hasVoted: false },
  { id: '7', email: 'student7@college.edu', hasVoted: false },
  { id: '8', email: 'student8@college.edu', hasVoted: false },
  { id: '9', email: 'student9@college.edu', hasVoted: false },
  { id: '10', email: 'student10@college.edu', hasVoted: false },
];

let candidates: Candidate[] = [
  { id: 1, name: 'Alice Johnson', bio: 'Committed to student voice and campus improvements.', imageUrl: 'https://picsum.photos/400/400?random=1', voteCount: 5, dataAiHint: 'woman face' },
  { id: 2, name: 'Bob Williams', bio: 'Focused on enhancing academic resources and support.', imageUrl: 'https://picsum.photos/400/400?random=2', voteCount: 8, dataAiHint: 'man portrait' },
  { id: 3, name: 'Charlie Brown', bio: 'Advocating for more social events and clubs.', imageUrl: 'https://picsum.photos/400/400?random=3', voteCount: 2, dataAiHint: 'person smiling' },
];

let votes: Vote[] = [
    ...Array(5).fill(0).map((_, i) => ({ id: i + 1, voterId: `s${i}`, candidateId: 1, timestamp: new Date() })),
    ...Array(8).fill(0).map((_, i) => ({ id: i + 6, voterId: `s${i+5}`, candidateId: 2, timestamp: new Date() })),
    ...Array(2).fill(0).map((_, i) => ({ id: i + 14, voterId: `s${i+13}`, candidateId: 3, timestamp: new Date() })),
    { id: 16, voterId: '4', candidateId: 1, timestamp: new Date() },
];


export const db = {
  getUserByEmail: (email: string) => {
    return users.find((user) => user.email === email);
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
