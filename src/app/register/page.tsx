'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password) {
      return 'Please fill in all required fields';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }
    try {
      const result = await register(formData.email, formData.password, formData.name.trim() || undefined);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-black dark:text-white">Create Your Vault</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Join Password Vault to secure your passwords</p>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-50 dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (<div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">{error}</div>)}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black dark:text-white">Full Name (Optional)</label>
              <div className="mt-1">
                <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} disabled={isLoading} className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-black dark:text-white" placeholder="Enter your full name" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white">Email address *</label>
              <div className="mt-1">
                <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required disabled={isLoading} className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-black dark:text-white" placeholder="Enter your email" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black dark:text-white">Password *</label>
              <div className="mt-1">
                <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required disabled={isLoading} className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-black dark:text-white" placeholder="Choose a strong password" />
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Minimum 6 characters required</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black dark:text-white">Confirm Password *</label>
              <div className="mt-1">
                <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required disabled={isLoading} className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-black dark:text-white" placeholder="Confirm your password" />
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border border-blue-200 dark:border-blue-700">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800 dark:text-blue-300"><strong>Privacy First:</strong> Your passwords are encrypted on your device before being sent to our servers. We never see your data in plain text.</p>
                </div>
              </div>
            </div>
            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Creating account...' : 'Create account'}</button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">Already have an account?</span></div>
            </div>
            <div className="mt-6">
              <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sign in instead</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400"> End-to-end encrypted   Zero-knowledge architecture</p>
      </div>
    </div>
  );
};

export default RegisterPage;
