import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import type { ApiResponse } from '../../types/api';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await apiClient.get<ApiResponse>(`/auth/verify-email/${token}`);
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(response.data.error || 'Verification failed');
        }
      } catch {
        setStatus('error');
        setMessage('Invalid or expired verification link');
      }
    };

    if (token) verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <LoadingSpinner size="lg" text="Verifying your email..." />
        )}

        {status === 'success' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-success-50 flex items-center justify-center mb-6">
              <HiCheckCircle className="w-10 h-10 text-success-500" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 mb-2">Email Verified!</h2>
            <p className="text-surface-500 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-danger-50 flex items-center justify-center mb-6">
              <HiXCircle className="w-10 h-10 text-danger-500" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 mb-2">Verification Failed</h2>
            <p className="text-surface-500 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-surface-100 text-surface-700 font-medium hover:bg-surface-200 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
