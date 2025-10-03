import React from 'react';

// New, more attractive loader for text/general analysis
const TextAnalysisLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center my-10" aria-label="Loading analysis">
        <svg viewBox="0 0 100 80" className="w-32 h-32">
            <defs>
                <filter id="glow-loader-cyan">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <style>
                    {`
                    @keyframes flow-in-1 {
                        0% { transform: translateX(-30px); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateX(0px); opacity: 0; }
                    }
                    @keyframes flow-in-2 {
                        0% { transform: translateX(-40px); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateX(0px); opacity: 0; }
                    }
                     @keyframes flow-in-3 {
                        0% { transform: translateX(30px); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateX(0px); opacity: 0; }
                    }
                    @keyframes flow-in-4 {
                        0% { transform: translateX(40px); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateX(0px); opacity: 0; }
                    }
                    .line-1 { animation: flow-in-1 2.5s infinite ease-in-out; }
                    .line-2 { animation: flow-in-2 2.5s infinite ease-in-out; animation-delay: 0.2s; }
                    .line-3 { animation: flow-in-2 2.5s infinite ease-in-out; animation-delay: 0.4s; }
                    .line-4 { animation: flow-in-3 2.5s infinite ease-in-out; animation-delay: 0.6s; }
                    .line-5 { animation: flow-in-4 2.5s infinite ease-in-out; animation-delay: 0.8s; }
                    .line-6 { animation: flow-in-4 2.5s infinite ease-in-out; animation-delay: 1.0s; }
                    `}
                </style>
            </defs>
            {/* Central Core */}
            <circle cx="50" cy="40" r="10" className="fill-light-cyan dark:fill-cyber-cyan" filter="url(#glow-loader-cyan)" />
            <circle cx="50" cy="40" r="14" className="fill-transparent stroke-light-cyan/50 dark:stroke-cyber-cyan/50 stroke-2 animate-pulse" />
            
            {/* Text Lines Flowing In */}
            <g className="fill-light-text-secondary dark:fill-cyber-text-secondary">
                <rect x="20" y="25" width="20" height="2" rx="1" className="line-1" />
                <rect x="10" y="35" width="30" height="2" rx="1" className="line-2" />
                <rect x="20" y="45" width="20" height="2" rx="1" className="line-3" />
                <rect x="60" y="28" width="20" height="2" rx="1" className="line-4" />
                <rect x="70" y="38" width="20" height="2" rx="1" className="line-5" />
                <rect x="60" y="48" width="30" height="2" rx="1" className="line-6" />
            </g>
        </svg>
        <p className="mt-8 text-light-text-secondary dark:text-cyber-text-secondary tracking-widest animate-pulse">ANALYZING...</p>
    </div>
);


// New loader for image analysis
const ImageAnalysisLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center my-10" aria-label="Analyzing image">
        <div className="relative w-48 h-48 border-2 border-light-border dark:border-cyber-border/50 rounded-lg bg-light-surface/20 dark:bg-cyber-surface/30 overflow-hidden flex items-center justify-center backdrop-blur-sm">
            {/* Placeholder icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-light-border dark:text-cyber-border/70 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {/* Scan line */}
            <div className="absolute left-0 w-full h-1.5 bg-light-cyan dark:bg-cyber-cyan shadow-cyber-glow-cyan animate-scan-line-anim"></div>
        </div>
        <p className="mt-8 text-light-text-secondary dark:text-cyber-text-secondary tracking-widest animate-pulse">SCANNING IMAGE...</p>
    </div>
);


interface LoaderProps {
  inputType?: 'ARTICLE' | 'IMAGE';
}

const Loader: React.FC<LoaderProps> = ({ inputType }) => {
  if (inputType === 'IMAGE') {
    return <ImageAnalysisLoader />;
  }
  return <TextAnalysisLoader />;
};

export default Loader;