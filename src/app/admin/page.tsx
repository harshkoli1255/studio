import AdminDashboard from '@/components/admin/AdminDashboard';
import { db } from '@/lib/data';

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const candidates = db.getCandidates();
  const totalVotes = db.getTotalVotes();
  const voters = db.getUsers();
  
  return (
    <AdminDashboard 
      initialCandidates={candidates}
      initialTotalVotes={totalVotes}
      initialVoters={voters}
    />
  );
}
