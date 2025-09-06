'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addCandidate } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Candidate } from '@/lib/types';
import Image from 'next/image';

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
    onCandidateAdded: (candidates: Candidate[]) => void;
}

export default function CandidateForm({ onCandidateAdded }: CandidateFormProps) {
  const [state, formAction] = useActionState(addCandidate, { success: false, message: '', candidates: null, actionId: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lastActionId, setLastActionId] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.actionId && state.actionId !== lastActionId) {
      if (state.success && state.candidates) {
        toast({ title: 'Success', description: state.message });
        formRef.current?.reset();
        setImagePreview(null);
        onCandidateAdded(state.candidates);
      } else if (state.message) {
        toast({ title: 'Error', description: state.message, variant: 'destructive' });
      }
      setLastActionId(state.actionId);
    }
  }, [state, toast, onCandidateAdded, lastActionId]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    if (url) {
        setImagePreview(url);
    } else if (!fileInputRef.current?.files?.length) {
        setImagePreview(null);
    }
  }

  return (
      <form ref={formRef} action={formAction} className="space-y-4 pt-4">
          <div className="space-y-2">
          <Label htmlFor="image">Candidate Image</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
              {imagePreview ? (
                <Image src={imagePreview} alt="Candidate preview" width={96} height={96} className="object-cover w-full h-full"/>
              ) : (
                <ImageIcon className="text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2"/>
                  Upload Image
                </Button>
                <Input type="file" name="image" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-muted"></div>
                  <span className="flex-shrink mx-2 text-xs text-muted-foreground">OR</span>
                  <div className="flex-grow border-t border-muted"></div>
                </div>
                <Input name="imageUrl" placeholder="Enter Image URL" onChange={handleUrlChange} />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Candidate Name</Label>
          <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Short Bio</Label>
          <Textarea id="bio" name="bio" placeholder="A short, compelling bio..." required />
        </div>
          <div className="space-y-2">
          <Label htmlFor="dataAiHint">AI Image Hint (for placeholders)</Label>
          <Input id="dataAiHint" name="dataAiHint" placeholder="e.g. man portrait" />
        </div>
        <SubmitButton />
      </form>
  );
}
