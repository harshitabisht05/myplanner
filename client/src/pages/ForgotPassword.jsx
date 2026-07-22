import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await authApi.forgotPassword(email);
      if (res.success) {
        setMessage(res.message || 'Password reset link has been sent to your email.');
      }
    } catch (err) {
      setError(err.message || 'Error processing request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-planner-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-planner-card rounded-3xl p-8 border border-planner-border shadow-cozy-lg">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-planner-muted hover:text-planner-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-planner-secondary text-planner-primary flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-planner-text tracking-tight">Reset Password</h1>
          <p className="text-sm text-planner-muted mt-1 leading-relaxed">
            Enter your registered email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            leftIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
            Send Reset Link <Send className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
