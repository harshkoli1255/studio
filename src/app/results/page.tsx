import { db } from '@/lib/data';
import ElectionResults from '@/components/student/ElectionResults';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const candidates = db.getCandidates();
  const totalVotes = db.getTotalVotes();
  
  return <ElectionResults candidates={candidates} totalVotes={totalVotes} />;
}
