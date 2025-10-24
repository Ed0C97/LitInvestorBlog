// LitInvestorBlog-frontend/src/pages/CompleteProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { User } from 'lucide-react';

const CompleteProfilePage = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, checkAuthStatus } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username is required.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/complete-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed.');
      }

      await checkAuthStatus();
      toast.success('Profile completed! Welcome!');
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-[3rem] px-[1rem]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[1.25rem] bg-white-white p-[2rem] w-full max-w-[450px] rounded-[28px] shadow-sm">
        <div className="text-center mb-[0.5rem]">
          <h1 className="text-2xl font-bold text-antracite">Complete Your Profile</h1>
          <p className="text-dark-gray mt-[0.5rem]">
            Choose a username to continue.
          </p>
        </div>

        <div className="flex flex-col gap-[0.25rem]">
          <Label htmlFor="username">Username *</Label>
          <div className="flex items-center border border-input-gray rounded-xl h-[3rem] px-[0.75rem] focus-within:border-blue transition-colors">
            <User size={20} className="text-dark-gray" />
            <Input
              id="username"
              name="username"
              placeholder="Choose your username"
              className="ml-[0.75rem] flex-1 bg-transparent border-0 outline-none text-antracite placeholder:text-placeholder shadow-none"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="mt-[0.5rem] bg-antracite text-white-white rounded-xl h-[3rem]" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save and Continue'}
        </Button>
      </form>
    </div>
  );
};

export default CompleteProfilePage;
