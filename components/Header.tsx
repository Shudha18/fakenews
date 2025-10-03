import React from 'react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthContext';
import { ProfileIcon } from './icons/UtilityIcons';
import { Logo } from './icons/Logo';
import type { Page } from '../App';

interface HeaderProps {
  page: Page;
  setPage: (page: Page) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ page, setPage, theme, toggleTheme }) => {
  const { currentUser } = useAuth();

  return (
    <header className="relative flex items-center justify-between py-4 backdrop-blur-sm border-b border-light-border/20 dark:border-cyber-border/20">
      <div 
        className="relative z-10 flex items-center gap-3 cursor-pointer"
        onClick={() => setPage('home')}
        aria-label="Go to home page"
      >
        <svg width="0" height="0" className="absolute">
            <defs>
                 <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="text-light-cyan dark:text-cyber-cyan" stopColor="currentColor" />
                    <stop offset="100%" className="text-light-magenta dark:text-cyber-magenta" stopColor="currentColor" />
                </linearGradient>
            </defs>
        </svg>
        <Logo className="h-8 w-8" />
        <h1 className="text-2xl sm:text-3xl font-bold text-light-cyan dark:text-cyber-cyan tracking-wider dark:drop-shadow-[0_0_10px_rgba(0,246,255,0.7)] transition-colors duration-300">
          SYNTHETICA
        </h1>
      </div>
      <nav className="relative z-10 flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
            {currentUser && (
                <span className="text-sm hidden md:block text-light-text-secondary dark:text-cyber-text-secondary truncate max-w-[150px]">
                    Hi, {currentUser.name}
                </span>
            )}
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button
                onClick={() => setPage('profile')}
                title="View Profile"
                className="p-1.5 text-light-text-secondary dark:text-cyber-text-secondary rounded-full hover:bg-black/10 dark:hover:bg-white/10 hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors"
                aria-label="View user profile"
            >
                {currentUser?.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="User profile" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <ProfileIcon className="h-6 w-6" />
                )}
            </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
