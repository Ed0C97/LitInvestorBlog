// LitInvestorBlog-frontend/src/pages/RegisterPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { User, Lock, Mail, Loader, CheckCircle, XCircle, IdCard, Eye, EyeOff } from 'lucide-react';
import { GoogleIcon, AppleIcon } from '../components/ui/SocialAuthIcons';
import GlassCard from '../components/ui/glassCard';
import FadeInOnScroll from '../components/FadeInOnScroll'; // <-- AGGIUNGI QUESTA RIGA

const RegisterPage = () => {
  // ... (tutta la logica del componente rimane invariata)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({
    loading: false,
    available: null,
    message: '',
  });
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsername(formData.username);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [formData.username]);

  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (debouncedUsername.length < 3) {
        setUsernameStatus({ loading: false, available: null, message: '' });
        return;
      }

      setUsernameStatus({ loading: true, available: null, message: '' });
      try {
        const response = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: debouncedUsername }),
        });
        const data = await response.json();
        setUsernameStatus({ loading: false, available: data.available, message: data.message });
      } catch {
        setUsernameStatus({ loading: false, available: false, message: 'Error checking username.' });
      }
    };

    if (debouncedUsername) {
      checkUsernameAvailability();
    }
  }, [debouncedUsername]);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'no_account') {
      setError('No account found. Please complete the registration.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
    });

    if (!result.success) {
      setError(result.error || 'Error during registration');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-login-texture-dark_2 bg-cover bg-center py-[2rem] sm:py-[3rem]">

      {/* === BLOCCO TITOLO CON ANIMAZIONE === */}
      <FadeInOnScroll>
        <div className="w-full mb-[6rem] sm:mb-[8rem]">
          <div className="max-w-[1012px] mx-auto px-[1rem]">
            <div className="border-b border-input-gray my-[0.5rem]"></div>
            <h2 className="text-xl sm:text-2xl font-regular text-white/90">Register</h2>
          </div>
        </div>
      </FadeInOnScroll>

      {/* === BLOCCO FORM CON ANIMAZIONE E DELAY === */}
      <FadeInOnScroll delay={100}>
        <div className="flex justify-center px-[1rem]">
          <GlassCard
            as="form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-[1.25rem] w-full max-w-[600px] px-[1.5rem] sm:px-[2rem] py-[2rem] sm:py-[2.5rem]"
          >
            {/* --- Header --- */}
            <div className="text-center mb-[0.5rem] sm:mb-[1rem]">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-[0.5rem] text-white">Create an Account</h1>
              <p className="text-white/80 text-sm sm:text-base">Join us to start your financial journey</p>
            </div>

            {error && (
              <Alert variant="red">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* ... resto del form ... */}
            {/* --- Input Username --- */}
            <div className="flex flex-col gap-[0.5rem]">
              <Label htmlFor="username" className="text-white/80 font-medium">Username *</Label>
              <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                <User size={20} className="text-white/50" />
                <input id="username" name="username" placeholder="Choose a unique username" className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light" type="text" value={formData.username} onChange={handleChange} required />
                {usernameStatus.loading && <Loader className="animate-spin w-[1rem] h-[1rem] text-gray" />}
                {usernameStatus.available === true && <CheckCircle className="w-[1rem] h-[1rem] text-green" />}
                {usernameStatus.available === false && <XCircle className="w-[1rem] h-[1rem] text-red" />}
              </div>
              {usernameStatus.message && (
                <p className={`text-xs mt-[0.25rem] ${usernameStatus.available ? 'text-green' : 'text-red'}`}>
                  {usernameStatus.message}
                </p>
              )}
            </div>

            {/* --- Input Email --- */}
            <div className="flex flex-col gap-[0.5rem]">
              <Label htmlFor="email" className="text-white/80 font-medium">Email *</Label>
              <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                <Mail size={20} className="text-white/50" />
                <input id="email" name="email" placeholder="Enter your email" className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light" type="email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            {/* --- Input First & Last Name --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem]">
              <div className="flex flex-col gap-[0.5rem]">
                <Label htmlFor="first_name" className="text-white/80 font-medium">First Name</Label>
                <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                  <IdCard size={20} className="text-white/50" />
                  <input id="first_name" name="first_name" placeholder="Your first name" className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light" type="text" value={formData.first_name} onChange={handleChange} />
                </div>
              </div>
              <div className="flex flex-col gap-[0.5rem]">
                <Label htmlFor="last_name" className="text-white/80 font-medium">Last Name</Label>
                <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                  <IdCard size={20} className="text-white/50" />
                  <input id="last_name" name="last_name" placeholder="Your last name" className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light" type="text" value={formData.last_name} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* --- Input Password --- */}
            <div className="flex flex-col gap-[0.5rem]">
              <Label htmlFor="password" className="text-white/80 font-medium">Password *</Label>
              <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                <Lock size={20} className="text-white/50" />
                <input
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* --- Input Confirm Password --- */}
            <div className="flex flex-col gap-[0.5rem]">
              <Label htmlFor="confirmPassword" className="text-white/80 font-medium">Confirm Password *</Label>
              <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                <Lock size={20} className="text-white/50" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-white/50 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* --- Pulsante Sign Up --- */}
            <Button
              type="submit"
              variant="dark"
              size="lg"
              className="mt-[1rem] w-full min-h-[48px]"
              disabled={loading || usernameStatus.available === false}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <p className="text-center text-sm text-white/60 my-[0.5rem]">Or sign up with</p>

            {/* --- Pulsanti Social --- */}
            <div className="flex flex-col sm:flex-row items-center gap-[0.75rem] sm:gap-[1rem]">
              <Button asChild variant="outline-yellow" size="lg" className="group w-full sm:flex-1 h-[3rem] min-h-[48px]">
                <a href="http://localhost:5000/api/auth/google/login">
                  <GoogleIcon />
                  <span className="ml-[0.5rem]">Google</span>
                </a>
              </Button>
              <Button variant="outline-white" size="lg" className="group w-full sm:flex-1 h-[3rem] min-h-[48px]" disabled>
                <AppleIcon />
                <span className="ml-[0.5rem]">Apple</span>
              </Button>
            </div>

            {/* --- Link a Sign In --- */}
            <p className="text-center text-sm text-white/80 mt-[1rem]">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </GlassCard>
        </div>
      </FadeInOnScroll>
    </div>
  );
};

export default RegisterPage;