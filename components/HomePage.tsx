import React from 'react';
import { TextAnalysisAnimation, ImageForensicsAnimation, URLAnalysisAnimation } from './animations/FeatureAnimations';

interface HomePageProps {
  onGetStarted: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const headlineText = "ILLUMINATE THE TRUTH";

  return (
    <div className="text-center flex flex-col items-center animate-fade-in-up">
      <p className="mt-4 text-lg sm:text-xl text-light-text-secondary dark:text-cyber-text-secondary max-w-2xl animate-text-focus-in" style={{ animationDelay: '0.2s' }}>
        Navigate the Noise.
      </p>
      <h2 
        className="text-4xl sm:text-6xl font-bold mt-2 animate-text-focus-in glitch-text" 
        style={{ animationDelay: '0.4s' }}
        data-text={headlineText}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-light-cyan to-light-magenta dark:from-cyber-cyan dark:to-cyber-magenta">
            {headlineText}
        </span>
      </h2>
      <p className="mt-6 text-base sm:text-lg text-light-text-secondary dark:text-cyber-text-secondary max-w-3xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        Synthetica's advanced neural network cuts through digital deception. Analyze text, URLs, and images to reveal manipulation, verify sources, and receive a multi-layered authenticity report in seconds. Step into a clearer reality.
      </p>

      <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <button
          onClick={onGetStarted}
          className="hologram-button px-10 py-4 text-xl font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105"
        >
          Start Analyzing
        </button>
      </div>

      <div className="mt-32 w-full space-y-24">
        <FeatureSection
          align="left"
          animation={<TextAnalysisAnimation themeClasses={{
            stroke: 'stroke-light-border dark:stroke-cyber-border',
            fill: 'fill-light-border/50 dark:fill-cyber-border/20',
            scanLine: 'fill-light-cyan dark:fill-cyber-cyan',
            highlightRed: 'dark:fill-cyber-red fill-light-red',
            highlightGreen: 'dark:fill-cyber-green fill-light-green',
          }}/>}
          title="Advanced Text Analysis"
          description="Our AI engine performs semantic analysis to understand context, tone, and intent, then cross-references claims against trusted sources."
          delay="1s"
        />
        <FeatureSection
          align="right"
          animation={<ImageForensicsAnimation themeClasses={{
            stroke: 'stroke-light-border dark:stroke-cyber-border',
            surface: 'fill-light-surface dark:fill-cyber-surface',
            glitch1: 'fill-light-red dark:fill-cyber-red',
            glitch2: 'fill-light-cyan dark:fill-cyber-cyan',
          }}/>}
          title="Deep Image Forensics"
          description="Identify sophisticated, AI-generated images or manipulated photos by detecting tell-tale signs of digital alteration invisible to the naked eye."
          delay="1.2s"
        />
        <FeatureSection
          align="left"
          animation={<URLAnalysisAnimation themeClasses={{
            stroke: 'stroke-light-border dark:stroke-cyber-border',
            surface: 'fill-light-surface dark:fill-cyber-surface',
            globe: 'fill-light-bg dark:fill-cyber-surface',
            globeLines: 'stroke-light-cyan/50 dark:stroke-cyber-cyan/50',
            flowLines: 'stroke-light-cyan dark:stroke-cyber-cyan',
          }}/>}
          title="Seamless URL Analysis"
          description="Simply provide a URL, and Synthetica's AI will autonomously extract the content and perform the same rigorous analysis."
          delay="1.4s"
        />
      </div>
    </div>
  );
};

interface FeatureSectionProps {
  animation: React.ReactNode;
  title: string;
  description: string;
  delay: string;
  align: 'left' | 'right';
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ animation, title, description, delay, align }) => {
  const isRightAligned = align === 'right';
  return (
    <section 
      className={`flex flex-col md:flex-row items-center gap-12 md:gap-16 ${isRightAligned ? 'md:flex-row-reverse' : ''} animate-fade-in-up`}
      style={{ animationDelay: delay }}
    >
      <div className="md:w-1/2 w-full p-4 h-56 md:h-72">
        {animation}
      </div>
      <div className="md:w-1/2 w-full text-center md:text-left">
        <h3 className="text-3xl font-bold text-light-cyan dark:text-cyber-cyan transition-colors duration-300">{title}</h3>
        <p className="mt-4 text-base text-light-text-secondary dark:text-cyber-text-secondary leading-relaxed">{description}</p>
      </div>
    </section>
  );
};

export default HomePage;