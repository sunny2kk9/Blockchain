import { Metadata } from 'next'
import Image from 'next/image';
import LoginForm from '@/app/components/auth/loginForm';

export const metadata: Metadata = {
  title: 'Login',
}

export default function Login() {
  return (
    <main className="min-h-screen flex">
      <div className="w-1/2 relative">
        <Image src="https://i.ibb.co/2vBhHDx/bk.jpg" alt="Co Estate" layout="fill" objectFit="cover" />
      </div>
      <div className="w-1/2">
        <LoginForm />
      </div>
    </main>
  );
}
