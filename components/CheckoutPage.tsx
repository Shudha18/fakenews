import React, { useState } from 'react';
import type { Plan } from '../App';

interface CheckoutPageProps {
    plan: Plan;
    onSuccess: () => void;
    onBack: () => void;
    upgradeCost?: number;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ plan, onSuccess, onBack, upgradeCost }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [cardDetails, setCardDetails] = useState({
        name: '',
        number: '',
        expiry: '',
        cvc: '',
    });

    const isUpgrade = typeof upgradeCost === 'number';
    const amountDue = isUpgrade ? upgradeCost : plan.price;


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Auto-format card number (XXXX XXXX XXXX XXXX)
        if (name === 'number') {
            formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        }
        // Auto-format expiry date (MM/YY)
        if (name === 'expiry') {
            formattedValue = value.replace(/\//g, '');
            if (formattedValue.length > 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
            }
        }
        
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // --- Mock validation ---
        if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
            setError('Please fill in all card details.');
            return;
        }
        if (cardDetails.number.length < 19) {
            setError('Please enter a valid 16-digit card number.');
            return;
        }
        if (cardDetails.expiry.length < 5) {
            setError('Please enter a valid expiry date (MM/YY).');
            return;
        }
         if (cardDetails.cvc.length < 3) {
            setError('Please enter a valid CVC.');
            return;
        }

        setIsLoading(true);

        // --- Mock payment processing ---
        setTimeout(() => {
            setIsLoading(false);
            onSuccess();
        }, 2000);
    };

    return (
        <div className="w-full max-w-xl mx-auto animate-fade-in-up">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-light-cyan dark:text-cyber-cyan">Complete Your Purchase</h2>
                <p className="mt-2 text-light-text-secondary dark:text-cyber-text-secondary">
                    You are {isUpgrade ? 'upgrading' : 'subscribing'} to the <span className="font-bold text-light-text dark:text-cyber-text">{plan.name}</span> plan.
                </p>
            </div>

            <div className="bg-light-surface/50 dark:bg-cyber-surface/60 border border-light-border dark:border-cyber-border/50 rounded-lg p-8 backdrop-blur-sm">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Name on Card</label>
                            <input type="text" id="name" name="name" value={cardDetails.name} onChange={handleInputChange} className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition" placeholder="John M. Doe" />
                        </div>
                        <div>
                            <label htmlFor="number" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Card Number</label>
                            <input type="tel" id="number" name="number" value={cardDetails.number} onChange={handleInputChange} maxLength={19} className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="expiry" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">Expiry Date</label>
                                <input type="text" id="expiry" name="expiry" value={cardDetails.expiry} onChange={handleInputChange} maxLength={5} className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition" placeholder="MM/YY" />
                            </div>
                             <div>
                                <label htmlFor="cvc" className="block text-sm font-bold mb-2 text-light-text-secondary dark:text-cyber-text-secondary">CVC</label>
                                <input type="text" id="cvc" name="cvc" value={cardDetails.cvc} onChange={handleInputChange} maxLength={4} className="w-full p-3 bg-light-bg/50 dark:bg-cyber-bg border border-light-border dark:border-cyber-border/50 rounded-md focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan focus:outline-none transition" placeholder="123" />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 dark:text-cyber-red text-sm mt-4 text-center">{error}</p>}
                    
                    <div className="mt-8 border-t border-light-border dark:border-cyber-border/50 pt-6">
                         {isUpgrade && (
                            <div className="text-sm text-light-text-secondary dark:text-cyber-text-secondary space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span>New Plan Price:</span>
                                    <span>${plan.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Credit from previous plan:</span>
                                    <span className="text-light-green dark:text-cyber-green">-${(plan.price - upgradeCost).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                         <div className="flex justify-between items-center text-lg font-bold">
                             <span className="text-light-text-secondary dark:text-cyber-text-secondary">Total Due Today:</span>
                             <span className="text-light-text dark:text-cyber-text">${amountDue.toFixed(2)}</span>
                         </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row-reverse gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full hologram-button px-8 py-3 font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/50 dark:border-cyber-bg/50 border-t-white dark:border-t-cyber-bg rounded-full animate-spin"></div>
                            ) : `Pay $${amountDue.toFixed(2)}`}
                        </button>
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-6 py-3 font-bold text-light-text-secondary dark:text-cyber-text-secondary rounded-md bg-light-border/50 dark:bg-cyber-border/50 hover:bg-light-border dark:hover:bg-cyber-border transition-colors disabled:opacity-50"
                        >
                            Back
                        </button>
                    </div>
                     <p className="text-xs text-center mt-4 text-light-text-secondary/70 dark:text-cyber-text-secondary/60">
                         This is a mock payment gateway for demonstration purposes. No real transaction will occur.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;