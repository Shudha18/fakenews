import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 flex items-center justify-center rounded-full text-light-text-secondary dark:text-cyber-text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300"
      aria-label={isDark ? 'Activate light mode' : 'Activate dark mode'}
    >
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Sun and Rays */}
        <g 
          className={`transform transition-transform duration-500 ease-in-out ${isDark ? 'rotate-45' : 'rotate-0'}`}
        >
          <circle cx="12" cy="12" r="5" className={`transition-all duration-500 ease-in-out ${isDark ? 'fill-transparent' : 'fill-current'}`}/>
          <g className={`transition-opacity duration-300 ${isDark ? 'opacity-0 animate-none' : 'opacity-100 animate-sun-spin'}`}>
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </g>

        {/* Moon */}
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          className={`transform transition-all duration-500 ease-in-out ${isDark ? 'opacity-100' : 'opacity-0 -rotate-90 scale-50'}`}
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

export default ThemeToggle;
