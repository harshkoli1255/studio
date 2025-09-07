import AdminLoginForm from '@/components/auth/AdminLoginForm';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <AdminLoginForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Not an admin?{' '}
          <Link href="/" className="underline text-primary hover:text-primary/80">
            Go to student voting
          </Link>
        </p>
      </div>
    </div>
  );
}
