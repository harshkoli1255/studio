export type User = {
  id: string;
  name: string;
  code: string;
  hasVoted: boolean;
  email?: string;
};

export type Candidate = {
  id: number;
  name: string;
  bio: string;
  imageUrl: string;
  dataAiHint?: string;
  voteCount: number;
};

export type Vote = {
  id: number;
  voterId: string;
  candidateId: number;
  timestamp: Date;
};

export type PastWinner = {
  date: Date;
  winners: {
    id: number;
    name: string;
    voteCount: number;
  }[];
  totalVotes: number;
}
