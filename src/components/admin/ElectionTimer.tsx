'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { setElectionSchedule } from '@/lib/actions';

interface ElectionTimerProps {
  initialStatus: {
    status: 'upcoming' | 'active' | 'ended' | 'not_set';
    start: Date | null;
    end: Date | null;
  }
}

export default function ElectionTimer({ initialStatus }: ElectionTimerProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(initialStatus.start ? new Date(initialStatus.start) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(initialStatus.end ? new Date(initialStatus.end) : undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    const result = await setElectionSchedule(startDate ?? null, endDate ?? null);
    if(result.success) {
      toast({
        title: "Success",
        description: "Election schedule has been updated.",
      });
    } else {
        toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
        })
    }
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Election Schedule</CardTitle>
        <CardDescription>
          Set the start and end dates for the voting period. The election will only be active between these two dates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <p className="font-medium text-sm">Start Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-2">
          <p className="font-medium text-sm">End Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleSave} disabled={isLoading || !startDate || !endDate} className="w-full">
            {isLoading ? 'Saving...' : 'Save Schedule'}
        </Button>
      </CardContent>
    </Card>
  );
}
