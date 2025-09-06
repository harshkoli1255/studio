import AdminDashboard from '@/components/admin/AdminDashboard';
import { db } from '@/lib/data';
import ElectionResults from '@/components/student/ElectionResults';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const candidates = db.getCandidates();
  const totalVotes = db.getTotalVotes();
  const voters = db.getUsers();
  const electionStatus = db.getElectionStatus();
  
  if (electionStatus.status === 'ended') {
    return <ElectionResults candidates={candidates} totalVotes={totalVotes} />;
  }
  
  return (
    <AdminDashboard 
      initialCandidates={candidates}
      initialTotalVotes={totalVotes}
      initialVoters={voters}
      initialElectionStatus={electionStatus}
    />
  );
}
