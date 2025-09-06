'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { setElectionSchedule } from '@/lib/actions';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface ElectionTimerProps {
  initialStatus: {
    status: 'upcoming' | 'active' | 'ended' | 'not_set';
    start: Date | null;
    end: Date | null;
  };
}

export default function ElectionTimer({ initialStatus }: ElectionTimerProps) {
  const getInitialTime = (date: Date | null) => {
    if (!date) return '00:00';
    return format(new Date(date), 'HH:mm');
  };

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialStatus.start ? new Date(initialStatus.start) : undefined
  );
  const [startTime, setStartTime] = useState<string>(
    getInitialTime(initialStatus.start)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialStatus.end ? new Date(initialStatus.end) : undefined
  );
  const [endTime, setEndTime] = useState<string>(
    getInitialTime(initialStatus.end)
  );

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const combineDateTime = (date: Date | undefined, time: string): Date | null => {
    if (!date) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const handleSave = async () => {
    setIsLoading(true);
    const finalStartDate = combineDateTime(startDate, startTime);
    const finalEndDate = combineDateTime(endDate, endTime);

    const result = await setElectionSchedule(finalStartDate, finalEndDate);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Election schedule has been updated.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Election Schedule</CardTitle>
        <CardDescription>
          Set the start and end date and time for the voting period.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
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
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time (24h)</Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>End Date</Label>
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
           <div className="space-y-2">
            <Label htmlFor="end-time">End Time (24h)</Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading || !startDate || !endDate}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Schedule'}
        </Button>
      </CardContent>
    </Card>
  );
}