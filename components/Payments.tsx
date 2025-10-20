import React from 'react';

// --- ICONS & MOCK DATA ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const mockTransactions = [
    { id: 'pi_3P...', amount: '$85.00', description: 'Payment for Signature Facial', status: 'Succeeded', date: '2 days ago' },
    { id: 'pi_3P...', amount: '$250.00', description: 'Payment for Microneedling', status: 'Succeeded', date: '4 days ago' },
    { id: 'pi_3P...', amount: '$40.00', description: 'Payment for LED Therapy Add-On', status: 'Succeeded', date: '1 week ago' },
    { id: 'pi_3P...', amount: '$85.00', description: 'Payment for Signature Facial', status: 'Refunded', date: '1 week ago' },
];

const Payments: React.FC = () => {
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

            <div className="space-y-8">
                <div className={`${cardStyle} text-center animate-fade-in`}>
                    <div className="flex justify-center mb-3">
                        <CheckCircleIcon />
                    </div>
                    <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>Stripe Account Connected!</h3>
                    <p className="text-stone-600 mt-1">
                        Your Stripe account <span className="font-semibold text-pink-600">acct_...a4b2</span> is now active.
                    </p>
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
            
             <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Payments;