import React, { useState } from 'react';
import { useAuth } from './AuthContext';

// Keyframes are defined here for component-specific animations
const animationStyle = `
  @keyframes float-animation {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-25px) rotate(15deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
`;

const AuthAnimation: React.FC = () => (
    <div className="relative w-full h-full hidden md:flex items-center justify-center bg-light-surface dark:bg-cyber-surface/40 overflow-hidden">
        <style>{animationStyle}</style>
        {/* Animated Shapes */}
        <div
          className="absolute top-[10%] left-[15%] w-20 h-20 bg-cyber-cyan/10 rounded-full shadow-cyber-glow-cyan"
          style={{ animation: 'float-animation 8s ease-in-out infinite', animationDelay: '0s' }}
        />
        <div
          className="absolute bottom-[15%] right-[20%] w-16 h-16 border-2 border-cyber-magenta/50 rounded-lg"
          style={{ animation: 'float-animation 12s ease-in-out infinite', animationDelay: '-3s' }}
        />
        <div
          className="absolute bottom-[5%] left-[25%] w-8 h-8 bg-cyber-magenta/20"
          style={{ animation: 'float-animation 7s ease-in-out infinite', animationDelay: '-1.5s' }}
        />
         <div
          className="absolute top-[15%] right-[10%] w-12 h-12 border-2 border-cyber-cyan/40 rounded-full"
          style={{ animation: 'float-animation 10s ease-in-out infinite', animationDelay: '-5s' }}
        />
        <div
          className="absolute top-[60%] left-[5%] w-14 h-14 bg-cyber-cyan/5 rounded-xl"
          style={{ animation: 'float-animation 9s ease-in-out infinite', animationDelay: '-2s' }}
        />
         <div
          className="absolute bottom-[30%] right-[45%] w-6 h-6 bg-cyber-magenta/30 rounded-full"
          style={{ animation: 'float-animation 6s ease-in-out infinite', animationDelay: '-4s' }}
        />

        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-50">
          <div id="stars1" style={{backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"4\" height=\"4\"><circle cx=\"1\" cy=\"1\" r=\"0.5\" fill=\"rgba(200, 200, 255, 0.9)\"/></svg>')", animation: "stars-pulse 60s infinite linear"}}></div>
          <div id="stars2" style={{backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"8\" height=\"8\"><circle cx=\"3\" cy=\"5\" r=\"0.7\" fill=\"rgba(200, 200, 255, 0.8)\"/></svg>')", animation: "stars-pulse 40s infinite linear reverse"}}></div>
        </div>
        
         <h1 className="relative z-10 text-5xl font-bold text-light-cyan dark:text-cyber-cyan tracking-wider dark:drop-shadow-[0_0_15px_rgba(0,246,255,0.7)]">
            SYNTHETICA
        </h1>
    </div>
);


const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!email || !password) {
        setError('Email and password are required.');
        setLoading(false);
        return;
    }
    
    if (!isLogin && !name.trim()) {
        setError('Name is required for signup.');
        setLoading(false);
        return;
    }

    if (!isLogin && password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
    }

    try {
        if (isLogin) {
            const { success, message } = await login(email, password);
            if (!success) setError(message);
        } else {
            const { success, message } = await signup(email, password, name, phoneNumber);
            if (success) {
                setSuccessMessage(message);
                setIsLogin(true);
                setName('');
                setPhoneNumber('');
                setEmail('');
                setPassword('');
            } else {
                setError(message);
            }
        }
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-cyber-bg text-light-text dark:text-cyber-text flex">
        <div className="w-full flex flex-col md:grid md:grid-cols-2">
            <AuthAnimation />
            <div className="flex items-center justify-center p-6 sm:p-12">
                 <div className="w-full max-w-md">
                    <div className="text-center mb-8 md:hidden">
                        <h1 className="text-4xl font-bold text-light-cyan dark:text-cyber-cyan tracking-wider dark:drop-shadow-[0_0_8px_rgba(0,246,255,0.7)]">
                            SYNTHETICA
                        </h1>
                    </div>
                    <div className="bg-light-surface dark:bg-cyber-surface/50 backdrop-blur-lg border border-light-border dark:border-cyber-border/50 rounded-lg p-8 shadow-lg dark:shadow-cyber-cyan/10 animate-fade-in-up">
                        <h2 className="text-2xl font-bold mb-1">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="text-light-text-secondary dark:text-cyber-text-secondary mb-6">{isLogin ? 'Sign in to access your dashboard.' : 'Join the fight against misinformation.'}</p>
                        
                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <>
                                    <div className="mb-4">
                                        <label htmlFor="name" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Jane Doe"
                                            className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="phone" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Phone Number (Optional)</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="(123) 456-7890"
                                            className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition"
                                            disabled={loading}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="password" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {error && <p className="text-red-500 dark:text-cyber-red text-sm mb-4 text-center">{error}</p>}
                            {successMessage && <p className="text-green-500 dark:text-cyber-green text-sm mb-4 text-center">{successMessage}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full hologram-button px-8 py-3 font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white/50 dark:border-cyber-bg/50 border-t-white dark:border-t-cyber-bg rounded-full animate-spin"></div>
                                ) : (isLogin ? 'Log In' : 'Sign Up')}
                            </button>
                        </form>

                        <p className="text-center text-sm mt-6 text-light-text-secondary dark:text-cyber-text-secondary">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }} className="font-bold text-light-cyan dark:text-cyber-cyan hover:underline ml-1">
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default AuthPage;