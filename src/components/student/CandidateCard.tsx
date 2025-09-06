'use client';

import Image from 'next/image';
import type { Candidate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
}

export default function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center">
          <CheckCircle className="h-4 w-4" />
        </div>
      )}
      <CardHeader className="items-center">
        <Image
          src={candidate.imageUrl}
          alt={`Photo of ${candidate.name}`}
          width={128}
          height={128}
          data-ai-hint={candidate.dataAiHint}
          className="rounded-full h-32 w-32 object-cover border-4 border-secondary"
        />
      </CardHeader>
      <CardContent className="text-center">
        <CardTitle>{candidate.name}</CardTitle>
        <CardDescription className="mt-2 h-12 overflow-hidden">{candidate.bio}</CardDescription>
      </CardContent>
    </Card>
  );
}
