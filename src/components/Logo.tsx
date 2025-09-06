import { Vote } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Vote className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold tracking-tight">CR Vote</span>
    </div>
  );
}
