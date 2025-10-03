import React from 'react';

interface ThemeClasses {
    [key: string]: string;
}

interface AnimationProps {
    themeClasses: ThemeClasses;
}

export const TextAnalysisAnimation: React.FC<AnimationProps> = ({ themeClasses }) => (
  <svg viewBox="0 0 200 150" className="w-full h-full">
    <defs>
      <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <style>
        {`
          @keyframes scan-3d {
            0% { transform: translateY(0) scaleY(1); }
            50% { transform: translateY(50px) scaleY(1.2); }
            100% { transform: translateY(0) scaleY(1); }
          }
          .scan-line-3d { animation: scan-3d 4s infinite ease-in-out; }
        `}
      </style>
    </defs>
    <g style={{ perspective: '500px', transform: 'rotateX(15deg) rotateY(-10deg)' }} className="transition-transform duration-300 group-hover:rotate-y-0 group-hover:scale-105">
      <path d="M40 20 L160 20 L170 130 L50 130 Z" fill="transparent" strokeWidth="1" className={`${themeClasses.stroke}`}/>
      <rect x="55" y="40" width="100" height="6" rx="2" className={themeClasses.fill} />
      <rect x="55" y="60" width="80" height="6" rx="2" className={`${themeClasses.fill} ${themeClasses.highlightRed}`} />
      <rect x="55" y="80" width="100" height="6" rx="2" className={themeClasses.fill} />
      <rect x="55" y="100" width="90" height="6" rx="2" className={`${themeClasses.fill} ${themeClasses.highlightGreen}`} />
      <rect x="50" y="30" width="115" height="2" className={`${themeClasses.scanLine} scan-line-3d`} filter="url(#glow-cyan)" />
    </g>
  </svg>
);

export const ImageForensicsAnimation: React.FC<AnimationProps> = ({ themeClasses }) => (
  <svg viewBox="0 0 200 150" className="w-full h-full">
     <style>
        {`
          @keyframes glitch-skew {
            0%, 100% { transform: skewX(0deg); }
            25% { transform: skewX(5deg); }
            75% { transform: skewX(-5deg); }
          }
          .glitch-layer { animation: glitch-skew 0.3s infinite linear; }
        `}
      </style>
    <g className="transition-transform duration-300 group-hover:scale-110">
      <rect x="30" y="20" width="140" height="110" rx="5" className={`${themeClasses.surface} ${themeClasses.stroke}`} strokeWidth="1"/>
      
      <rect x="30" y="20" width="140" height="110" rx="5" className={themeClasses.glitch1} opacity="0.5" transform="translate(2, 2)" style={{ mixBlendMode: 'screen' }}/>
      <rect x="30" y="20" width="140" height="110" rx="5" className={`${themeClasses.glitch2} glitch-layer`} opacity="0.5" transform="translate(-2, -2)" style={{ mixBlendMode: 'screen' }}/>

      <path d="M60 110 L90 70 L110 110 Z M100 110 L120 80 L150 110 Z" fill="none" strokeWidth="2" className={`${themeClasses.stroke} opacity-50`}/>
      <circle cx="70" cy="50" r="10" fill="none" strokeWidth="2" className={`${themeClasses.stroke} opacity-50`}/>
    </g>
  </svg>
);

export const URLAnalysisAnimation: React.FC<AnimationProps> = ({ themeClasses }) => (
  <svg viewBox="0 0 200 150" className="w-full h-full">
     <defs>
      <radialGradient id="globe-gradient" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="rgba(0, 246, 255, 0.4)" />
        <stop offset="100%" stopColor="rgba(0, 246, 255, 0)" />
      </radialGradient>
       <style>
        {`
          @keyframes orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
           .orbiting {
             animation: orbit 8s linear infinite;
             transform-origin: 100px 85px;
           }
        `}
      </style>
    </defs>
    <g className="transition-transform duration-300 group-hover:scale-110">
        <circle cx="100" cy="85" r="35" className={`${themeClasses.globe} ${themeClasses.stroke}`} strokeWidth="1" />
        <circle cx="100" cy="85" r="35" fill="url(#globe-gradient)" />
        
        <path d="M100 50 A35 35 0 0 1 100 120" fill="none" strokeWidth="0.5" className={themeClasses.globeLines} />
        <path d="M65 85 A35 35 0 0 1 135 85" fill="none" strokeWidth="0.5" className={themeClasses.globeLines} />
        
        <g className="orbiting" style={{ animationDuration: '10s' }}>
           <path d="M100 15 C 50 45, 50 125, 100 155" strokeWidth="1.5" fill="none" strokeDasharray="3 3" className={`${themeClasses.flowLines} transition-all duration-300 group-hover:stroke-light-magenta dark:group-hover:stroke-cyber-magenta`} />
        </g>
         <g className="orbiting" style={{ animationDelay: '-5s' }}>
           <circle cx="65" cy="85" r="3" fill="currentColor" className={`${themeClasses.flowLines}`} />
        </g>
    </g>
  </svg>
);