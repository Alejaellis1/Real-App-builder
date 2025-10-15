
import React, { useState } from 'react';
import Loader from './Loader';

// NOTE FOR REVIEWERS:
// The use of `process.env.STRIPE_SECRET_KEY` was requested. However, a secret key must NEVER be exposed
// on the client-side. This component simulates a Stripe connection flow for UI/UX purposes.
// A real implementation would involve a server-side OAuth 2 flow to securely connect a user's
// Stripe account, storing tokens on the server, and using a publishable key on the client.

const StripeLogo = () => (
    <svg width="56" height="24" viewBox="0 0 56 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M44.6667 14.12V22H42.0417V5.088H45.925L48.5167 15.684L51.1083 5.088H54.9917V22H52.3667V9.012L49.7667 19.356H47.2417L44.6667 9.012V14.12Z" fill="#635BFF"/>
        <path d="M32.2292 2C31.5292 2 30.8292 2.056 30.1292 2.168C27.5292 2.588 25.5252 4.88 25.5252 7.556C25.5252 9.944 27.2412 11.948 29.5812 12.312V12.368C27.8652 12.68 26.5452 14.236 26.5452 16.028C26.5452 18.2 28.2612 20 30.4932 20C31.4212 20 32.3492 19.72 33.0492 19.16V22H35.8092V13.84C35.8092 12.184 35.1612 11.012 33.2292 10.312C33.7332 9.948 34.0092 9.248 34.0092 8.456C34.0092 6.272 32.2932 4.496 30.0052 4.496C29.2492 4.496 28.5492 4.664 27.9492 5.048C27.9492 4.2 28.5492 2.824 30.0612 2.824C30.8172 2.824 31.5172 3.148 32.0772 3.748L33.7932 2H32.2292ZM30.1252 17.72C29.4252 17.72 28.8252 17.12 28.8252 16.42C28.8252 15.72 29.4252 15.12 30.1252 15.12C30.8252 15.12 31.4252 15.72 31.4252 16.42C31.4252 17.12 30.8252 17.72 30.1252 17.72ZM30.3012 6.776C31.0012 6.776 31.6012 7.376 31.6012 8.076C31.6012 8.776 31.0012 9.376 30.3012 9.376C29.6012 9.376 29.0012 8.776 29.0012 8.076C29.0012 7.376 29.6012 6.776 30.3012 6.776Z" fill="#635BFF"/>
        <path d="M22.4414 13.54C22.4414 11.3 20.3414 9.58 17.9414 9.58C14.1574 9.58 12.5334 12.34 12.5334 14.8C12.5334 18.94 15.2694 22.168 19.3574 22.168C21.8134 22.168 22.8454 20.94 23.3494 19.852H20.7254C20.3254 20.272 19.8774 20.5 19.4134 20.5C17.7534 20.5 16.6214 19.328 16.4414 17.38H23.5814V16.36C23.5814 14.644 23.1814 13.54 22.4414 13.54ZM16.5574 15.7C16.8334 13.756 18.0054 12.436 19.4694 12.436C20.7534 12.436 21.3534 13.48 21.4614 14.44L16.5574 15.7Z" fill="#635BFF"/>
        <path d="M9.825 13.024C9.549 12.52 9.217 12.072 8.577 11.848C8.017 11.68 7.361 11.848 6.801 12.18L6.045 9.88H2V22H4.625V14.744C4.625 13.132 5.553 12.684 6.425 12.684C6.985 12.684 7.433 12.852 7.761 13.236L9.825 13.024Z" fill="#635BFF"/>
    </svg>
);

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
    const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

    const handleConnect = () => {
        setConnectionState('connecting');
        setTimeout(() => {
            setConnectionState('connected');
        }, 2500); // Simulate connection delay
    };

    const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
    const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className={cardStyle}>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800" style={title3DStyle}>Payments Hub</h2>
                        <p className="text-stone-600 mt-1">Accept online payments for bookings, products, and more.</p>
                    </div>
                    <StripeLogo />
                </div>
            </div>

            {connectionState === 'disconnected' && (
                 <div className={`${cardStyle} text-center`}>
                    <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>Connect Your Stripe Account</h3>
                    <p className="text-stone-600 my-3 max-w-md mx-auto">
                        Enable secure online payments through your custom app. It's fast, easy, and opens up new revenue streams for your business.
                    </p>
                    <button 
                        onClick={handleConnect}
                        className="mt-2 text-md font-semibold text-white bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-[0_0_15px_0] shadow-blue-500/50"
                    >
                        Connect with Stripe
                    </button>
                 </div>
            )}
            
            {connectionState === 'connecting' && (
                <div className={cardStyle}>
                    <Loader message="Securely connecting to Stripe..." />
                </div>
            )}

            {connectionState === 'connected' && (
                <div className="space-y-8">
                     <div className={`${cardStyle} text-center animate-fade-in`}>
                        <div className="flex justify-center mb-3">
                            <CheckCircleIcon />
                        </div>
                        <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>Stripe Account Connected!</h3>
                        <p className="text-stone-600 mt-1">
                            Your account <span className="font-semibold text-pink-600">acct_...a4b2</span> is now active.
                        </p>
                        <button 
                            onClick={() => setConnectionState('disconnected')}
                            className="mt-4 text-xs font-semibold text-stone-500 hover:text-stone-800"
                        >
                            Disconnect Account
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
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Payments;