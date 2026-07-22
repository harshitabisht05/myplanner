import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, Lock, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter email and password');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
      showSuccess('Welcome back! 🌸');
      navigate('/');
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-planner-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-planner-card rounded-3xl p-8 border border-planner-border shadow-cozy-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-planner-secondary text-planner-primary flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
            🌸
          </div>
          <h1 className="text-2xl font-bold text-planner-text tracking-tight">Welcome Back</h1>
          <p className="text-sm text-planner-muted mt-1 leading-relaxed">
            Log in to access your cozy personal planner
          </p>
        </div>

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

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-planner-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
            Log In <Sparkles className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-planner-border">
          <p className="text-sm text-planner-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-planner-primary hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
