
import React, { useState } from 'react';

// --- IMPORTANT NOTE ---
// This component simulates a payment process as it would happen inside an Automate Your Spa Portal app.
// A real Automate Your Spa Portal SaaS app would NOT use a Stripe publishable key on the frontend.
// Instead, it would use the Automate Your Spa Portal API to:
// 1. Check if a "SoloPro Pro" product exists in the user's connected Stripe account.
// 2. If not, create it via the API.
// 3. Create a one-time invoice or payment link for that product.
// 4. The user pays through Automate Your Spa Portal's secure system.
// This simulation mimics that entire flow from the user's perspective.


interface UpgradeModalProps {
    onClose: () => void;
    onUpgradeSuccess: () => void;
}

// --- ICONS ---
const AutomateYourSpaPortalLogo = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="#52B44F"/><path d="M12 5C8.13 5 5 8.13 5 12C5 15.87 8.13 19 12 19C15.87 19 19 15.87 19 12C19 8.13 15.87 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="#52B44F"/><path d="M13 12L15.5 9.5L14.09 8.09L11.58 10.59L10.5 9.5L9.09 10.91L11.58 13.41L9.09 15.91L10.5 17.33L13 14.83L15.5 17.33L16.91 15.91L14.41 13.41L16.91 10.91L15.5 9.5L13 12Z" fill="#52B44F"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const Spinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const simulatedAutomateYourSpaPortalPaymentSteps = [
    "Locating your Automate Your Spa Portal account...",
    "Creating 'SoloPro - Pro Plan' product in your Stripe account...",
    "Generating secure invoice via Automate Your Spa Portal API...",
    "Processing payment with your connected Stripe account...",
];


const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgradeSuccess }) => {
    const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
    const [processingLog, setProcessingLog] = useState('');

    const handleCheckout = () => {
        setPaymentState('processing');
        
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < simulatedAutomateYourSpaPortalPaymentSteps.length) {
                setProcessingLog(simulatedAutomateYourSpaPortalPaymentSteps[stepIndex]);
                stepIndex++;
            } else {
                clearInterval(interval);
                setPaymentState('success');
                setTimeout(() => {
                    onUpgradeSuccess();
                }, 1500);
            }
        }, 1200);
    };
    
    const renderContent = () => {
        switch (paymentState) {
            case 'success':
                return (
                     <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center h-96 animate-fade-in">
                        <CheckCircleIcon />
                        <h2 className="text-2xl font-bold text-slate-800 mt-4">Upgrade Successful!</h2>
                        <p className="text-slate-600 mt-1">Welcome to SoloPro! All Pro features have been unlocked.</p>
                    </div>
                );
            case 'processing':
                 return (
                     <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center h-96 animate-fade-in">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-500 mb-4">
                            <Spinner />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Processing Upgrade...</h2>
                        <p className="text-slate-600 mt-2 min-h-[20px]">{processingLog}</p>
                    </div>
                 );
            case 'idle':
            default:
                return (
                     <>
                        <div className="p-6 bg-white border-b border-slate-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">Upgrade to Pro</h2>
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                    <AutomateYourSpaPortalLogo />
                                    <span>Powered by Automate Your Spa Portal</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-slate-700">SoloPro - Pro Plan</p>
                                    <p className="font-bold text-slate-800">$29.00 / month</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 text-center">
                                Your payment will be processed securely by the Stripe account connected to your Automate Your Spa Portal location.
                            </p>
                            <button
                                onClick={handleCheckout}
                                className="mt-6 w-full flex items-center justify-center gap-2 text-lg font-semibold text-white bg-pink-500 px-5 py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-[0_0_15px_0] shadow-pink-500/60"
                            >
                                <LockIcon />
                                Authorize Payment via Automate Your Spa Portal
                            </button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-slate-50 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all duration-300" 
                onClick={(e) => e.stopPropagation()}
            >
               {renderContent()}
            </div>
             <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default UpgradeModal;
