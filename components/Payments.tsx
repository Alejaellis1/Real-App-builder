import React, { useState, useRef, useEffect } from 'react';

// --- IMPORTANT SECURITY NOTE ---
// A functional Stripe integration within an Automate Your Spa Portal app relies on Automate Your Spa Portal's secure backend connection.
// This app builder would use the Automate Your Spa Portal API to trigger payments, not connect to Stripe directly.
//
// This component simulates the user-facing part of enabling payments by verifying the Stripe
// connection that is already configured within the user's Automate Your Spa Portal account.
// It is for UI/UX demonstration purposes only.

// --- ICONS & MOCK DATA ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const mockTransactions = [
    { id: 'pi_3P...', amount: '$85.00', description: 'Payment for Signature Facial', status: 'Succeeded', date: '2 days ago' },
    { id: 'pi_3P...', amount: '$250.00', description: 'Payment for Microneedling', status: 'Succeeded', date: '4 days ago' },
    { id: 'pi_3P...', amount: '$40.00', description: 'Payment for LED Therapy Add-On', status: 'Succeeded', date: '1 week ago' },
    { id: 'pi_3P...', amount: '$85.00', description: 'Payment for Signature Facial', status: 'Refunded', date: '1 week ago' },
];
const simulatedConnectionSteps = [
    "Initiating check with your Automate Your Spa Portal account...",
    "Verifying Automate Your Spa Portal permissions...",
    "Confirming Stripe is connected and active in Automate Your Spa Portal...",
    "Receiving confirmation token from Automate Your Spa Portal...",
    "Connection successful! Payments are now enabled.",
];

const Payments: React.FC = () => {
    const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [connectionLog, setConnectionLog] = useState<string[]>([]);
    const intervalRef = useRef<number | null>(null);

    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        return cleanup;
    }, []);

    const handleConnect = () => {
        setConnectionState('connecting');
        setConnectionLog([]);
        
        let stepIndex = 0;
        intervalRef.current = window.setInterval(() => {
            if (stepIndex < simulatedConnectionSteps.length) {
                setConnectionLog(prev => [...prev, simulatedConnectionSteps[stepIndex]]);
                stepIndex++;
            } else {
                cleanup();
                setConnectionState('connected');
            }
        }, 800);
    };
    
    const handleDisconnect = () => {
        setConnectionState('disconnected');
        setConnectionLog([]);
        cleanup();
    };

    const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
    const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className={cardStyle}>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800" style={title3DStyle}>Payments Hub</h2>
                        <p className="text-stone-600 mt-1">Review and manage your transactions.</p>
                    </div>
                </div>
            </div>

            {connectionState === 'disconnected' && (
                 <div className={`${cardStyle} text-center`}>
                    <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>Enable Payments via Automate Your Spa Portal</h3>
                    <p className="text-stone-600 my-3 max-w-lg mx-auto">
                        Your app's payments are securely managed by Stripe through your Automate Your Spa Portal account. Connect your Stripe account in your Automate Your Spa Portal settings to get started.
                    </p>
                    <button 
                        onClick={() => alert("This would take you to your Automate Your Spa Portal settings page to connect Stripe. For this demo, we'll simulate the connection process.")}
                        className="mt-2 text-md font-semibold text-white bg-[#52B44F] px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-[0_0_15px_0] shadow-green-500/50"
                    >
                        Go to Automate Your Spa Portal Settings
                    </button>
                    <button 
                        onClick={handleConnect}
                        className="mt-4 text-xs font-semibold text-stone-500 hover:text-stone-800"
                    >
                        (Simulate Connection)
                    </button>
                 </div>
            )}
            
            {connectionState === 'connecting' && (
                <div className={`${cardStyle}`}>
                    <h3 className="font-bold text-xl text-stone-800 mb-4 text-center" style={title3DStyle}>Checking Automate Your Spa Portal Connection...</h3>
                    <ul className="space-y-3">
                        {connectionLog.map((log, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-stone-700 animate-fade-in-fast">
                                {i === connectionLog.length - 1 ? (
                                    <div className="w-4 h-4 flex-shrink-0">
                                        <svg className="animate-spin h-4 w-4 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-4 h-4 text-green-500 flex-shrink-0"><CheckIcon /></div>
                                )}
                                <span>{log}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {connectionState === 'connected' && (
                <div className="space-y-8">
                     <div className={`${cardStyle} text-center animate-fade-in`}>
                        <div className="flex justify-center mb-3">
                            <CheckCircleIcon />
                        </div>
                        <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>Stripe Account Connected via Automate Your Spa Portal!</h3>
                        <p className="text-stone-600 mt-1">
                            Your Automate Your Spa Portal-linked account <span className="font-semibold text-pink-600">acct_...a4b2</span> is now active.
                        </p>
                        <button 
                            onClick={handleDisconnect}
                            className="mt-4 text-xs font-semibold text-stone-500 hover:text-stone-800"
                        >
                            Disconnect
                        </button>
                    </div>
                    
                    <div className={`${cardStyle} animate-fade-in`} style={{ animationDelay: '200ms' }}>
                         <h3 className="font-bold text-xl text-stone-800 mb-4" style={title3DStyle}>Recent Transactions</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-stone-500 border-b border-pink-200">
                                    <tr>
                                        <th className="py-2 px-3 font-semibold">Amount</th>
                                        <th className="py-2 px-3 font-semibold">Description</th>
                                        <th className="py-2 px-3 font-semibold">Date</th>
                                        <th className="py-2 px-3 font-semibold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockTransactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-pink-100 last:border-b-0">
                                            <td className="py-3 px-3 font-semibold text-stone-800">{tx.amount}</td>
                                            <td className="py-3 px-3 text-stone-600">{tx.description}</td>
                                            <td className="py-3 px-3 text-stone-500">{tx.date}</td>
                                            <td className="py-3 px-3 text-right">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                                    tx.status === 'Succeeded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInFast {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                .animate-fade-in-fast { animation: fadeInFast 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Payments;
