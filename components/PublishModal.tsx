
import React, { useState, useEffect } from 'react';
import type { DesignConfig } from '../App';

// --- Icons ---
const SuccessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;

const IosShareIcon = () => (
    <div className="w-7 h-7 bg-white/60 border border-gray-300 rounded-md flex items-center justify-center inline-block ml-1.5 shadow-sm align-middle">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
    </div>
);

const AddToHomeScreenIcon = () => (
    <div className="w-7 h-7 bg-white/60 border border-gray-300 rounded-lg flex items-center justify-center inline-block ml-1.5 shadow-sm align-middle">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
    </div>
);

const AndroidMenuIcon = () => (
    <div className="w-7 h-7 bg-white/60 border border-gray-300 rounded-md flex items-center justify-center inline-block ml-1.5 shadow-sm align-middle">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
    </div>
);


interface PublishModalProps {
    onClose: () => void;
    config: DesignConfig;
    locationId: string;
    isGuest: boolean;
}

const PublishModal: React.FC<PublishModalProps> = ({ onClose, config, locationId, isGuest }) => {
    // Publish State
    const [email, setEmail] = useState('');
    const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'published'>('idle');
    const [publishLog, setPublishLog] = useState<string[]>([]);
    const [liveUrl, setLiveUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Pre-fill email if locationId is a valid email and not a guest
        if (!isGuest && locationId && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(locationId)) {
            setEmail(locationId);
        }
    }, [locationId, isGuest]);
    
    const handlePublish = async () => {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setError('');
        setPublishState('publishing');
        const logs: string[] = [];
        const addLog = (msg: string) => {
            logs.push(msg);
            setPublishLog([...logs]);
        };
        addLog('Verifying publication status...');

        try {
            // Note: The user requested a POST request, but the verification endpoint
            // is designed to be a GET request. Proceeding with GET.
            const response = await fetch(`/api/check-publish.js?contact_id=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            addLog('Receiving response from server...');
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An unknown server error occurred.');
            }

            if (data.success) {
                addLog('Verification successful! App is published.');
                const fullUrl = `${window.location.origin}${data.url}`;
                setLiveUrl(fullUrl);
                setPublishState('published');
            } else {
                setError(data.message || 'Payment Required / Not Published');
                setPublishState('idle');
            }

        } catch (err: any) {
            console.error(err);
            setError(`Verification failed: ${err.message || 'A network error occurred. Please try again.'}`);
            setPublishState('idle'); // Reset state on failure
        }
    };
    
    const handleCopy = () => {
        if (!liveUrl) return;
        navigator.clipboard.writeText(liveUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-violet-50 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-stone-900">Check App Status</h2>
                    <p className="text-stone-600 mt-1">Verify if your app is published and retrieve the live URL.</p>
                </div>
                
                <div className="overflow-y-auto pr-2 -mr-3 flex-1">
                    <div className="space-y-6">
                         {publishState === 'idle' && (
                             <div className={`bg-white/80 p-5 rounded-xl border border-pink-200 transition-opacity`}>
                                <h3 className="text-lg font-bold text-stone-800">Verify Publication</h3>
                                <p className="text-sm text-stone-600 my-2">
                                    Enter the email address associated with your account to check the status.
                                </p>
                                <div className="mt-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-2">
                                        Account Email
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="w-full bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-100 border border-red-300 text-red-800 text-sm p-3 rounded-lg mt-4">
                                        <strong>Status:</strong> {error}
                                    </div>
                                )}

                                <button 
                                    onClick={handlePublish} 
                                    disabled={publishState !== 'idle'} 
                                    className="mt-6 w-full text-lg font-semibold text-black bg-pink-400 px-5 py-3 rounded-lg hover:bg-pink-500 transition-all transform hover:scale-105 shadow-[0_0_15px_0] shadow-pink-400/60 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-inner disabled:scale-100"
                                >
                                    Check Status
                                </button>
                            </div>
                         )}
                        

                        {/* Results */}
                        {publishState !== 'idle' && (
                            <div className="bg-white/80 p-5 rounded-xl border border-pink-200">
                                <h3 className="text-lg font-bold text-stone-800 mb-3">Verification Progress</h3>
                                {publishState === 'publishing' && (
                                    <ul className="space-y-2">
                                        {publishLog.map((log, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-stone-600 animate-fade-in-fast">
                                                {i === publishLog.length - 1 ? (
                                                     <div className="w-4 h-4"><svg className="animate-spin h-4 w-4 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div>
                                                ) : (
                                                    <div className="w-4 h-4 text-green-500"><CheckIcon /></div>
                                                )}
                                               <span>{log}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {publishState === 'published' && (
                                    <div className="text-center animate-fade-in">
                                        <div className="flex justify-center">
                                            <SuccessIcon />
                                        </div>
                                        <h4 className="font-bold text-green-800 mt-2 text-xl">Published! Your App is Live.</h4>
                                        
                                        <div className="mt-4">
                                            <label htmlFor="liveUrl" className="sr-only">Live URL</label>
                                            <div className="flex rounded-md shadow-sm">
                                                <input 
                                                    type="text" 
                                                    id="liveUrl" 
                                                    readOnly 
                                                    value={liveUrl} 
                                                    className="flex-1 block w-full min-w-0 rounded-none rounded-l-md border-stone-300 bg-stone-50 text-pink-700 px-3 py-2 text-sm font-mono"
                                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                                />
                                                <button 
                                                    onClick={handleCopy} 
                                                    className="relative inline-flex items-center space-x-2 rounded-r-md border border-l-0 border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200 transition-colors w-20 justify-center"
                                                >
                                                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 text-left">
                                            <h5 className="font-bold text-stone-800 text-center mb-2">Add to Your Home Screen</h5>
                                            <p className="text-sm text-center text-stone-600 mb-4">For an app-like experience, add a shortcut to your phone.</p>
                                            
                                            <div className="space-y-4">
                                                {/* iOS Instructions */}
                                                <div className="bg-pink-100/70 border border-pink-200 p-4 rounded-lg">
                                                    <h6 className="font-semibold text-stone-800 text-center mb-3">For iPhone Users (Safari)</h6>
                                                    <ol className="text-sm text-stone-700 space-y-3">
                                                        <li className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                                                            <span className="flex-shrink-0 font-bold text-pink-600 bg-white border border-pink-200 rounded-full w-6 h-6 flex items-center justify-center">1</span>
                                                            <span className="flex-1 flex items-center justify-between">First, tap the <strong>Share</strong> button {<IosShareIcon />}</span>
                                                        </li>
                                                        <li className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                                                            <span className="flex-shrink-0 font-bold text-pink-600 bg-white border border-pink-200 rounded-full w-6 h-6 flex items-center justify-center">2</span>
                                                            <span className="flex-1 flex items-center justify-between">Then, tap <strong>'Add to Home Screen'</strong> {<AddToHomeScreenIcon />}</span>
                                                        </li>
                                                    </ol>
                                                </div>

                                                {/* Android Instructions */}
                                                <div className="bg-green-100/70 border border-green-200 p-4 rounded-lg">
                                                    <h6 className="font-semibold text-stone-800 text-center mb-3">For Android Users (Chrome)</h6>
                                                    <ol className="text-sm text-stone-700 space-y-3">
                                                        <li className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                                                            <span className="flex-shrink-0 font-bold text-green-600 bg-white border border-green-200 rounded-full w-6 h-6 flex items-center justify-center">1</span>
                                                            <span className="flex-1 flex items-center justify-between">Tap the <strong>Menu</strong> button (three dots) {<AndroidMenuIcon />}</span>
                                                        </li>
                                                        <li className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                                                            <span className="flex-shrink-0 font-bold text-green-600 bg-white border border-green-200 rounded-full w-6 h-6 flex items-center justify-center">2</span>
                                                            <span className="flex-1 flex items-center justify-between">Then, tap <strong>'Add to Home Screen'</strong> {<AddToHomeScreenIcon />}</span>
                                                        </li>
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                 <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                    @keyframes fadeInFast {
                        from { opacity: 0; transform: translateY(5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-fast {
                        animation: fadeInFast 0.3s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default PublishModal;
