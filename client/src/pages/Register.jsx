import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { User, Mail, Lock } from 'lucide-react';
import appLogo from '../assets/logo.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await register({ name, email, password });
      showSuccess('Account created! Welcome to My Little Planner 🌸');
      navigate('/');
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-planner-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-planner-card rounded-3xl p-8 border border-planner-border shadow-cozy-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-planner-secondary flex items-center justify-center mx-auto mb-4 p-2.5 shadow-sm border border-planner-border">
            <img src={appLogo} alt="My Little Planner Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-planner-text tracking-tight">Create Account</h1>
          <p className="text-sm text-planner-muted mt-1 leading-relaxed">
            Start organizing your days with peace & clarity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Name"
            placeholder="Harshita"
            leftIcon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            leftIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
            Create Account <Sparkles className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-planner-border">
          <p className="text-sm text-planner-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-planner-primary hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
