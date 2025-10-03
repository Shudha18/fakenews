import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length < 50) {
      setError('Please enter at least 50 characters of text to analyze.');
      return;
    }
    setError('');
    onSubmit(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Paste the news article text or URL here... (minimum 50 characters)"
          className="w-full h-48 p-4 bg-light-surface dark:bg-cyber-surface/70 border-2 border-light-border dark:border-cyber-border/50 rounded-lg text-light-text-secondary dark:text-cyber-text-secondary focus:outline-none focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan dark:focus:border-cyber-cyan/0 transition-all resize-none placeholder:text-light-text-secondary/60 dark:placeholder:text-cyber-text-secondary/50 dark:backdrop-blur-sm"
          disabled={isLoading}
          aria-label="Article text input"
        />
        {error && <p className="text-red-500 dark:text-cyber-red text-sm mt-2 text-center">{error}</p>}
      </div>
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          className="hologram-button px-8 py-3 font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Text'}
        </button>
      </div>
    </form>
  );
};

export default InputForm;