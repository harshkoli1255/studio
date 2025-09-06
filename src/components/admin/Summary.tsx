'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { generateSummary } from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';

export default function Summary() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    const result = await generateSummary();
    setSummary(result.summary);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
                <CardTitle>Election Insights</CardTitle>
                <CardDescription>Get an AI-powered summary of the results.</CardDescription>
            </div>
            <Button onClick={handleGenerateSummary} disabled={isLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate Summary'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )}
        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
        {!summary && !isLoading && (
             <p className="text-sm text-center text-muted-foreground py-8">Click "Generate Summary" to see insights here.</p>
        )}
      </CardContent>
    </Card>
  );
}
