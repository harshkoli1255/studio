'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { addCandidate } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Candidate } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <Plus className="mr-2 h-4 w-4" />
      {pending ? 'Adding Candidate...' : 'Add Candidate'}
    </Button>
  );
}

interface CandidateFormProps {
    onCandidateAdded: (candidate: Candidate) => void;
}

export default function CandidateForm({ onCandidateAdded }: CandidateFormProps) {
  const [state, formAction] = useFormState(addCandidate, { success: false, message: '' });
  const [randomImage, setRandomImage] = useState('https://picsum.photos/400/400?random=4');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Success', description: state.message });
      formRef.current?.reset();
      generateRandomImage();
      // This is a mock of fetching the newly added candidate
      // In a real app, the server action would return the new candidate object
      const formData = new FormData(formRef.current!);
      const newCandidate = {
          id: Date.now(),
          name: formData.get('name') as string,
          bio: formData.get('bio') as string,
          imageUrl: formData.get('imageUrl') as string,
          voteCount: 0,
          dataAiHint: formData.get('dataAiHint') as string,
      }
      onCandidateAdded(newCandidate as Candidate);
    } else if (state.message) {
      toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, onCandidateAdded]);

  const generateRandomImage = () => {
    setRandomImage(`https://picsum.photos/400/400?random=${Date.now()}`);
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="add-candidate">
        <AccordionTrigger>
           <h3 className="text-lg font-medium">Add New Candidate</h3>
        </AccordionTrigger>
        <AccordionContent>
            <form ref={formRef} action={formAction} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Candidate Name</Label>
                <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea id="bio" name="bio" placeholder="A short, compelling bio..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                 <div className="flex gap-2">
                    <Input id="imageUrl" name="imageUrl" defaultValue={randomImage} key={randomImage} placeholder="https://example.com/image.png" required />
                    <Button type="button" variant="outline" onClick={generateRandomImage}>Random</Button>
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="dataAiHint">AI Image Hint</Label>
                <Input id="dataAiHint" name="dataAiHint" placeholder="e.g. man portrait" />
              </div>
              <SubmitButton />
            </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
