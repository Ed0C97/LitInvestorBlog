// LitInvestorBlog-frontend/src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleIcon, AppleIcon } from '../components/ui/SocialAuthIcons';
import GlassCard from '../components/ui/GlassCard';
import { Checkbox } from '../components/ui/checkbox';
import FadeInOnScroll from '../components/FadeInOnScroll';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'account_exists') {
      setError('An account with this email already exists. Please sign in.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData);
    if (!result.success) {
      setError(result.error || 'Error during login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-login-texture-dark_2 bg-cover bg-center py-[2rem] sm:py-[3rem]">

      {/* === BLOCCO TITOLO CON ANIMAZIONE === */}
      <FadeInOnScroll>
        <div className="w-full mb-[8rem] sm:mb-[12rem] md:mb-[14rem]">
          <div className="max-w-[1012px] mx-auto px-[1rem]">
            <div className="border-b border-input-gray my-[0.5rem]"></div>
            <h2 className="text-xl sm:text-2xl font-regular text-white/90">Sign In</h2>
          </div>
        </div>
      </FadeInOnScroll>

      {/* === BLOCCO FORM CON ANIMAZIONE E DELAY === */}
      <FadeInOnScroll delay={100}>
        <div className="flex justify-center px-[1rem]">
          <GlassCard
            as="form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-[1.25rem] w-full max-w-[550px] px-[1.5rem] sm:px-[2rem] py-[2rem] sm:py-[2.5rem]"
          >
            {/* --- Header --- */}
            <div className="text-center mb-[0.5rem] sm:mb-[1rem]">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-[0.5rem] text-white">Sign In</h1>
              <p className="text-white/80 text-sm sm:text-base">Enter your credentials to access your account</p>
            </div>

            {error && (
              <Alert variant="red">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* --- Input Username --- */}
            <div className="flex flex-col gap-[0.5rem]">
              <Label htmlFor="username" className="text-white/80 font-medium">Username</Label>
              <div className="flex items-center border-b border-white/20 h-[3rem] sm:h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                <User size={20} className="text-white/50" />
                <input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light text-base"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* --- Input Password --- */}
            <div className="flex flex-col gap-[0.5rem]">
              <Label htmlFor="password" className="text-white/80 font-medium">Password</Label>
              <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                <Lock size={20} className="text-white/50" />
                <input
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light text-base"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/50 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* --- Remember Me & Forgot Password --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[0.75rem] text-sm mt-[0.5rem]">
              <Checkbox
                id="remember-me"
                label="Remember me"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                classNameLabel="text-white"
              />
              <Link to="/forgot-password" className="text-yellow hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="dark"
              size="lg"
              className="mt-[1rem] w-full min-h-[48px]"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-white/80 mt-[1rem]">
              Don't have an account?{' '}
              <Link to="/register" className="text-yellow hover:underline font-semibold">
                Sign Up
              </Link>
            </p>

            <p className="text-center text-sm text-white/60 my-[0.5rem]">Or sign in with</p>

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
          </GlassCard>
        </div>
      </FadeInOnScroll>
    </div>
  );
};

export default LoginPage;