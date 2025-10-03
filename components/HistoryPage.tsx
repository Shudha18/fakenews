import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getHistory, clearHistory, deleteHistoryItem } from '../services/historyService';
import type { HistoryItem, AnalysisSource } from '../types';
import { Verdict, InputType } from '../types';
import { CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from './icons/VerdictIcons';
import { TrashIcon, CloseIcon } from './icons/UtilityIcons';
import Loader from './Loader';

const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);

const getVerdictConfig = (verdict: Verdict) => {
  switch (verdict) {
    case Verdict.REAL:
    case Verdict.LIKELY_REAL:
      return { text: verdict === Verdict.REAL ? 'Authentic' : 'Likely Authentic', color: 'green', Icon: CheckCircleIcon };
    case Verdict.UNCERTAIN:
      return { text: 'Uncertain', color: 'yellow', Icon: QuestionMarkCircleIcon };
    case Verdict.LIKELY_FAKE:
    case Verdict.FAKE:
      return { text: verdict === Verdict.FAKE ? 'Fake/Misleading' : 'Likely Fake', color: 'red', Icon: XCircleIcon };
    default:
      // Fallback to yellow to prevent style errors if an unexpected verdict appears
      return { text: 'Analyzed', color: 'yellow', Icon: QuestionMarkCircleIcon };
  }
};

const HistoryItemCard: React.FC<{ item: HistoryItem, onView: (item: HistoryItem) => void, onDelete: (itemId: string) => void }> = ({ item, onView, onDelete }) => {
  const { text, color, Icon } = getVerdictConfig(item.verdict);
  
  const colorClasses = {
    border: `border-light-${color} dark:border-cyber-${color}`,
    text: `text-light-${color} dark:text-cyber-${color}`,
    bgHover: `hover:bg-light-${color}/5 dark:hover:bg-cyber-${color}/5`,
  };

  const handleDelete = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click event from firing
      if(window.confirm('Are you sure you want to delete this history item?')) {
        onDelete(item.id);
      }
  };

  return (
    <div 
        onClick={() => onView(item)}
        className={`bg-light-surface dark:bg-cyber-surface/70 backdrop-blur-sm shadow-md rounded-lg overflow-hidden border-l-4 ${colorClasses.border} ${colorClasses.bgHover} transition-all duration-300 cursor-pointer group hover:shadow-xl dark:hover:shadow-cyber-cyan/10 hover:-translate-y-1`}
        role="button"
        tabIndex={0}
        aria-label={`View details for analysis of ${item.input}`}
    >
        <div className="p-4 flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-shrink-0 flex items-center justify-center sm:w-12 pt-1">
                <Icon className={`w-10 h-10 ${colorClasses.text}`} />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <p className={`font-bold text-lg ${colorClasses.text}`}>{text} <span className="font-normal text-base text-light-text-secondary dark:text-cyber-text-secondary">({item.confidence}%)</span></p>
                    <p className="text-xs text-light-text-secondary dark:text-cyber-text-secondary whitespace-nowrap ml-2 hidden sm:block">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <p className="text-sm mt-1 text-light-text-secondary dark:text-cyber-text-secondary italic">"{item.summary}"</p>
                 <p className="text-xs text-light-text-secondary dark:text-cyber-text-secondary whitespace-nowrap mt-2 sm:hidden">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
            <div className="flex-shrink-0 self-start sm:self-center">
                 <button
                    onClick={handleDelete}
                    title="Delete this item"
                    className="p-2 rounded-full text-light-text-secondary dark:text-cyber-text-secondary opacity-0 group-hover:opacity-100 focus-within:opacity-100 hover:bg-light-red/10 dark:hover:bg-cyber-red/10 hover:text-light-red dark:hover:text-cyber-red transition-all duration-300"
                    aria-label="Delete history item"
                 >
                    <TrashIcon className="w-5 h-5" />
                 </button>
            </div>
        </div>
        <div className="bg-light-bg dark:bg-cyber-bg-dark border-t border-light-border dark:border-cyber-border/30 px-4 py-2">
            <p className="text-xs font-semibold text-light-text dark:text-cyber-text uppercase tracking-wider">
              {item.inputType === InputType.IMAGE ? 'Analyzed Image' : 'Analyzed Text/URL'}
            </p>
            <p className="text-sm text-light-text-secondary dark:text-cyber-text-secondary truncate font-mono" title={item.input}>
              {item.input}
            </p>
        </div>
    </div>
  );
};

const HistoryDetailsModal: React.FC<{ item: HistoryItem, onClose: () => void }> = ({ item, onClose }) => {
    const { text, color, Icon } = getVerdictConfig(item.verdict);
    const colorClasses = {
        bg: `bg-light-${color}/10 dark:bg-cyber-${color}/10`,
        border: `border-light-${color} dark:border-cyber-${color}`,
        text: `text-light-${color} dark:text-cyber-${color}`,
    };

    // This effect handles closing the modal with the Escape key.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up" onClick={onClose} aria-modal="true" role="dialog">
            <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 bg-light-surface dark:bg-cyber-surface border rounded-lg p-6 sm:p-8 ${colorClasses.border}`} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Close details view">
                    <CloseIcon className="w-6 h-6 text-light-text-secondary dark:text-cyber-text-secondary" />
                </button>
                
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 ${colorClasses.text}`}>
                        <Icon className="w-12 h-12" />
                    </div>
                    <div className="flex-grow">
                        <h2 className={`text-2xl font-bold ${colorClasses.text}`}>{text} - {item.confidence}% Confidence</h2>
                        <p className="text-light-text-secondary dark:text-cyber-text-secondary mt-1">{item.summary}</p>
                    </div>
                </div>

                <div className="mt-6 border-t border-light-border/50 dark:border-cyber-border/30 pt-6">
                    <h3 className="text-lg font-semibold text-light-text dark:text-cyber-text">Key Reasoning Points</h3>
                    <ul className="list-none mt-2 space-y-2">
                    {item.reasoning.map((point, index) => (
                        <li key={index} className="flex items-start">
                        <span className={`mr-3 mt-1 flex-shrink-0 ${colorClasses.text}`}>›</span>
                        <p className="text-light-text-secondary dark:text-cyber-text-secondary">{point}</p>
                        </li>
                    ))}
                    </ul>
                </div>

                {item.sources && item.sources.length > 0 && (
                    <div className="mt-6 border-t border-light-border/50 dark:border-cyber-border/30 pt-6">
                        <h3 className="text-lg font-semibold text-light-text dark:text-cyber-text">Corroborating Sources</h3>
                        <ul className="list-none mt-2 space-y-2">
                            {item.sources.map((source: AnalysisSource, index: number) => (
                                <li key={index} className="flex items-start">
                                    <LinkIcon className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-light-text-secondary dark:text-cyber-text-secondary" />
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan hover:underline transition-colors truncate" title={source.url}>
                                        {source.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-6 border-t border-light-border/50 dark:border-cyber-border/30 pt-6">
                    <h3 className="text-lg font-semibold text-light-text dark:text-cyber-text">Original Input</h3>
                    <div className="mt-2 p-3 text-sm rounded bg-light-bg dark:bg-cyber-bg-dark border border-light-border dark:border-cyber-border/50 text-light-text-secondary dark:text-cyber-text-secondary">
                        <p className="font-bold text-xs uppercase">{item.inputType}</p>
                        <p className="whitespace-pre-wrap break-words font-mono mt-1">{item.input}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const HistoryPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (currentUser) {
                setLoading(true);
                setError(null);
                try {
                    const userHistory = await getHistory();
                    setHistory(userHistory);
                } catch (e: any) {
                    setError(e.message || 'An unexpected error occurred while loading history.');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [currentUser]);

    const handleClearHistory = async () => {
        if (currentUser && window.confirm('Are you sure you want to delete your entire analysis history? This action cannot be undone.')) {
            try {
                await clearHistory();
                setHistory([]);
            } catch (e: any) {
                setError(e.message || 'Failed to clear history.');
            }
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (currentUser) {
            try {
                await deleteHistoryItem(itemId);
                setHistory(prevHistory => prevHistory.filter(item => item.id !== itemId));
            } catch (e: any) {
                setError(e.message || 'Failed to delete item.');
            }
        }
    };
    
    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="w-full animate-fade-in-up">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-light-cyan dark:text-cyber-cyan">Analysis History</h2>
                    {history.length > 0 && !error && (
                        <button 
                            onClick={handleClearHistory}
                            className="mt-4 sm:mt-0 px-4 py-2 text-sm font-bold text-light-red dark:text-cyber-red border-2 border-transparent hover:border-light-red dark:hover:border-cyber-red rounded-md bg-light-red/10 dark:bg-cyber-red/10 hover:bg-light-red/20 dark:hover:bg-cyber-red/20 transition-all"
                        >
                            Clear All History
                        </button>
                    )}
                </div>

                {error && (
                    <div className="my-4 text-center p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <h3 className="text-lg font-bold text-light-red dark:text-cyber-red">An Error Occurred</h3>
                        <p className="mt-1 text-light-text-secondary dark:text-cyber-text-secondary">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="mt-3 px-4 py-1 text-sm font-bold text-white bg-light-red dark:bg-cyber-red rounded-md hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {!error && history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <HistoryItemCard 
                                key={item.id} 
                                item={item}
                                onView={setSelectedItem}
                                onDelete={handleDeleteItem}
                            />
                        ))}
                    </div>
                ) : !error && (
                    <div className="text-center mt-16 p-8 border-2 border-dashed border-light-border dark:border-cyber-border/30 rounded-lg bg-light-surface/50 dark:bg-cyber-surface/30">
                        <h3 className="text-xl font-semibold text-light-text dark:text-cyber-text">No History Found</h3>
                        <p className="mt-2 text-light-text-secondary dark:text-cyber-text-secondary">
                            Your past analyses will appear here once you start using the analyzer.
                        </p>
                    </div>
                )}
            </div>
            
            {selectedItem && (
                <HistoryDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </>
    );
};

export default HistoryPage;