import StudentLoginForm from '@/components/auth/StudentLoginForm';
import Logo from '@/components/Logo';

export default function StudentLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Student Voting Portal</h1>
        <p className="text-muted-foreground text-center mb-6">Log in to cast your vote for the Class Representative.</p>
        <StudentLoginForm />
      </div>
    </main>
  );
}
