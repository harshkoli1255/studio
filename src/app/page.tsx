import StudentLoginForm from '@/components/auth/StudentLoginForm';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function StudentLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <StudentLoginForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Are you an admin?{' '}
          <Link href="/admin" className="underline text-primary hover:text-primary/80">
            Go to Admin Panel
          </Link>
        </p>
      </div>
    </div>
  );
}
