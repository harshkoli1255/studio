'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './data';
import type { Candidate } from './types';
import { summarizeVoteResults } from '@/ai/flows/summarize-vote-results';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_COOKIE = 'admin-auth';
const STUDENT_COOKIE = 'student-auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

export async function studentLogin(prevState: any, formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    return { message: parsed.error.errors[0].message };
  }

  const user = db.getUserByEmail(parsed.data.email);

  if (!user) {
    return { message: 'Student ID not found.' };
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
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function adminLogin(prevState: any, formData: FormData) {
  const parsed = adminLoginSchema.safeParse({ password: formData.get('password') });

  if (!parsed.success) {
    return { message: parsed.error.errors[0].message };
  }
  
  if (parsed.data.password !== ADMIN_PASSWORD) {
    return { message: 'Incorrect password.' };
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

  const user = db.getUserById(studentId);
  if (user?.hasVoted) {
    return { success: false, message: 'You have already cast your vote.' };
  }

  const success = db.castVote(studentId, candidateId);
  if (success) {
    return { success: true, message: 'Your vote has been cast successfully!' };
  }

  return { success: false, message: 'An error occurred while casting your vote.' };
}

const candidateSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long.'),
    bio: z.string().min(10, 'Bio must be at least 10 characters long.'),
    imageUrl: z.string().url('Please enter a valid image URL.'),
    dataAiHint: z.string().optional(),
});


export async function addCandidate(prevState: any, formData: FormData) {
    const parsed = candidateSchema.safeParse({
        name: formData.get('name'),
        bio: formData.get('bio'),
        imageUrl: formData.get('imageUrl'),
        dataAiHint: formData.get('dataAiHint'),
    });

    if (!parsed.success) {
        return { success: false, message: parsed.error.errors.map(e => e.message).join(', ') };
    }
    
    db.addCandidate(parsed.data as Omit<Candidate, 'id' | 'voteCount'>);
    return { success: true, message: 'Candidate added successfully.' };
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
