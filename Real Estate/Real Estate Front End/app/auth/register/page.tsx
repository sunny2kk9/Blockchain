import { Metadata } from 'next'
import Image from 'next/image';
import RegisterForm from '@/app/components/auth/registerForm';
 
export const metadata: Metadata = {
  title: 'Register',
}
 
export default function Register() {
  return (
    <main className="min-h-screen flex">
    <div className="w-1/2 relative">
      <Image src="https://i.ibb.co/GQ0w7ZL/kc.jpg" alt="Co Estate" layout="fill" objectFit="cover" />
    </div>
    <div className="w-1/2">
      <RegisterForm />
    </div>
  </main>
  );
}