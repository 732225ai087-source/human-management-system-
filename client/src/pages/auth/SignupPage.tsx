import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export const SignupPage: React.FC = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength];
  const strengthColor = ['', 'bg-danger-500', 'bg-warning-500', 'bg-warning-500', 'bg-success-500', 'bg-success-500'][strength];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName) errs.firstName = 'First name is required';
    if (!form.lastName) errs.lastName = 'Last name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Must contain an uppercase letter';
    else if (!/[a-z]/.test(form.password)) errs.password = 'Must contain a lowercase letter';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Must contain a number';
    else if (!/[^A-Za-z0-9]/.test(form.password)) errs.password = 'Must contain a special character';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await signup({
        email: form.email,
        password: form.password,
        role: 'EMPLOYEE',
        firstName: form.firstName,
        lastName: form.lastName,
      });
      toast.success(result.message || 'Account created! Check your email to verify.');
      navigate('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-600 via-primary-700 to-primary-800 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <h1 className="text-5xl font-bold text-white mb-6">Join Dayflow</h1>
          <p className="text-xl text-primary-100 leading-relaxed">
            Create your account and start managing your work life efficiently.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-surface-900">Create Account</h2>
            <p className="text-surface-500 mt-2">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange('firstName')}
                error={errors.firstName}
                icon={<HiOutlineUser className="w-5 h-5" />}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange('lastName')}
                error={errors.lastName}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              icon={<HiOutlineMail className="w-5 h-5" />}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                icon={<HiOutlineLockClosed className="w-5 h-5" />}
              />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength ? strengthColor : 'bg-surface-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-surface-500">{strengthLabel}</p>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              icon={<HiOutlineLockClosed className="w-5 h-5" />}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
