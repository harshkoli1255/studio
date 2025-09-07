'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { studentLogin } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LogIn } from 'lucide-react';
import { Label } from '../ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Logging In...' : <><LogIn className="mr-2 h-4 w-4"/>Log In & Vote</>}
    </Button>
  );
}

export default function StudentLoginForm() {
  const [state, formAction] = useActionState(studentLogin, { success: false, message: '' });
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <Card className="shadow-md">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl">Student Voting Portal</CardTitle>
            <CardDescription>Enter your name and code to cast your vote.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.message && (
             <Alert variant={state.success ? 'default' : 'destructive'}>
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
            <Label htmlFor="code">Unique Voting Code</Label>
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="e.g. X7R9K2LQ"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
