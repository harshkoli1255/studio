// In-memory data store
import type { Candidate, User, Vote } from '@/lib/types';

let users: User[] = [
  { id: '1', name: 'Rahul Sharma', code: 'X7R9K2LQ', hasVoted: false },
  { id: '2', name: 'Anjali Mehra', code: 'F9J2W3MV', hasVoted: false },
  { id: '3', name: 'Vikram Singh', code: 'L8PT4CXD', hasVoted: false },
  { id: '4', name: 'Priya Patel', code: 'B4ZD9RHY', hasVoted: true },
  { id: '5', name: 'Amit Kumar', code: 'H2RM8EJK', hasVoted: false },
  { id: '6', name: 'Sneha Reddy', code: 'N9XC3UBV', hasVoted: false },
  { id: '7', name: 'Rajesh Gupta', code: 'K5LY8NMQ', hasVoted: false },
  { id: '8', name: 'Sunita Rao', code: 'A7VQ2PRX', hasVoted: false },
  { id: '9', name: 'Manoj Verma', code: 'C8XR5KLD', hasVoted: false },
  { id: '10', name: 'Kavita Iyer', code: 'R2JF6VQZ', hasVoted: false },
  { id: '11', name: 'Sanjay Joshi', code: 'D7MP9YXE', hasVoted: false },
  { id: '12', name: 'Deepika Nair', code: 'S6TK3BRP', hasVoted: false },
  { id: '13', name: 'Arun Menon', code: 'E5ZQN8KH', hasVoted: false },
  { id: '14', name: 'Pooja Desai', code: 'M4LXK9WU', hasVoted: false },
  { id: '15', name: 'Nitin Malhotra', code: 'G9VHP2CN', hasVoted: false },
  { id: '16', name: 'Geeta Krishnan', code: 'T2NZX7JK', hasVoted: false },
  { id: '17', name: 'Ravi Pillai', code: 'W3CEK6QV', hasVoted: false },
  { id: '18', name: 'Meena Srinivasan', code: 'Q8LMJ2XF', hasVoted: false },
  { id: '19', name: 'Harish Bhatt', code: 'U9FRE1TB', hasVoted: false },
  { id: '20', name: 'Lakshmi Murthy', code: 'J6VQU7NP', hasVoted: false },
  { id: '21', name: 'Anand Gopal', code: 'ZT3L8YWN', hasVoted: false },
  { id: '22', name: 'Shanti Kumar', code: 'Q6UM2VXE', hasVoted: false },
  { id: '23', name: 'Ganesh Pillai', code: 'J2NB6HQY', hasVoted: false },
  { id: '24', name: 'Rina Shah', code: 'Y7CJ2KLM', hasVoted: false },
  { id: '25', name: 'Mohanlal Mehta', code: 'T6PA9WRQ', hasVoted: false },
  { id: '26', name: 'Usha Rani', code: 'E3XG5NYZ', hasVoted: false },
  { id: '27', name: 'Jayesh Patel', code: 'U4DQ8JLM', hasVoted: false },
  { id: '28', name: 'Kiran Bedi', code: 'G6ZC7TYE', hasVoted: false },
  { id: '29', name: 'Mahesh Babu', code: 'M3NC4ZXY', hasVoted: false },
  { id: '30', name: 'Bhavna Chauhan', code: 'B8YXL7CN', hasVoted: false },
  { id: '31', name: 'Jagdish Tytler', code: 'J4QMN9EV', hasVoted: false },
  { id: '32', name: 'Hema Malini', code: 'H9DFT7PL', hasVoted: false },
  { id: '33', name: 'Vivan Sundaram', code: 'V6YBQ2XN', hasVoted: false },
  { id: '34', name: 'Rekha Jain', code: 'R8JMC5LY', hasVoted: false },
  { id: '35', name: 'Ashok Dinda', code: 'A2DJX7VM', hasVoted: false },
  { id: '36', name: 'Kunal Basu', code: 'K8WNZ4RP', hasVoted: false },
  { id: '37', name: 'Dinesh Karthik', code: 'D6PKJ8TZ', hasVoted: false },
  { id: '38', name: 'Saina Nehwal', code: 'S3NLY5VK', hasVoted: false },
  { id: '39', name: 'Chetan Bhagat', code: 'C2MXK4YP', hasVoted: false },
  { id: '40', name: 'Yusuf Pathan', code: 'Y9KDM8XQ', hasVoted: false },
  { id: '41', name: 'David Boon', code: 'D5NK8TRZ', hasVoted: false },
  { id: '42', name: 'Anirban Lahiri', code: 'A9ZY4KRP', hasVoted: false },
  { id: '43', name: 'Wasim Akram', code: 'WVX3QU7M', hasVoted: false },
  { id: '44', name: 'Kapil Dev', code: 'KXL9E2HQ', hasVoted: false },
  { id: '45', name: 'Pankaj Advani', code: 'P4CFM6DZ', hasVoted: false },
  { id: '46', name: 'Mary Kom', code: 'M7RZK1VB', hasVoted: false },
  { id: '47', name: 'Virat Kohli', code: 'V9KQ5DHL', hasVoted: false },
  { id: '48', name: 'Yuvraj Singh', code: 'Y2WMP9RT', hasVoted: false },
  { id: '49', name: 'Queenie Singh', code: 'Q5ZUN2MV', hasVoted: false },
  { id: '50', name: 'Leander Paes', code: 'L3HRD6KP', hasVoted: false },
  { id: '51', name: 'Zeenat Aman', code: 'Z9NWXCQY', hasVoted: false },
  { id: '52', name: 'Urvashi Rautela', code: 'U2CVL3MP', hasVoted: false },
  { id: '53', name: 'Nargis Fakhri', code: 'N3GKW7XD', hasVoted: false },
  { id: '54', name: 'Farhan Akhtar', code: 'F6ZYM9TE', hasVoted: false },
  { id: '55', name: 'Xerxes Desai', code: 'X3RBT5LU', hasVoted: false },
  { id: '56', name: 'Bipasha Basu', code: 'B5WZR8QY', hasVoted: false },
  { id: '57', name: 'Lara Dutta', code: 'L9XHC2EM', hasVoted: false },
  { id: '58', name: 'Mahendra Dhoni', code: 'M6DJY9QB', hasVoted: false },
  { id: '59', name: 'Harbhajan Singh', code: 'H5XTM3NV', hasVoted: false },
  { id: '60', name: 'Esha Gupta', code: 'E4KWZ7LC', hasVoted: false }
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
