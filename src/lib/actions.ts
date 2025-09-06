'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './data';
import type { Candidate, User } from './types';
import { summarizeVoteResults } from '@/ai/flows/summarize-vote-results';
import { parseVoters, type ParseVotersOutput } from '@/ai/flows/parse-voters-flow';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const ADMIN_COOKIE = 'admin-auth';
const STUDENT_COOKIE = 'student-auth';

// --- Helper Functions ---

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

async function fileToText(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return buffer.toString('utf-8');
}

// --- Schemas ---
const loginSchema = z.object({
  name: z.string().min(1, { message: 'Please enter your full name.' }),
  code: z.string().min(1, { message: 'Please enter your voting code.' }),
});

const adminLoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const imageFileSchema = z.instanceof(File)
  .refine(file => file.size > 0, 'Image is required.')
  .refine(file => file.size < 4 * 1024 * 1024, 'Image must be less than 4MB.')
  .refine(file => file.type.startsWith('image/'), 'File must be an image.');

const candidateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  bio: z.string().min(10, 'Bio must be at least 10 characters long.'),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  image: z.any().optional(),
  dataAiHint: z.string().optional(),
}).refine(data => data.imageUrl || (data.image && data.image.size > 0), {
  message: "Please provide an image URL or upload an image file.",
  path: ["image"],
});

const voterSchema = z.object({
  voterName: z.string().min(3, 'Voter name must be at least 3 characters long.'),
});

const csvFileSchema = z.instanceof(File)
    .refine(file => file.size > 0, 'CSV file is required.')
    .refine(file => file.type === 'text/csv', 'File must be a CSV.');


// --- Server Actions ---

export async function studentLogin(prevState: any, formData: FormData): Promise<{ success: boolean; message: string; redirectTo?: string; }> {
  const electionStatus = db.getElectionStatus();
  
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0].message };
  }

  const user = db.getUserByNameAndCode(parsed.data.name, parsed.data.code);

  if (!user) {
    return { success: false, message: 'Invalid name or voting code.' };
  }
  
  cookies().set(STUDENT_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
  
  if (user.hasVoted || electionStatus.status === 'ended') {
    return { success: true, message: 'Redirecting to results...', redirectTo: '/results' };
  }

  if (electionStatus.status !== 'active') {
     return { success: true, message: `The election is ${electionStatus.status.replace('_', ' ')}. Redirecting to vote...`, redirectTo: '/vote' };
  }
  
  return { success: true, message: 'Login successful. Redirecting to vote...', redirectTo: '/vote' };
}

export async function adminLogin(prevState: any, formData: FormData): Promise<{ success: boolean, message: string }> {
  const parsed = adminLoginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0].message };
  }
  
  if (parsed.data.username !== ADMIN_USERNAME || parsed.data.password !== ADMIN_PASSWORD) {
    return { success: false, message: 'Incorrect username or password.' };
  }

  cookies().set(ADMIN_COOKIE, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  redirect('/admin');
}

export async function logout() {
  const cookieStore = cookies();
  const redirectPath = cookieStore.has(ADMIN_COOKIE) ? '/admin/login' : '/';
  cookieStore.delete(ADMIN_COOKIE);
  cookieStore.delete(STUDENT_COOKIE);
  redirect(redirectPath);
}

export async function castVote(candidateId: number) {
  const studentId = cookies().get(STUDENT_COOKIE)?.value;
  if (!studentId) {
    return { success: false, message: 'Authentication failed. Please log in again.' };
  }
  return db.castVote(studentId, candidateId);
}

export async function addCandidate(prevState: any, formData: FormData): Promise<{ success: boolean; message: string; candidates: Candidate[] | null; actionId: string; }> {
  const actionId = crypto.randomUUID();
  const parsed = candidateSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors.map(e => e.message).join(', '), candidates: null, actionId };
  }
  
  let finalImageUrl = parsed.data.imageUrl;
  const imageFile = formData.get('image');

  if (imageFile instanceof File && imageFile.size > 0) {
    const fileValidation = imageFileSchema.safeParse(imageFile);
    if (!fileValidation.success) {
      return { success: false, message: fileValidation.error.errors.map(e => e.message).join(', '), candidates: null, actionId };
    }
    finalImageUrl = await fileToDataUrl(imageFile);
  }
  
  if (!finalImageUrl) {
    return { success: false, message: "An image is required.", candidates: null, actionId };
  }

  const updatedCandidates = db.addCandidate({
    name: parsed.data.name,
    bio: parsed.data.bio,
    imageUrl: finalImageUrl,
    dataAiHint: parsed.data.dataAiHint,
  });
  
  return { success: true, message: 'Candidate added successfully.', candidates: updatedCandidates, actionId };
}


export async function deleteCandidate(candidateId: number) {
  try {
    db.deleteCandidate(candidateId);
    return { success: true, message: 'Candidate deleted successfully.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function addVoter(formData: FormData) {
  const parsed = voterSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0].message, voters: null };
  }

  try {
    const updatedVoters = db.addVoter(parsed.data.voterName);
    return { success: true, message: 'Voter added successfully.', voters: updatedVoters };
  } catch(e: any) {
    return { success: false, message: e.message, voters: null };
  }
}

export async function addBulkVoters(voters: {name: string}[]) {
    try {
        const voterNames = voters.map(v => v.name);
        const {voters: updatedVoters, addedCount, skippedCount} = db.addVoters(voterNames);
        return { success: true, message: `${addedCount} voters added.`, voters: updatedVoters, addedCount, skippedCount };
    } catch(e: any) {
        return { success: false, message: "An error occurred while adding voters.", voters: null, addedCount: 0, skippedCount: 0 };
    }
}

export async function parseVotersCsv(formData: FormData): Promise<{success: boolean, message: string, voters: ParseVotersOutput | null}> {
    const file = formData.get('voterCsv');

    const parsed = csvFileSchema.safeParse(file);
    if(!parsed.success) {
        return { success: false, message: parsed.error.errors[0].message, voters: null };
    }
    
    try {
        const csvText = await fileToText(parsed.data);
        const result = await parseVoters(csvText);
        return { success: true, message: "CSV parsed successfully.", voters: result };
    } catch (e: any) {
         console.error('Error parsing CSV:', e);
        return { success: false, message: "Could not parse CSV file. Please check the format.", voters: null };
    }
}


export async function deleteVoter(voterId: string) {
  try {
    db.deleteVoter(voterId);
    return { success: true, message: 'Voter deleted successfully.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function generateSummary() {
  try {
    const candidateResults = db.getCandidates().map(c => ({
      candidateName: c.name,
      voteCount: c.voteCount,
    }));
    const totalVotes = db.getTotalVotes();
    const totalVoters = db.getUsers().length;

    const result = await summarizeVoteResults({
      candidateResults,
      totalVotes,
      totalVoters,
    });
    return { summary: result.summary };
  } catch (error) {
    console.error('Error generating summary:', error);
    return { summary: 'Could not generate summary at this time.' };
  }
}

export async function setElectionSchedule(start: Date | null, end: Date | null) {
  if (start && end && start >= end) {
    return { success: false, message: "Start date must be before the end date." };
  }
  const dates = db.setElectionDates(start, end);
  return { success: true, message: "Election schedule updated successfully.", ...dates };
}

export async function endElectionNow() {
  try {
    db.endElection();
    return { success: true, message: "Election has been ended." };
  } catch (e: any) {
    return { success: false, message: "Could not end the election." };
  }
}

export async function resetVotes() {
  try {
    db.resetVotes();
    return { success: true, message: 'All votes have been reset.' };
  } catch (e: any) {
    return { success: false, message: 'Could not reset votes.' };
  }
}
