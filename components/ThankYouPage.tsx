import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { useAuth } from './AuthContext';
import { useCredits } from '../services/creditService';
import type { Plan } from '../App';
import BaseCheckoutPage from './CheckoutPage';
import { DownloadIcon } from './icons/UtilityIcons';

interface ThankYouPageProps {
    onRedirect: () => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ onRedirect }) => {
    const { currentUser } = useAuth();
    const { activateSubscription } = useCredits();
    const [purchaseDetails, setPurchaseDetails] = useState<{ plan: Plan; amountPaid: number } | null>(null);

    // This effect runs once on mount to activate the subscription
    // and retrieve purchase details from localStorage for the receipt.
    useEffect(() => {
        const purchaseData = JSON.parse(localStorage.getItem('purchase-details-temp') || '{}');
        if (purchaseData && purchaseData.plan && typeof purchaseData.amountPaid === 'number') {
            activateSubscription(purchaseData.plan as Plan);
            setPurchaseDetails(purchaseData);
            localStorage.removeItem('purchase-details-temp');
        }
    }, [activateSubscription]);

    const handleDownloadReceipt = () => {
        if (!purchaseDetails || !currentUser) return;
        
        const doc = new jsPDF();
        const { plan, amountPaid } = purchaseDetails;
        const today = new Date();

        // Header
        doc.setFontSize(22);
        doc.setTextColor('#0d9488'); // light-cyan
        doc.text("Synthetica", 20, 20);
        doc.setFontSize(16);
        doc.setTextColor('#212529'); // light-text
        doc.text("Receipt", 20, 30);
        
        // Info
        doc.setFontSize(10);
        doc.setTextColor('#6c757d'); // light-text-secondary
        doc.text(`Date: ${today.toLocaleDateString()}`, 150, 20);
        doc.text(`Transaction ID: TXN-${today.getTime()}`, 150, 25);
        
        // Billed to
        doc.setFontSize(12);
        doc.setTextColor('#212529');
        doc.text("Billed To:", 20, 50);
        doc.setFontSize(10);
        doc.setTextColor('#6c757d');
        doc.text(currentUser.name, 20, 56);
        doc.text(currentUser.email, 20, 61);

        // Line
        doc.setDrawColor('#dee2e6'); // light-border
        doc.line(20, 70, 190, 70);

        // Table Header
        doc.setFontSize(10);
        doc.setTextColor('#212529');
        doc.text("Description", 20, 78);
        doc.text("Amount", 170, 78);

        // Table Body
        doc.setFontSize(12);
        doc.setTextColor('#6c757d');
        doc.text(plan.name, 20, 86);
        doc.setFontSize(12);
        doc.setTextColor('#212529');
        doc.text(`$${amountPaid.toFixed(2)}`, 170, 86);

        // Line
        doc.line(20, 95, 190, 95);

        // Total
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Total Paid", 20, 103);
        doc.text(`$${amountPaid.toFixed(2)}`, 165, 103);

        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#6c757d');
        doc.text("Thank you for your purchase!", 20, 120);
        
        doc.save(`synthetica-receipt-${today.getTime()}.pdf`);
    };

    return (
        <div className="w-full max-w-xl mx-auto text-center animate-fade-in-up">
            <div className="bg-light-surface/50 dark:bg-cyber-surface/60 border border-light-green dark:border-cyber-green rounded-lg p-10 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full dark:bg-cyber-green/10 bg-light-green/10 -z-10" />
                
                <div className="w-20 h-20 mx-auto bg-light-green dark:bg-cyber-green text-white dark:text-cyber-bg rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                
                <h2 className="text-3xl font-bold mt-6 text-light-green dark:text-cyber-green">Payment Successful!</h2>
                
                <p className="mt-3 text-light-text-secondary dark:text-cyber-text-secondary">
                    Thank you, <span className="font-bold text-light-text dark:text-cyber-text">{currentUser?.name}</span>.
                </p>
                <p className="mt-1 text-light-text-secondary dark:text-cyber-text-secondary">
                    Your <span className="font-bold text-light-text dark:text-cyber-text">{purchaseDetails?.plan.name}</span> plan is now active.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                     <button
                        onClick={handleDownloadReceipt}
                        disabled={!purchaseDetails}
                        className="px-6 py-2 w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-light-cyan dark:text-cyber-cyan border-2 border-light-cyan dark:border-cyber-cyan rounded-md bg-transparent hover:bg-light-cyan dark:hover:bg-cyber-cyan hover:text-white dark:hover:text-cyber-bg transition-all duration-300 disabled:opacity-50"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download Receipt
                    </button>
                    <button
                        onClick={onRedirect}
                        className="hologram-button px-6 py-2 w-full sm:w-auto font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        </div>
    );
};

// This wrapper component temporarily stores purchase details in localStorage
// before redirecting to the ThankYouPage. This is a simple way to pass
// transaction data without complex state management.
const CheckoutPageWithPlanStorage: React.FC<Omit<React.ComponentProps<typeof BaseCheckoutPage>, 'onSuccess'> & { onSuccess: () => void }> = (props) => {
    
    const handleSuccess = () => {
        const isUpgrade = typeof props.upgradeCost === 'number';
        const amountPaid = isUpgrade ? props.upgradeCost : props.plan.price;

        const purchaseDetails = {
            plan: props.plan,
            amountPaid: amountPaid,
        };

        localStorage.setItem('purchase-details-temp', JSON.stringify(purchaseDetails));
        props.onSuccess();
    };

    return <BaseCheckoutPage {...props} onSuccess={handleSuccess} />;
}


export default ThankYouPage;
export { CheckoutPageWithPlanStorage as CheckoutPage };