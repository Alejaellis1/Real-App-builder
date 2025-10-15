
import React, { useState, useRef, useEffect } from 'react';
import type { DesignConfig } from '../App';

// --- Icons ---
const GitHubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>;
const SuccessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
const RegenerateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;


type GithubState = 'idle' | 'connecting' | 'connected' | 'pushing' | 'pushed';

interface PublishModalProps {
    onClose: () => void;
    config: DesignConfig;
    userId: string;
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

const PublishModal: React.FC<PublishModalProps> = ({ onClose, config, userId, isGuest }) => {
    // Publish State
    const [appName, setAppName] = useState(() => generateUniqueAppName());
    const [customDomain, setCustomDomain] = useState('');
    const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'published'>('idle');
    const [publishLog, setPublishLog] = useState<string[]>([]);
    const [liveUrl, setLiveUrl] = useState('');

    // GitHub State
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [githubState, setGithubState] = useState<GithubState>('idle');
    const [repoName, setRepoName] = useState('aura-aesthetics-website');
    const [isRepoPrivate, setIsRepoPrivate] = useState(true);
    const [githubLog, setGithubLog] = useState<string[]>([]);
    const [repoUrl, setRepoUrl] = useState('');


    const intervalRef = useRef<number | null>(null);
    const liveUrlPreview = customDomain.trim() ? `https://${customDomain.trim()}` : `https://${appName.trim() || '[app-name]'}.solopro.app`;


    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);
    
    const handlePublish = () => {
        setPublishState('publishing');
        setPublishLog([]);
        setLiveUrl('');
    
        try {
            localStorage.setItem(`publishedApp_${userId}_${appName}`, JSON.stringify(config));
        } catch (error) {
            console.error('Error saving published app state:', error);
            setPublishLog(prev => [...prev, 'Error: Could not save app data.']);
            setPublishState('idle');
            return;
        }

        const finalUrl = customDomain.trim()
            ? `https://${customDomain.trim()}`
            : `${window.location.origin}${window.location.pathname}?app=${appName}&user=${userId}`;

        const logs = [
            "Fetching latest DesignConfig...",
            "Cloning website boilerplate from repository...",
            "Injecting user configuration into template...",
            "Generating static files (HTML, CSS, JS)...",
            "Connecting to cloud deployment service...",
            "Uploading 2.1 MB static bundle...",
            "Configuring DNS and SSL certificate...",
        ];
        if (customDomain.trim()) {
            logs.push(`Verifying custom domain: ${customDomain.trim()}...`);
        }
        logs.push("Deploying to global CDN edge network...", "App successfully deployed!");
    
        let logIndex = 0;
        intervalRef.current = window.setInterval(() => {
            if (logIndex < logs.length) {
                setPublishLog(prev => [...prev, logs[logIndex]]);
                logIndex++;
            } else {
                clearInterval(intervalRef.current!);
                setLiveUrl(finalUrl);
                setPublishState('published');
            }
        }, 900);
    };

    const handleConnectGithub = () => {
        setGithubState('connecting');
        setTimeout(() => {
            setGithubState('connected');
        }, 1500);
    };

    const handlePushToGithub = () => {
        setGithubState('pushing');
        setGithubLog([]);
        setRepoUrl('');

        const finalRepoUrl = `https://github.com/your-username/${repoName}`;

        const logs = [
            "Generating code from DesignConfig...",
            "Initializing local Git repository...",
            "Adding files to commit...",
            `Creating ${isRepoPrivate ? 'private' : 'public'} repository '${repoName}'...`,
            "Pushing initial commit to remote origin...",
            "Repository created successfully!",
        ];

        let logIndex = 0;
        intervalRef.current = window.setInterval(() => {
            if (logIndex < logs.length) {
                setGithubLog(prev => [...prev, logs[logIndex]]);
                logIndex++;
            } else {
                clearInterval(intervalRef.current!);
                setRepoUrl(finalRepoUrl);
                setGithubState('pushed');
            }
        }, 900);
    };
    
    const CheckmarkListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-stone-700">{children}</span>
        </li>
    );

    const renderGithubContent = () => {
        if (githubState === 'idle') {
            return (
                <button 
                    onClick={handleConnectGithub}
                    className="w-full flex items-center justify-center gap-3 text-lg font-semibold text-white bg-stone-800 px-5 py-3 rounded-lg hover:bg-stone-900 transition-all transform hover:scale-105 shadow-[0_0_15px_0] shadow-stone-800/40"
                >
                    <GitHubIcon />
                    Connect to GitHub
                </button>
            );
        }
        if (githubState === 'connecting') {
            return <div className="text-center text-stone-600">Connecting to GitHub...</div>;
        }
        if (githubState === 'connected') {
            return (
                 <div className="space-y-4">
                     <p className="text-sm text-center font-medium bg-green-100 text-green-800 p-2 rounded-md border border-green-200">
                        ✅ Successfully connected as <span className="font-bold">your-username</span>
                    </p>
                    <div>
                        <label htmlFor="repoName" className="block text-sm font-medium text-stone-600 mb-2">New Repository Name</label>
                        <input
                            type="text"
                            id="repoName"
                            value={repoName}
                            onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="w-full bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
                        />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" checked={isRepoPrivate} onChange={(e) => setIsRepoPrivate(e.target.checked)} className="sr-only peer" />
                            <div className="w-12 h-6 bg-stone-300 rounded-full shadow-inner transition-colors duration-300 peer-checked:bg-pink-500"></div>
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-6"></div>
                        </div>
                        <span className="text-sm font-medium text-stone-700">Private Repository</span>
                    </label>
                    <button 
                        onClick={handlePushToGithub} 
                        disabled={!repoName.trim()} 
                        className="w-full font-semibold text-white bg-stone-800 px-5 py-2.5 rounded-lg hover:bg-stone-900 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
                    >
                        Push to GitHub
                    </button>
                </div>
            );
        }
        if (githubState === 'pushing' || githubState === 'pushed') {
             return (
                <div>
                     <h3 className="text-lg font-bold text-stone-800 mb-3">Pushing to GitHub...</h3>
                    {githubState === 'pushing' && (
                        <ul className="space-y-2">
                            {githubLog.map((log, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-stone-600 animate-fade-in-fast">
                                    {i === githubLog.length - 1 ? (
                                        <div className="w-4 h-4"><svg className="animate-spin h-4 w-4 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div>
                                    ) : (
                                        <div className="w-4 h-4 text-green-500"><CheckIcon /></div>
                                    )}
                                    <span>{log}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {githubState === 'pushed' && (
                        <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
                            <SuccessIcon />
                            <h4 className="font-bold text-green-800 mt-2">Repository Created!</h4>
                            <p className="text-sm text-green-700 mt-1">Your app's code is now on GitHub:</p>
                            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-3 font-mono text-sm bg-white p-2 rounded-md text-pink-600 hover:underline break-all">
                                <GitHubIcon />
                                <span>{repoUrl.replace('https://', '')}</span>
                            </a>
                        </div>
                    )}
                </div>
            );
        }
    };


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
                        {/* Subscription Plan */}
                        <div className="bg-white/80 p-6 rounded-xl border border-pink-200">
                             <div className="flex justify-between items-baseline">
                                <h3 className="text-lg font-bold text-stone-800">Pro Subscription</h3>
                                <p className="text-2xl font-bold text-pink-600">$29<span className="text-sm font-medium text-stone-500">/mo</span></p>
                            </div>
                            <ul className="mt-4 space-y-3 text-sm">
                                <CheckmarkListItem><strong>One-Click Publishing:</strong> No code or terminal needed.</CheckmarkListItem>
                                <CheckmarkListItem><strong>Managed Hosting:</strong> We handle the infrastructure for you.</CheckmarkListItem>
                                <CheckmarkListItem><strong>Custom Domain Support:</strong> Use your own domain name (e.g., www.yourapp.com).</CheckmarkListItem>
                                <CheckmarkListItem><strong>PWA & Offline Mode:</strong> App can be installed on clients' phones.</CheckmarkListItem>
                                <CheckmarkListItem><strong>Priority Support:</strong> Get help whenever you need it.</CheckmarkListItem>
                            </ul>
                        </div>

                         {/* Advanced: GitHub */}
                        <div className="bg-white/80 rounded-xl border border-pink-200">
                           <button 
                                onClick={() => setShowAdvanced(!showAdvanced)} 
                                className="w-full flex justify-between items-center p-4 text-lg font-bold text-stone-800"
                           >
                                <span>Advanced Options</span>
                                <ChevronDownIcon className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
                           </button>
                           {showAdvanced && (
                                <div className="p-5 border-t border-pink-200 animate-fade-in-fast">
                                   <p className="text-sm text-stone-600 mb-4">Export your app's code to a GitHub repository for version control, collaboration, or custom deployment.</p>
                                   {renderGithubContent()}
                                </div>
                           )}
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

                            {isGuest ? (
                                <div className="mt-6 text-center bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                  <h4 className="font-bold text-amber-800">Connect to GoHighLevel to Publish</h4>
                                  <p className="text-sm text-amber-700 mt-1">
                                    To publish your app and get a live URL, you need to access the builder through your GoHighLevel account.
                                  </p>
                                  <button
                                    onClick={() => alert('Please access the app builder from within your GoHighLevel dashboard to publish.')}
                                    className="mt-3 w-full text-lg font-semibold text-white bg-pink-500 px-5 py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-[0_0_15px_0] shadow-pink-500/60"
                                  >
                                    Learn More
                                  </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={handlePublish} 
                                    disabled={!appName.trim() || publishState !== 'idle'} 
                                    className="mt-6 w-full text-lg font-semibold text-black bg-pink-400 px-5 py-3 rounded-lg hover:bg-pink-500 transition-all transform hover:scale-105 shadow-[0_0_15px_0] shadow-pink-400/60 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-inner disabled:scale-100"
                                >
                                    {publishState === 'publishing' ? 'Publishing...' : 'Upgrade & Publish'}
                                </button>
                            )}
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
                                    <div className="text-center">
                                        <SuccessIcon />
                                        <h4 className="font-bold text-green-800 mt-2">Published!</h4>
                                        <p className="text-sm text-green-700">Your app is now live on the web.</p>
                                        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-3 font-mono text-sm bg-white p-2.5 rounded-md text-pink-600 hover:underline break-all">
                                            <LinkIcon />
                                            <span>{liveUrl}</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                 <style>{`
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