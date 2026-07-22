import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      showSuccess('Password reset successfully! You are now logged in. 🌸');
      navigate('/');
    } catch (err) {
      showError(err.message || 'Password reset failed. Token may be invalid or expired.');
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
            🔐
          </div>
          <h1 className="text-2xl font-bold text-planner-text tracking-tight">Create New Password</h1>
          <p className="text-sm text-planner-muted mt-1 leading-relaxed">
            Choose a strong password to protect your planner.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            leftIcon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
            Set New Password <CheckCircle className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
