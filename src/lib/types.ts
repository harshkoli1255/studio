export type User = {
  id: string;
  email: string;
  hasVoted: boolean;
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
