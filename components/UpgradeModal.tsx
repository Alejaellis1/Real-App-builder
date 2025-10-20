import React, { useState } from 'react';

// --- ICONS ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const Spinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const simulatedPaymentSteps = [
    "Locating your account...",
    "Creating 'SoloPro - Pro Plan' subscription...",
    "Generating secure invoice...",
    "Processing payment with your connected Stripe account...",
];


interface UpgradeModalProps {
    onClose: () => void;
    onUpgradeSuccess: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgradeSuccess }) => {
    const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
    const [processingLog, setProcessingLog] = useState('');

    const handleCheckout = () => {
        setPaymentState('processing');
        
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < simulatedPaymentSteps.length) {
                setProcessingLog(simulatedPaymentSteps[stepIndex]);
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
                                Your payment will be processed securely by your connected Stripe account.
                            </p>
                            <button
                                onClick={handleCheckout}
                                className="mt-6 w-full flex items-center justify-center gap-2 text-lg font-semibold text-white bg-pink-500 px-5 py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-[0_0_15px_0] shadow-pink-500/60"
                            >
                                <LockIcon />
                                Authorize Secure Payment
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