import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AnalyzerPage from './components/AnalyzerPage';
import PricingPage from './components/PricingPage';
import ThankYouPage, { CheckoutPage } from './components/ThankYouPage';
import ProfilePage from './components/ProfilePage';
import { AuthProvider, useAuth } from './components/AuthContext';
import AuthPage from './components/AuthPage';
import AboutPage from './components/AboutPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import ContactPage from './components/ContactPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import BlogPage from './components/BlogPage';

type Theme = 'light' | 'dark';
export type Page = 'home' | 'analyzer' | 'pricing' | 'checkout' | 'thankyou' | 'profile' | 'about' | 'privacy' | 'contact' | 'terms' | 'blog';

export type Plan = {
  id: 'weekly' | 'monthly' | 'yearly';
  name: string;
  price: number;
  durationDays: number;
  dailyCredits: number;
};

export const PLANS: Record<string, Plan> = {
  weekly: { id: 'weekly', name: 'Weekly Pass', price: 19.99, durationDays: 7, dailyCredits: 10 },
  monthly: { id: 'monthly', name: 'Monthly Pro', price: 59.99, durationDays: 30, dailyCredits: 50 },
  yearly: { id: 'yearly', name: 'Yearly Max', price: 159.99, durationDays: 365, dailyCredits: 70 },
};

const AppContent: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [checkoutDetails, setCheckoutDetails] = useState<{ plan: Plan; upgradeCost?: number } | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default for SSR or environments without localStorage
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // When user logs out, reset to the home page view
    if (!isAuthenticated) {
        setPage('home');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleSelectPlan = (planId: 'weekly' | 'monthly' | 'yearly', upgradeCost?: number) => {
      setCheckoutDetails({ plan: PLANS[planId], upgradeCost });
      setPage('checkout');
  }
  
  const handleSuccessfulCheckout = () => {
      setPage('thankyou');
  };

  if (!isAuthenticated) {
      return <AuthPage />;
  }
  
  const renderPage = () => {
      switch(page) {
          case 'home':
              return <HomePage onGetStarted={() => setPage('analyzer')} />;
          case 'analyzer':
              return <AnalyzerPage onRequireSubscription={() => setPage('pricing')} />;
          case 'pricing':
              return <PricingPage onSelectPlan={handleSelectPlan} />;
          case 'checkout':
              return checkoutDetails ? <CheckoutPage plan={checkoutDetails.plan} upgradeCost={checkoutDetails.upgradeCost} onSuccess={handleSuccessfulCheckout} onBack={() => setPage('pricing')} /> : <PricingPage onSelectPlan={handleSelectPlan} />;
          case 'thankyou':
              return <ThankYouPage onRedirect={() => setPage('home')} />;
          case 'profile':
              return <ProfilePage onNavigateToPricing={() => setPage('pricing')} />;
          case 'about':
              return <AboutPage />;
          case 'privacy':
              return <PrivacyPolicyPage />;
          case 'contact':
              return <ContactPage />;
          case 'terms':
              return <TermsOfServicePage />;
          case 'blog':
              return <BlogPage />;
          default:
              return <HomePage onGetStarted={() => setPage('analyzer')} />;
      }
  }

  return (
<div className="min-h-screen bg-white dark:bg-gray-950 text-light-text dark:text-cyber-text flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto flex-grow">
        <Header page={page} setPage={setPage} theme={theme} toggleTheme={toggleTheme} />
        <main className="mt-8 sm:mt-16 w-full">
          {renderPage()}
        </main>
      </div>
       <footer className="w-full max-w-5xl border-t border-light-border dark:border-cyber-border/20 mt-24 pt-16 pb-8 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-bold text-light-cyan dark:text-cyber-cyan">SYNTHETICA</h3>
              <p className="mt-4 text-light-text-secondary dark:text-cyber-text-secondary/80">
                AI-Powered News Authenticator to unmask the truth in a digital world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-light-text dark:text-cyber-text tracking-wider uppercase">Product</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('analyzer'); }} className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">Analyzer</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('pricing'); }} className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">Subscriptions</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Feature coming soon!'); }} className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">Browser Extension</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-light-text dark:text-cyber-text tracking-wider uppercase">Company</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('about'); }} className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">About Us</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('blog'); }} className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">Blog</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('contact'); }} className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-light-text dark:text-cyber-text tracking-wider uppercase">Legal</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('privacy'); }} className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">Privacy Policy</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('terms'); }} className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-light-border/80 dark:border-cyber-border/10 flex flex-col-reverse sm:flex-row justify-between items-center gap-6">
            <p className="text-xs text-light-text-secondary dark:text-cyber-text-secondary/70">
              &copy; {new Date().getFullYear()} Synthetica. AI analysis is a tool, not a replacement for critical thinking.
            </p>
            <div className="flex gap-4">
                <a href="#" aria-label="Twitter" className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                </a>
                 <a href="#" aria-label="Github" className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path></svg>
                </a>
                 <a href="#" aria-label="LinkedIn" className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                </a>
            </div>
          </div>
       </footer>
    </div>
  );
};

const App: React.FC = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;