import React, { forwardRef, useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { Verdict } from '../types';
import { CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from './icons/VerdictIcons';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);

const getVerdictConfig = (verdict: Verdict) => {
  switch (verdict) {
    case Verdict.REAL:
    case Verdict.LIKELY_REAL:
      return {
        text: verdict === Verdict.REAL ? 'Authentic News' : 'Likely Authentic',
        color: 'green',
        Icon: CheckCircleIcon,
      };
    case Verdict.UNCERTAIN:
      return {
        text: 'Uncertain',
        color: 'yellow',
        Icon: QuestionMarkCircleIcon,
      };
    case Verdict.LIKELY_FAKE:
    case Verdict.FAKE:
      return {
        text: verdict === Verdict.FAKE ? 'Misleading or Fake' : 'Likely Misleading',
        color: 'red',
        Icon: XCircleIcon,
      };
    default:
      return {
        text: 'Analysis Complete',
        color: 'gray',
        Icon: QuestionMarkCircleIcon,
      };
  }
};

const RadialProgressBar: React.FC<{ progress: number, colorClass: string }> = ({ progress, colorClass }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg className="w-32 h-32" viewBox="0 0 100 100">
            <circle
                className="text-light-border/50 dark:text-cyber-border"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
            />
            <circle
                className={`${colorClass} animate-radial-progress`}
                strokeWidth="8"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: circumference, '--progress-offset': offset } as React.CSSProperties}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
                transform="rotate(-90 50 50)"
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                className={`text-2xl font-bold fill-current ${colorClass}`}
            >
                {progress}%
            </text>
        </svg>
    );
};

const ResultDisplay = forwardRef<HTMLDivElement, ResultDisplayProps>(({ result }, ref) => {
  const { text, color, Icon } = getVerdictConfig(result.verdict);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(result.confidence);
    }, 100); 

    return () => clearTimeout(timer);
  }, [result.confidence]);
  
  const colorClasses = {
    bg: `bg-light-${color}/10 dark:bg-cyber-${color}/10`,
    border: `border-light-${color} dark:border-cyber-${color}`,
    text: `text-light-${color} dark:text-cyber-${color}`,
    shadow: `shadow-lg dark:shadow-none`, // Glow is handled by the pseudo-element
    glow: `before:shadow-cyber-glow-${color}`,
  };

  const hasSources = result.sources && result.sources.length > 0;

  return (
    <div 
        ref={ref} 
        className={`relative border rounded-lg p-6 sm:p-8 animate-fade-in-up bg-light-surface dark:bg-cyber-surface/80 backdrop-blur-sm ${colorClasses.bg} ${colorClasses.border} ${colorClasses.shadow} overflow-hidden
                    before:content-[''] before:absolute before:inset-0 before:opacity-50 before:z-[-1] before:transition-shadow before:duration-500
                    dark:before:animate-pulse ${colorClasses.glow}`}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="flex-grow text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className={`flex-shrink-0 ${colorClasses.text}`}>
                <Icon className="w-10 h-10" />
              </div>
              <h2 className={`text-3xl font-bold ${colorClasses.text}`}>{text}</h2>
          </div>
          <p className="text-light-text-secondary dark:text-cyber-text-secondary mt-3">{result.summary}</p>
        </div>
        <div className="flex-shrink-0">
            <RadialProgressBar progress={animatedProgress} colorClass={colorClasses.text} />
        </div>
      </div>
      
      <div className="mt-8 border-t border-light-border/50 dark:border-cyber-border/30 pt-6">
        <h3 className="text-lg font-semibold text-light-text dark:text-cyber-text">Key Reasoning Points</h3>
        <ul className="list-none mt-3 space-y-3">
          {result.reasoning.map((point, index) => (
            <li key={index} className="flex items-start">
              <span className={`mr-3 mt-1 flex-shrink-0 ${colorClasses.text}`}>›</span>
              <p className="text-light-text-secondary dark:text-cyber-text-secondary">{point}</p>
            </li>
          ))}
        </ul>
      </div>

      {hasSources && (
        <div className="mt-6 border-t border-light-border/50 dark:border-cyber-border/30 pt-6">
            <h3 className="text-lg font-semibold text-light-text dark:text-cyber-text">Corroborating Sources</h3>
            <ul className="list-none mt-3 space-y-2">
                {result.sources.map((source, index) => (
                    <li key={index} className="flex items-start">
                        <LinkIcon className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-light-text-secondary dark:text-cyber-text-secondary" />
                        <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan hover:underline transition-colors truncate"
                            title={source.url}
                        >
                            {source.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
});

ResultDisplay.displayName = 'ResultDisplay';
export default ResultDisplay;