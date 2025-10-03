import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useCredits } from '../services/creditService';
import { getHistory, clearHistory, deleteHistoryItem } from '../services/historyService';
import type { HistoryItem, AnalysisSource } from '../types';
import { Verdict, InputType } from '../types';
import { CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from './icons/VerdictIcons';
import { TrashIcon, CloseIcon, ProfileIcon } from './icons/UtilityIcons';
import Loader from './Loader';

// --- History Components & Helpers (unchanged) ---
const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
);
const getVerdictConfig = (verdict: Verdict) => {
  switch (verdict) {
    case Verdict.REAL: case Verdict.LIKELY_REAL: return { text: verdict === Verdict.REAL ? 'Authentic' : 'Likely Authentic', color: 'green', Icon: CheckCircleIcon };
    case Verdict.UNCERTAIN: return { text: 'Uncertain', color: 'yellow', Icon: QuestionMarkCircleIcon };
    case Verdict.LIKELY_FAKE: case Verdict.FAKE: return { text: verdict === Verdict.FAKE ? 'Fake/Misleading' : 'Likely Fake', color: 'red', Icon: XCircleIcon };
    default: return { text: 'Analyzed', color: 'yellow', Icon: QuestionMarkCircleIcon };
  }
};
const HistoryItemCard: React.FC<{ item: HistoryItem, onView: (item: HistoryItem) => void, onDelete: (itemId: string) => void }> = ({ item, onView, onDelete }) => {
  const { text, color, Icon } = getVerdictConfig(item.verdict);
  const colorClasses = { border: `border-light-${color} dark:border-cyber-${color}`, text: `text-light-${color} dark:text-cyber-${color}`, bgHover: `hover:bg-light-${color}/5 dark:hover:bg-cyber-${color}/5` };
  const handleDelete = async (e: React.MouseEvent) => { e.stopPropagation(); if(window.confirm('Are you sure?')) { onDelete(item.id); } };
  return (
    <div onClick={() => onView(item)} className={`bg-light-surface dark:bg-cyber-surface/70 backdrop-blur-sm shadow-md rounded-lg overflow-hidden border-l-4 ${colorClasses.border} ${colorClasses.bgHover} transition-all duration-300 cursor-pointer group hover:shadow-xl dark:hover:shadow-cyber-cyan/10 hover:-translate-y-1`} role="button" tabIndex={0}>
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-shrink-0 flex items-center justify-center sm:w-12 pt-1"><Icon className={`w-10 h-10 ${colorClasses.text}`} /></div>
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <p className={`font-bold text-lg ${colorClasses.text}`}>{text} <span className="font-normal text-base text-light-text-secondary dark:text-cyber-text-secondary">({item.confidence}%)</span></p>
                <p className="text-xs text-light-text-secondary dark:text-cyber-text-secondary whitespace-nowrap ml-2 hidden sm:block">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
            <p className="text-sm mt-1 text-light-text-secondary dark:text-cyber-text-secondary italic">"{item.summary}"</p>
            <p className="text-xs text-light-text-secondary dark:text-cyber-text-secondary whitespace-nowrap mt-2 sm:hidden">{new Date(item.timestamp).toLocaleString()}</p>
        </div>
        <div className="flex-shrink-0 self-start sm:self-center"><button onClick={handleDelete} title="Delete this item" className="p-2 rounded-full text-light-text-secondary dark:text-cyber-text-secondary opacity-0 group-hover:opacity-100 focus-within:opacity-100 hover:bg-light-red/10 dark:hover:bg-cyber-red/10 hover:text-light-red dark:hover:text-cyber-red transition-all duration-300"><TrashIcon className="w-5 h-5" /></button></div>
      </div>
      <div className="bg-light-bg dark:bg-cyber-bg-dark border-t border-light-border dark:border-cyber-border/30 px-4 py-2"><p className="text-xs font-semibold text-light-text dark:text-cyber-text uppercase tracking-wider">{item.inputType === InputType.IMAGE ? 'Analyzed Image' : 'Analyzed Text/URL'}</p><p className="text-sm text-light-text-secondary dark:text-cyber-text-secondary truncate font-mono" title={item.input}>{item.input}</p></div>
    </div>
  );
};
const HistoryDetailsModal: React.FC<{ item: HistoryItem, onClose: () => void }> = ({ item, onClose }) => {
    const { text, color, Icon } = getVerdictConfig(item.verdict);
    const colorClasses = { bg: `bg-light-${color}/10 dark:bg-cyber-${color}/10`, border: `border-light-${color} dark:border-cyber-${color}`, text: `text-light-${color} dark:text-cyber-${color}`};
    useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [onClose]);
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up" onClick={onClose}><div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 bg-light-surface dark:bg-cyber-surface border rounded-lg p-6 sm:p-8 ${colorClasses.border}`} onClick={(e) => e.stopPropagation()}><button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><CloseIcon className="w-6 h-6 text-light-text-secondary dark:text-cyber-text-secondary" /></button><div className="flex items-start gap-4"><div className={`flex-shrink-0 ${colorClasses.text}`}><Icon className="w-12 h-12" /></div><div className="flex-grow"><h2 className={`text-2xl font-bold ${colorClasses.text}`}>{text} - {item.confidence}% Confidence</h2><p className="text-light-text-secondary dark:text-cyber-text-secondary mt-1">{item.summary}</p></div></div><div className="mt-6 border-t border-light-border/50 dark:border-cyber-border/30 pt-6"><h3 className="text-lg font-semibold">Key Reasoning Points</h3><ul className="list-none mt-2 space-y-2">{item.reasoning.map((p, i) => (<li key={i} className="flex items-start"><span className={`mr-3 mt-1 flex-shrink-0 ${colorClasses.text}`}>›</span><p className="text-light-text-secondary dark:text-cyber-text-secondary">{p}</p></li>))}</ul></div>{item.sources && item.sources.length > 0 && (<div className="mt-6 border-t border-light-border/50 dark:border-cyber-border/30 pt-6"><h3 className="text-lg font-semibold">Corroborating Sources</h3><ul className="list-none mt-2 space-y-2">{item.sources.map((s: AnalysisSource, i: number) => (<li key={i} className="flex items-start"><LinkIcon className="w-4 h-4 mr-3 mt-1 shrink-0 text-light-text-secondary" /><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan hover:underline transition-colors truncate" title={s.url}>{s.title}</a></li>))}</ul></div>)}<div className="mt-6 border-t border-light-border/50 dark:border-cyber-border/30 pt-6"><h3 className="text-lg font-semibold">Original Input</h3><div className="mt-2 p-3 text-sm rounded bg-light-bg dark:bg-cyber-bg-dark border border-light-border dark:border-cyber-border/50 text-light-text-secondary dark:text-cyber-text-secondary"><p className="font-bold text-xs uppercase">{item.inputType}</p><p className="whitespace-pre-wrap break-words font-mono mt-1">{item.input}</p></div></div></div></div>
    );
};

// --- Main Profile Page Component ---

interface ProfilePageProps {
    onNavigateToPricing: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateToPricing }) => {
    const { currentUser, logout, updateUserProfile } = useAuth();
    const { credits, subscription, isSubscribed, dailyLimit } = useCredits();
    
    // State for editing user details
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: currentUser?.name || '', phoneNumber: currentUser?.phoneNumber || '' });
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // State for profile picture
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
    
    // History state
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            setFormData({ name: currentUser.name, phoneNumber: currentUser.phoneNumber || '' });
        }
    }, [currentUser]);

    // History fetching
    useEffect(() => {
        const fetchHistory = async () => { setLoadingHistory(true); setHistoryError(null); try { setHistory(await getHistory()); } catch (e: any) { setHistoryError(e.message); } finally { setLoadingHistory(false); } };
        if (currentUser) fetchHistory();
        else setLoadingHistory(false);
    }, [currentUser]);

    const handleClearHistory = async () => { if (window.confirm('Are you sure?')) { try { await clearHistory(); setHistory([]); } catch (e: any) { setHistoryError(e.message); } } };
    const handleDeleteItem = async (itemId: string) => { try { await deleteHistoryItem(itemId); setHistory(p => p.filter(i => i.id !== itemId)); } catch (e: any) { setHistoryError(e.message); } };

    const handleEditDetails = async () => {
        setFormMessage(null);
        if (formData.name.trim() === '') {
            setFormMessage({ type: 'error', text: 'Name cannot be empty.' });
            return;
        }
        const { success, message } = await updateUserProfile(formData);
        if (success) {
            setFormMessage({ type: 'success', text: message });
            setIsEditing(false);
        } else {
            setFormMessage({ type: 'error', text: message });
        }
    };
    
    const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setFormMessage({ type: 'error', text: 'Please select a JPG or PNG image.' });
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setFormMessage({ type: 'error', text: 'Image size cannot exceed 2MB.' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicPreview(reader.result as string);
            setFormMessage(null);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfilePic = async () => {
        if (!profilePicPreview) return;
        setFormMessage(null);
        const { success, message } = await updateUserProfile({ profilePicture: profilePicPreview });
        if (success) {
            setFormMessage({ type: 'success', text: message });
            setProfilePicPreview(null);
        } else {
            setFormMessage({ type: 'error', text: message });
        }
    };

    const getDaysRemaining = (expiry: string | undefined) => !expiry ? 0 : Math.ceil((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <>
            <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
                <div className="text-center mb-10"><h2 className="text-3xl font-bold text-light-cyan dark:text-cyber-cyan">Profile & Settings</h2><p className="mt-2 text-light-text-secondary dark:text-cyber-text-secondary">Manage your account, subscription, and view analysis history.</p></div>
                <div className="space-y-8">
                    {/* --- About Section --- */}
                    <div className="bg-light-surface/50 dark:bg-cyber-surface/60 border border-light-border dark:border-cyber-border/50 rounded-lg p-6 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-light-text dark:text-cyber-text">About</h3>
                            {!isEditing && <button onClick={() => { setIsEditing(true); setFormMessage(null); }} className="text-sm font-bold text-light-cyan dark:text-cyber-cyan hover:underline">Edit</button>}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-light-bg dark:bg-cyber-bg border-2 border-light-border dark:border-cyber-border overflow-hidden flex items-center justify-center">
                                    {profilePicPreview ? ( <img src={profilePicPreview} alt="Preview" className="w-full h-full object-cover" /> ) : currentUser?.profilePicture ? ( <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" /> ) : ( <ProfileIcon className="w-16 h-16 text-light-text-secondary/50 dark:text-cyber-text-secondary/50" /> )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleProfilePicSelect} accept="image/png, image/jpeg" className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Change</button>
                            </div>
                            <div className="flex-grow w-full">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} placeholder="Full Name" className="w-full p-2 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md" />
                                    <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData(p => ({...p, phoneNumber: e.target.value}))} placeholder="Phone Number (Optional)" className="w-full p-2 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div><p className="text-sm font-bold text-light-text-secondary dark:text-cyber-text-secondary uppercase tracking-wider">Full Name</p><p className="text-lg mt-1">{currentUser?.name}</p></div>
                                    <div><p className="text-sm font-bold text-light-text-secondary dark:text-cyber-text-secondary uppercase tracking-wider">Email Address</p><p className="text-lg mt-1">{currentUser?.email}</p></div>
                                    {currentUser?.phoneNumber && <div><p className="text-sm font-bold text-light-text-secondary dark:text-cyber-text-secondary uppercase tracking-wider">Phone Number</p><p className="text-lg mt-1">{currentUser.phoneNumber}</p></div>}
                                </div>
                            )}
                            </div>
                        </div>
                        {isEditing && (
                            <div className="flex gap-4 mt-4"><button onClick={handleEditDetails} className="px-4 py-1 text-sm font-bold text-white bg-light-cyan dark:bg-cyber-cyan rounded-md">Save</button><button onClick={() => { setIsEditing(false); setFormMessage(null); }} className="px-4 py-1 text-sm font-bold bg-light-border/50 dark:bg-cyber-border/50 rounded-md">Cancel</button></div>
                        )}
                        {profilePicPreview && (
                            <div className="flex gap-4 mt-4"><button onClick={handleSaveProfilePic} className="px-4 py-1 text-sm font-bold text-white bg-light-cyan dark:bg-cyber-cyan rounded-md">Save Photo</button><button onClick={() => setProfilePicPreview(null)} className="px-4 py-1 text-sm font-bold bg-light-border/50 dark:bg-cyber-border/50 rounded-md">Cancel</button></div>
                        )}
                        {formMessage && <p className={`text-sm mt-4 text-center ${formMessage.type === 'success' ? 'text-light-green dark:text-cyber-green' : 'text-light-red dark:text-cyber-red'}`}>{formMessage.text}</p>}
                    </div>
                    {/* --- Plan & History Sections --- */}
                    <div className="bg-light-surface/50 dark:bg-cyber-surface/60 border border-light-border dark:border-cyber-border/50 rounded-lg p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-light-text dark:text-cyber-text mb-4">Plan Details</h3>
                        {isSubscribed && subscription ? (
                            <div className="p-4 rounded-md bg-light-green/10 dark:bg-cyber-green/10 border-l-4 border-light-green dark:border-cyber-green"><p className="text-lg font-bold text-light-green dark:text-cyber-green">{subscription.planName}</p><div className="mt-2 space-y-1 text-sm text-light-text-secondary dark:text-cyber-text-secondary"><p><span className="font-semibold text-light-text/80 dark:text-cyber-text/80">Expires on:</span> {new Date(subscription.expiresAt).toLocaleDateString()}</p><p className="font-bold text-light-green dark:text-cyber-green">{getDaysRemaining(subscription.expiresAt)} days remaining</p></div></div>
                        ) : (<div className="p-4 rounded-md bg-light-orange/10 dark:bg-cyber-orange/10 border-l-4 border-light-orange dark:border-cyber-orange"><p className="text-lg font-bold text-light-orange dark:text-cyber-orange">Free Plan</p><p className="text-sm text-light-text-secondary dark:text-cyber-text-secondary mt-1">You are currently on the free trial. You have {credits} credits remaining.</p></div>)}
                        <button onClick={onNavigateToPricing} className="mt-4 hologram-button px-6 py-2 text-sm font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105">{isSubscribed ? 'Change Plan' : 'View Plans'}</button>
                    </div>

                    <div className="bg-light-surface/50 dark:bg-cyber-surface/60 border border-light-border dark:border-cyber-border/50 rounded-lg p-6 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4"><h3 className="text-lg font-bold text-light-text dark:text-cyber-text">Analysis History</h3>{history.length > 0 && !historyError && (<button onClick={handleClearHistory} className="mt-2 sm:mt-0 px-4 py-2 text-sm font-bold text-light-red dark:text-cyber-red border-2 border-transparent hover:border-light-red dark:hover:border-cyber-red rounded-md bg-light-red/10 dark:bg-cyber-red/10 hover:bg-light-red/20 dark:hover:bg-cyber-red/20 transition-all">Clear History</button>)}</div>
                        {loadingHistory ? <Loader /> : historyError ? (<div className="my-4 text-center p-4 bg-red-500/10 border border-red-500/50 rounded-lg"><p>{historyError}</p></div>) : history.length > 0 ? (<div className="space-y-4">{history.map((item) => (<HistoryItemCard key={item.id} item={item} onView={setSelectedItem} onDelete={handleDeleteItem} />))}</div>) : (<div className="text-center mt-8 mb-4 p-6 border-2 border-dashed border-light-border dark:border-cyber-border/30 rounded-lg bg-light-surface/50 dark:bg-cyber-surface/30"><p>Your past analyses will appear here.</p></div>)}
                    </div>
                    {/* --- Logout Button --- */}
                     <div className="flex justify-center pt-4"><button onClick={logout} className="px-8 py-3 text-sm font-bold text-light-red dark:text-cyber-red border-2 border-light-red dark:border-cyber-red rounded-md bg-transparent hover:bg-light-red dark:hover:bg-cyber-red hover:text-white dark:hover:text-cyber-bg transition-all duration-300">Log Out</button></div>
                </div>
            </div>
            {selectedItem && (<HistoryDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />)}
        </>
    );
};

export default ProfilePage;
