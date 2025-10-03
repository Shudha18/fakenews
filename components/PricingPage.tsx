import React from 'react';
import { PLANS, Plan } from '../App';
import { useCredits, calculateProratedUpgradeCost } from '../services/creditService';


type PlanId = 'weekly' | 'monthly' | 'yearly';
interface PricingPageProps {
    onSelectPlan: (planId: PlanId, upgradeCost?: number) => void;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const PlanCard: React.FC<{
    plan: Plan & { description: string; features: string[]; popular?: boolean; delay: string; };
    onSelect: () => void;
    isCurrent: boolean;
    isDowngrade: boolean;
    upgradeCost: number | null;
}> = ({ plan, onSelect, isCurrent, isDowngrade, upgradeCost }) => {
    
    let buttonText = 'Choose Plan';
    let isDisabled = false;

    if (isCurrent) {
        buttonText = 'Current Plan';
        isDisabled = true;
    } else if (isDowngrade) {
        buttonText = 'Downgrade Not Available';
        isDisabled = true;
    } else if (upgradeCost !== null) {
        buttonText = `Upgrade for $${upgradeCost.toFixed(2)}`;
    }

    return (
        <div 
          className={`relative bg-light-surface/50 dark:bg-cyber-surface/60 border rounded-2xl p-8 flex flex-col transition-all duration-300 backdrop-blur-sm animate-slide-in-bottom
          ${isCurrent 
             ? 'border-light-cyan dark:border-cyber-cyan shadow-2xl dark:shadow-cyber-cyan/20 -translate-y-2' 
             : 'border-light-border dark:border-cyber-border hover:border-light-cyan dark:hover:border-cyber-cyan hover:shadow-2xl dark:hover:shadow-cyber-cyan/20 hover:-translate-y-2'}`
          }
          style={{ animationDelay: plan.delay }}
        >
            {plan.popular && !isCurrent && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-light-magenta to-light-cyan dark:from-cyber-magenta dark:to-cyber-cyan px-4 py-1 rounded-full text-sm font-bold text-white shadow-lg">
                    Most Popular
                </div>
            )}
            <div className="flex-grow">
                <h3 className={`text-2xl font-bold ${isCurrent ? 'text-light-text dark:text-cyber-text' : 'text-light-cyan dark:text-cyber-cyan'}`}>{plan.name}</h3>
                <p className="mt-2 text-light-text-secondary dark:text-cyber-text-secondary">{plan.description}</p>
                <div className="my-8">
                    <span className="text-5xl font-bold text-light-text dark:text-cyber-text">${plan.price.toFixed(2)}</span>
                    <span className="text-light-text-secondary dark:text-cyber-text-secondary">/ {plan.name.split(' ')[0].toLowerCase()}</span>
                </div>
                <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <CheckIcon className="w-5 h-5 text-light-green dark:text-cyber-green" />
                            <span className="text-light-text-secondary dark:text-cyber-text-secondary">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <button 
                onClick={onSelect} 
                disabled={isDisabled}
                className={`w-full mt-10 hologram-button px-8 py-3 font-bold text-white dark:text-cyber-bg rounded-md transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                    ${(plan.popular || isCurrent) ? 'bg-light-cyan dark:bg-cyber-cyan dark:shadow-cyber-glow-cyan' : 'bg-light-text-secondary dark:bg-cyber-text-secondary'}
                `}
            >
                {buttonText}
            </button>
        </div>
    );
};

const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
    const { subscription, isSubscribed } = useCredits();

    const planDetails = {
        weekly: {
            description: "Perfect for short-term projects and trying out our full capabilities.",
            features: ["10 Daily Analyses", "Priority Support", "Full Access to All Features", "Cancel Anytime"],
            delay: '0.2s',
        },
        monthly: {
            description: "Best value for regular users and professionals who need consistent access.",
            features: ["50 Daily Analyses", "Priority Support", "Full Access to All Features", "Save 25% vs. Weekly", "Cancel Anytime"],
            popular: true,
            delay: '0.4s',
        },
        yearly: {
            description: "For the power users. Set it and forget it with massive savings.",
            features: ["70 Daily Analyses", "24/7 Priority Support", "Full Access to All Features", "Save over 75% vs. Weekly", "Cancel Anytime"],
            delay: '0.6s',
        },
    };

    const currentPlanDetails = isSubscribed ? PLANS[subscription.planId] : null;

    return (
        <div className="w-full">
            <div className="text-center animate-fade-in-up">
                <h2 className="text-4xl sm:text-5xl font-bold text-light-cyan dark:text-cyber-cyan">
                    {isSubscribed ? 'Manage Your Subscription' : 'Unlock Your Daily Potential'}
                </h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-cyber-text-secondary max-w-2xl mx-auto">
                    {isSubscribed ? 'Upgrade your plan to get more daily credits.' : 'Choose a plan that fits your needs. Get a fresh batch of analysis credits every day.'}
                </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {(Object.values(PLANS) as Plan[]).map(plan => {
                    const isCurrent = isSubscribed && subscription.planId === plan.id;
                    const isDowngrade = isSubscribed && currentPlanDetails && plan.durationDays < currentPlanDetails.durationDays;
                    const isUpgrade = isSubscribed && currentPlanDetails && plan.durationDays > currentPlanDetails.durationDays;
                    
                    let upgradeCost: number | null = null;
                    if (isUpgrade && subscription) {
                        upgradeCost = calculateProratedUpgradeCost(subscription, plan, PLANS);
                    }

                    return (
                        <PlanCard 
                            key={plan.id}
                            plan={{...plan, ...planDetails[plan.id]}} 
                            onSelect={() => onSelectPlan(plan.id, upgradeCost ?? undefined)}
                            isCurrent={isCurrent}
                            isDowngrade={isDowngrade}
                            upgradeCost={upgradeCost}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default PricingPage;