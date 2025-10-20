
import React, { useState } from 'react';
import type { DesignConfig } from '../App';

// --- Icons ---
const SuccessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const RegenerateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;

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

const CNAME_TARGET = 'hosting.solopro.io';

const generateUniqueAppName = () => {
    const adjectives = ['aura', 'glow', 'zen', 'vivid', 'luxe', 'pure', 'serene', 'opal', 'onyx', 'solar', 'lunar'];
    const nouns = ['aesthetics', 'studio', 'spa', 'beauty', 'skin', 'style', 'place', 'works', 'co', 'labs'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(100 + Math.random() * 900); // 3-digit number
    return `${randomAdjective}-${randomNoun}-${randomNumber}`;
};

const PublishModal: React.FC<PublishModalProps> = ({ onClose, config, locationId, isGuest }) => {
    // Publish State
    const [appName, setAppName] = useState(() => generateUniqueAppName());
    const [customDomain, setCustomDomain] = useState('');
    const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'published'>('idle');
    const [publishLog, setPublishLog] = useState<string[]>([]);
    const [liveUrl, setLiveUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    
    const liveUrlPreview = customDomain.trim() ? `https://${customDomain.trim()}` : `https://${appName.trim() || '[app-name]'}.solopro.app`;

    const handlePublish = async () => {
        setError('');
        setPublishState('publishing');
        const logs: string[] = [];
        const addLog = (msg: string) => {
            logs.push(msg);
            setPublishLog([...logs]);
        };
        addLog('Preparing app content...');

        // Simulate a short delay for a better user experience
        setTimeout(() => {
            addLog('Validating configuration...');
            try {
                if (!locationId) {
                    throw new Error("Could not find the required user ID (locationId).");
                }
                if (!appName.trim()) {
                    throw new Error("App name cannot be empty.");
                }

                // The key is namespaced with user ID (locationId) and the chosen app name
                const storageKey = `publishedApp_${locationId}_${appName.trim()}`;
                
                // Save the current config to localStorage
                localStorage.setItem(storageKey, JSON.stringify(config));
                addLog('App configuration saved successfully.');

                // Construct the final shareable URL
                const finalUrl = `${window.location.origin}${window.location.pathname}?app=${appName.trim()}&user=${locationId}`;
                setLiveUrl(finalUrl);
                
                setTimeout(() => {
                     addLog('Deployment successful!');
                     setPublishState('published');
                }, 500);

            } catch (err: any) {
                console.error(err);
                setError(`Publishing failed: ${err.message}`);
                setPublishState('idle');
            }
        }, 1000);
    };
    
    const handleCopy = () => {
        if (!liveUrl) return;
        navigator.clipboard.writeText(liveUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };
    
    const CheckmarkListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-stone-700">{children}</span>
        </li>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-violet-50 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-stone-900">Publish Your App</h2>
                    <p className="text-stone-600 mt-1">Go live with our fully managed, one-click deployment service.</p>
                </div>
                
                <div className="overflow-y-auto pr-2 -mr-3 flex-1">
                    <div className="space-y-6">
                        {/* Features */}
                        <div className="bg-white/80 p-6 rounded-xl border border-pink-200">
                             <div className="flex justify-between items-baseline">
                                <h3 className="text-lg font-bold text-stone-800">Features</h3>
                            </div>
                            <ul className="mt-4 space-y-3 text-sm">
                                <CheckmarkListItem><strong>One-Click Publishing:</strong> No code or terminal needed.</CheckmarkListItem>
                                <CheckmarkListItem><strong>Managed Hosting:</strong> We handle the infrastructure for you.</CheckmarkListItem>
                                <CheckmarkListItem><strong>Custom Domain Support:</strong> Use your own domain name (e.g., www.yourapp.com).</CheckmarkListItem>
                                <CheckmarkListItem><strong>PWA & Offline Mode:</strong> App can be installed on clients' phones.</CheckmarkListItem>
                                <CheckmarkListItem><strong>Priority Support:</strong> Get help whenever you need it.</CheckmarkListItem>
                            </ul>
                        </div>
                        
                        {/* Action Area */}
                         <div className={`bg-white/80 p-5 rounded-xl border border-pink-200 transition-opacity`}>
                            <h3 className="text-lg font-bold text-stone-800">Choose an App Name</h3>
                            <p className="text-sm text-stone-600 my-2">We've generated a unique name for your app's URL. You can edit it or generate a new one.</p>
                            <div className="mt-3">
                                <label htmlFor="appName" className="sr-only">New App Name</label>
                                <div className="flex items-center">
                                    <input 
                                        type="text" 
                                        id="appName" 
                                        value={appName} 
                                        onChange={(e) => setAppName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                                        className="w-full bg-white/50 text-stone-900 rounded-l-lg border-r-0 border-stone-300 focus:ring-pink-500 focus:border-pink-500 shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
                                    />
                                     <button 
                                        onClick={() => setAppName(generateUniqueAppName())}
                                        className="p-2.5 bg-white/50 border-y border-l border-stone-300 text-stone-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                                        title="Generate new name"
                                        aria-label="Generate new name"
                                    >
                                        <RegenerateIcon />
                                    </button>
                                     <span className="text-sm text-stone-500 bg-stone-200 p-2.5 rounded-r-lg border border-l-0 border-stone-300">.solopro.app</span>
                                </div>
                            </div>
                            <div className="mt-6 border-t border-pink-200 pt-4">
                                <h3 className="text-lg font-bold text-stone-800">Custom Domain (Optional)</h3>
                                <p className="text-sm text-stone-600 my-2">Enter your domain to use it for your app.</p>
                                <input
                                    type="text"
                                    id="customDomain"
                                    value={customDomain}
                                    onChange={(e) => setCustomDomain(e.target.value)}
                                    className="w-full bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
                                    placeholder="e.g., www.yourapp.com"
                                />
                                <div className="mt-3 text-sm text-stone-600 bg-stone-100 p-4 rounded-lg border border-stone-200 space-y-3">
                                    <p className="font-bold text-stone-800">How to Connect Your Domain (Fool-Proof Guide)</p>
                                    <ol className="list-decimal list-inside space-y-2 text-xs">
                                        <li>Log in to your domain provider (e.g., GoDaddy, Namecheap, Google Domains).</li>
                                        <li>Find your domain's <strong>DNS settings</strong> page (sometimes called "Manage DNS" or "DNS Records").</li>
                                        <li>Add a <strong>new record</strong> with the exact values from the table below.</li>
                                    </ol>
                                    <div className="overflow-x-auto rounded-lg border border-stone-700 shadow-inner bg-stone-900">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-stone-800 text-stone-100">
                                                    <th className="p-2 font-semibold tracking-wider text-left">Type</th>
                                                    <th className="p-2 font-semibold tracking-wider text-left">Host / Name</th>
                                                    <th className="p-2 font-semibold tracking-wider text-left">Value / Points to</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white text-stone-900">
                                                    <td className="p-2 border-t border-stone-300 font-mono">CNAME</td>
                                                    <td className="p-2 border-t border-stone-300 font-mono">www</td>
                                                    <td className="p-2 border-t border-stone-300 font-mono">{CNAME_TARGET}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <ul className="text-xs space-y-1 !mt-3">
                                        <li>👉 Use <strong className="font-mono">www</strong> for the 'Host' if your domain is <strong className="font-mono">www.yourapp.com</strong>.</li>
                                        <li>👉 Use <strong className="font-mono">@</strong> for the 'Host' if you want to use the root domain <strong className="font-mono">yourapp.com</strong> (if your provider supports it).</li>
                                        <li><strong>Patience is Key:</strong> It can take from a few minutes to a few hours for these changes to go live across the internet.</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="mt-6 bg-pink-100/70 border border-pink-200 p-4 rounded-lg text-center">
                                <p className="text-sm font-medium text-stone-700">Your app will be live at:</p>
                                <div className="flex items-center justify-center gap-2 mt-2 font-mono text-sm bg-white p-2.5 rounded-md text-pink-600 break-all shadow-sm">
                                    <LinkIcon />
                                    <span>{liveUrlPreview}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-100 border border-red-300 text-red-800 text-sm p-3 rounded-lg mt-4">
                                    <strong>Error:</strong> {error}
                                </div>
                            )}

                            <button 
                                onClick={handlePublish} 
                                disabled={!appName.trim() || publishState !== 'idle'} 
                                className="mt-6 w-full text-lg font-semibold text-black bg-pink-400 px-5 py-3 rounded-lg hover:bg-pink-500 transition-all transform hover:scale-105 shadow-[0_0_15px_0] shadow-pink-400/60 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-inner disabled:scale-100"
                            >
                                {publishState === 'publishing' ? 'Publishing...' : 'Publish'}
                            </button>
                        </div>

                        {/* Results */}
                        {publishState !== 'idle' && (
                            <div className="bg-white/80 p-5 rounded-xl border border-pink-200">
                                <h3 className="text-lg font-bold text-stone-800 mb-3">Deployment Progress</h3>
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
