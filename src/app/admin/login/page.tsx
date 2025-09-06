import AdminLoginForm from '@/components/auth/AdminLoginForm';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Admin Panel</h1>
        <p className="text-muted-foreground text-center mb-6">Enter the password to manage the election.</p>
        <AdminLoginForm />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Not an admin?{' '}
          <Link href="/" className="underline text-primary">
            Go to student voting.
          </Link>
        </p>
      </div>
    </main>
  );
}
