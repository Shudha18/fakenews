import React, { useState } from 'react';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult({ type: '', message: '' });

        const formElement = e.target as HTMLFormElement;
        const web3FormData = new FormData(formElement);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: web3FormData
            });

            const data = await response.json();

            if (data.success) {
                setResult({ type: 'success', message: 'Form Submitted Successfully! We will get back to you shortly.' });
                setFormData({ name: '', email: '', message: '' });
            } else {
                console.error("Error from web3forms", data);
                setResult({ type: 'error', message: data.message || 'An error occurred. Please try again.' });
            }
        } catch (error) {
             console.error("Submission fetch error:", error);
             setResult({ type: 'error', message: 'A network error occurred. Please check your connection and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
            <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-bold text-light-cyan dark:text-cyber-cyan">Get In Touch</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-cyber-text-secondary">
                    We'd love to hear from you. Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="text-light-text dark:text-cyber-text">
                    <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
                    <p className="text-light-text-secondary dark:text-cyber-text-secondary mb-6">
                        Fill up the form and our team will get back to you within 24 hours. For urgent inquiries, please email us directly.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-light-cyan dark:text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <a href="mailto:support@synthetica.com" className="text-lg text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-cyan dark:hover:text-cyber-cyan transition-colors">support@synthetica.com</a>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-light-surface/50 dark:bg-cyber-surface/60 border border-light-border dark:border-cyber-border/50 rounded-lg p-8 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="access_key" value="7409f8ff-3058-4371-8e44-07b2a7cde273" />
                        <input type="hidden" name="subject" value="New Contact Form Submission from Synthetica" />
                        <input type="checkbox" name="botcheck" className="hidden" style={{display: 'none'}} />

                        <div>
                            <label htmlFor="name" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition" required />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition" required />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Message</label>
                            <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={5} className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition resize-none" required></textarea>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full hologram-button px-8 py-3 font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                            {isSubmitting ? (
                                 <div className="h-5 w-5 border-2 border-white/50 dark:border-cyber-bg/50 border-t-white dark:border-t-cyber-bg rounded-full animate-spin"></div>
                            ) : (
                                "Send Message"
                            )}
                        </button>
                        {result.message && (
                            <p className={`text-sm text-center pt-2 ${result.type === 'success' ? 'text-light-green dark:text-cyber-green' : 'text-light-red dark:text-cyber-red'}`}>
                                {result.message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;