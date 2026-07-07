import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { Lock, Mail, Loader2 } from 'lucide-react'; 
import Logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Verifying identity matrix...');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authorization system mapping failed.');
            }

            // Store critical authorization objects inside application landscape
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);

            toast.success(`Welcome back, authorized ${data.user.role}!`, { id: toastId });

            // Role Based UI Routing
            if (data.user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (error) {
            toast.error(error.message || 'Network communication fault encountered.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="text-3xl font-black text-white tracking-tight antialiased">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    Enter your authorized credentials to proceed
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200/50">
                    
                    {/* Branding Header Layout Section */}
                    <div className="flex flex-col items-center justify-center gap-2 mb-8 border-b border-slate-100 pb-5">
                        <img
                            className="h-11 w-auto object-contain"
                            src={Logo}
                            alt="AVG Logo"
                        />
                        <span className="text-xl text-center font-black tracking-wider text-slate-900">
                            AVG SALARY MANAGEMENT SYSTEM
                        </span>
                    </div>

                    {/* Interactive Input Form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Mail size={16} />
                                </span>
                                <input
                                    type="email"
                                    required
                                    disabled={loading}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                Account Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Lock size={16} />
                                </span>
                                <input
                                    type="password"
                                    required
                                    disabled={loading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Extra Form Management Elements */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500/30 border-slate-300 rounded-lg cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-slate-600 cursor-pointer select-none">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        {/* Submit Action Access Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all shadow-indigo-600/10 disabled:opacity-75 active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Authenticating Node...</span>
                                </>
                            ) : (
                                <span>Sign In to System</span>
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Login;