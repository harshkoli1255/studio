'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { studentLogin } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} variant="default">
      {pending ? 'Logging In...' : 'Log In & Vote'}
    </Button>
  );
}

export default function StudentLoginForm() {
  const [state, formAction] = useFormState(studentLogin, { message: '' });

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {state.message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Voting Code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="e.g. X7R9K2LQ"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
