'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './data';
import type { Candidate, User } from './types';
import { summarizeVoteResults } from '@/ai/flows/summarize-vote-results';
import { randomBytes } from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'hadmin123';
const ADMIN_COOKIE = 'admin-auth';
const STUDENT_COOKIE = 'student-auth';

const loginSchema = z.object({
  name: z.string().min(1, { message: 'Please enter your full name.' }),
  code: z.string().min(1, { message: 'Please enter your voting code.' }),
});

export async function studentLogin(prevState: any, formData: FormData) {
  const electionStatus = db.getElectionStatus();
  if (electionStatus.status !== 'active') {
    return { message: `The election is ${electionStatus.status.replace('_', ' ')}.` };
  }
  
  const parsed = loginSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
  });

  if (!parsed.success) {
    return { message: parsed.error.errors[0].message };
  }

  const user = db.getUserByNameAndCode(parsed.data.name, parsed.data.code.toUpperCase());

  if (!user) {
    return { message: 'Invalid name or voting code.' };
  }

  if (user.hasVoted) {
    // This is a soft redirect, the middleware will handle the hard redirect
    // but it provides a slightly better UX for users who have already voted.
     cookies().set(STUDENT_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    redirect('/vote');
  }
  
  cookies().set(STUDENT_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  redirect('/vote');
}

const adminLoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function adminLogin(prevState: any, formData: FormData) {
  const parsed = adminLoginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { message: parsed.error.errors[0].message };
  }
  
  if (parsed.data.username !== ADMIN_USERNAME || parsed.data.password !== ADMIN_PASSWORD) {
    return { message: 'Incorrect username or password.' };
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
  if (cookieStore.has(ADMIN_COOKIE)) {
    cookieStore.delete(ADMIN_COOKIE);
    redirect('/admin/login');
  } else if (cookieStore.has(STUDENT_COOKIE)) {
    cookieStore.delete(STUDENT_COOKIE);
    redirect('/');
  }
}

export async function castVote(candidateId: number) {
  const studentId = cookies().get(STUDENT_COOKIE)?.value;
  if (!studentId) {
    return { success: false, message: 'Authentication failed. Please log in again.' };
  }
  
  return db.castVote(studentId, candidateId);
}

const imageFileSchema = z.instanceof(File).refine(file => file.size > 0, 'Image is required.').refine(file => file.size < 4 * 1024 * 1024, 'Image must be less than 4MB.').refine(file => file.type.startsWith('image/'), 'File must be an image.');

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

async function fileToDataUrl(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function addCandidate(prevState: any, formData: FormData): Promise<{ success: boolean; message: string; candidates: Candidate[] | null; actionId: string; }> {
    const imageFile = formData.get('image');
    const actionId = randomBytes(8).toString('hex');
    const parsed = candidateSchema.safeParse({
        name: formData.get('name'),
        bio: formData.get('bio'),
        imageUrl: formData.get('imageUrl'),
        image: imageFile,
        dataAiHint: formData.get('dataAiHint'),
    });

    if (!parsed.success) {
        return { success: false, message: parsed.error.errors.map(e => e.message).join(', '), candidates: null, actionId };
    }
    
    let finalImageUrl = parsed.data.imageUrl;

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

export async function resetVotes() {
  db.resetVotes();
  return { message: 'All votes have been reset.' };
}

export async function generateSummary() {
  try {
    const candidateResults = db.getCandidates().map(c => ({
      candidateName: c.name,
      voteCount: c.voteCount,
    }));
    const totalVotes = db.getTotalVotes();
    const totalVoters = db.getTotalVoters();

    if (totalVotes === 0) {
      return { summary: 'No votes have been cast yet. The election is just getting started!' };
    }

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

const voterSchema = z.object({
    voterName: z.string().min(3, 'Voter name must be at least 3 characters long.'),
});

export async function addVoter(prevState: any, formData: FormData): Promise<{success: boolean, message: string, voters: User[] | null, actionId: string}> {
    const parsed = voterSchema.safeParse({
        voterName: formData.get('voterName'),
    });
    
    const actionId = randomBytes(8).toString('hex');

    if (!parsed.success) {
        return { success: false, message: parsed.error.errors[0].message, voters: null, actionId };
    }

    try {
        const updatedVoters = db.addVoter(parsed.data.voterName);
        return { success: true, message: 'Voter added successfully.', voters: updatedVoters, actionId };
    } catch(e: any) {
        return { success: false, message: e.message, voters: null, actionId };
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

export async function setElectionSchedule(start: Date | null, end: Date | null) {
  if (start && end && start >= end) {
    return { success: false, message: "Start date must be before the end date." };
  }
  const dates = db.setElectionDates(start, end);
  return { success: true, message: "Election schedule updated successfully.", ...dates };
}
