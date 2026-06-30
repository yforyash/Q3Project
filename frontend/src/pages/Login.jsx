import React, { useState } from 'react';
import { useAuth } from '../App';
import api from '../utils/api';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, User, Phone, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { loginUser } = useAuth();
  const [mode, setMode] = useState('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const getErrorMsg = (err, fallback) => {
    if (!err.response) return 'Cannot connect to server. Please ensure the backend is running.';
    if (err.response.data?.error) return err.response.data.error;
    if (err.response.data?.errors && Array.isArray(err.response.data.errors)) {
      return err.response.data.errors.map(e => e.msg).join(', ');
    }
    return fallback;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        remember_me: rememberMe
      });
      loginUser(res.data.user, res.data.token);
    } catch (err) {
      setError(getErrorMsg(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/signup', {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      });
      setSuccess('Account created successfully! You can now sign in.');
      setMode('login');
      setPassword('');
    } catch (err) {
      setError(getErrorMsg(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', {
        email,
        otp
      });
      setSuccess('Email verified successfully! You can now log in.');
      setMode('login');
      setPassword('');
      setOtp('');
    } catch (err) {
      setError(getErrorMsg(err, 'OTP verification failed. Please check the code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('If the email exists, a 6-digit password reset OTP has been sent.');
      setOtp('');
      setMode('verify_reset');
    } catch (err) {
      setError(getErrorMsg(err, 'Failed to send password reset code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-reset-otp', { email, otp });
      setSuccess('OTP verified successfully. Please enter your new password.');
      setPassword('');
      setMode('new_password');
    } catch (err) {
      setError(getErrorMsg(err, 'OTP verification failed. Please check the code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, password });
      setSuccess('Password reset successfully! You can now log in.');
      setPassword('');
      setMode('login');
    } catch (err) {
      setError(getErrorMsg(err, 'Failed to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#090d16] px-4 overflow-y-auto py-8">
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-slate-500/10 blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-md rounded-xl border border-slate-800 bg-[#0f172a]/80 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-650/20 text-blue-500 border border-blue-500/20 mb-3 shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Q3 Enterprise Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Sign in to manage inventory and orders'}
            {mode === 'signup' && 'Create a new user account'}
            {mode === 'verify' && 'Verify your email address'}
            {mode === 'forgot' && 'Reset your account password'}
            {mode === 'verify_reset' && 'Enter password reset code'}
            {mode === 'new_password' && 'Enter your new password'}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-400">
            {success}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-400 select-none">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              >
                Don't have an account? Sign Up
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">First Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Last Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone Number (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Phone size={16} />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-9 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <p className="text-xs text-slate-300 mb-3 text-center">
                Enter the verification code sent to <strong className="text-white">{email}</strong>
              </p>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-3 text-center text-lg font-bold tracking-widest text-white placeholder-slate-650 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.post('/auth/resend-otp', { email, purpose: 'signup' });
                    setSuccess('A new OTP has been dispatched to your email.');
                  } catch (err) {
                    setError(err.response?.data?.error || 'Failed to resend OTP.');
                  }
                }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline mr-4"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className="text-xs text-slate-400 hover:text-white hover:underline"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {mode === 'verify_reset' && (
          <form onSubmit={handleVerifyResetOtp} className="space-y-5">
            <div>
              <p className="text-xs text-slate-300 mb-3 text-center">
                Enter the password reset code sent to <strong className="text-white">{email}</strong>
              </p>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-3 text-center text-lg font-bold tracking-widest text-white placeholder-slate-650 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {mode === 'new_password' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900/90"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
