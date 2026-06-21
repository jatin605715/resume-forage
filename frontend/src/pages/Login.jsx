import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Mail, Lock, ShieldCheck, Cpu, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left side panel - Welcome & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] flex-col justify-between p-12 border-r border-gray-900 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Top brand */}
        <div className="flex items-center gap-2 z-10">
          <div className="bg-white text-black p-2 rounded-lg font-black flex items-center justify-center">
            <FileText size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white">
            Resume<span className="text-gray-500 font-semibold">Forge</span>
          </span>
        </div>

        {/* Center welcome content */}
        <div className="max-w-md z-10 space-y-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Build ATS-Friendly Resumes in Seconds.
          </h2>
          <p className="text-gray-400 text-base leading-relaxed">
            Create high-quality, text-selectable, structural resumes that bypass automatic applicant screening filters and land you interviews.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-gray-900 text-white p-1 rounded-full border border-gray-800">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Parser Compliant</h4>
                <p className="text-xs text-gray-500">Pure PDF rendering preserves text layers, avoiding image-scanning filters.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 bg-gray-900 text-white p-1 rounded-full border border-gray-800">
                <Cpu size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">ATS-Optimized Formatting</h4>
                <p className="text-xs text-gray-500">Clean layouts and standard fonts ensure standard parser scanning formats.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-xs text-gray-600 flex items-center gap-1.5">
          <CheckCircle size={12} className="text-gray-500" />
          <span>Professional Resume Builder Platform</span>
        </div>
      </div>

      {/* Right side panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h3 className="text-3xl font-extrabold tracking-tight text-white">Sign In</h3>
            <p className="text-sm text-gray-500 mt-2">Enter your credentials to access your resumes</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-900/60 text-red-200 text-xs rounded-md">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-800 rounded-md pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-800 rounded-md pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-white hover:bg-gray-200 disabled:bg-gray-400 text-black font-bold rounded-md transition-colors text-sm flex items-center justify-center"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 pt-4">
            New to ResumeForge?{' '}
            <Link to="/signup" className="text-white hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
