'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { getUsers, login } from '@/core/api/auth';
import useUserStore from '@/store/user.store';
import useUsersStore from '@/store/users.store';
import { useRouter } from 'next/navigation';
import User from '@/interfaces/user.interface';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const userStore = useUserStore();
  const usersStore = useUsersStore();
  const [email, setEmail] = useState('');

  useEffect(() => {
    getUsers()
      .then(response => {
        console.log('Response:', response);
        usersStore.setUsers(response?.output);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email) {
      let user = usersStore.users.find(u => u.email == email || u.name == email);

      if (user?.id && user?.email) {
        console.log(user);
        
        login(user?.id)
          .then(response => {
            console.log('Response:', response);
            userStore.setUser(response?.output);

            if (response?.output?.id) {
              router.push('/');
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8  bg-white">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className='mb-4'>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          <div className='mb-3'>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
          <p className='text-center'>
            <span className='mr-2'>Don't have an account?</span>
            <Link className='text-blue-500' href="/auth/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
