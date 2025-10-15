
import React, { useState, useEffect, useRef } from 'react';
import { PushIcon } from './icons';
import { generateLeads as fetchLeadsFromAI } from '../services/geminiService';

// --- SVG Icons for Contact Actions ---
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a11.03 11.03 0 004.435 4.435l.759-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const TikTokIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.65-6.48-2.31-1.64-1.66-2.52-4.03-2.52-6.39 0-2.52 1.01-4.94 2.65-6.76 1.61-1.79 3.9-2.73 6.09-2.75.09 2.05-.07 4.11-.02 6.16-.21 1.49-.96 2.96-2.09 3.95-1.14 1-2.62 1.48-4.04 1.34.03-2.05.01-4.1.04-6.16.24-1.55 1.12-2.94 2.22-3.95 1.11-1.02 2.53-1.52 3.96-1.56Z"></path></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>;


interface Lead {
    name: string;
    phone: string;
    email: string;
    social_media: { platform: string; handle: string; }[];
    profile_description: string;
    rationale: string;
    interest_score: number;
    source: string;
}

const loadingMessages = [
    "Analyzing your provider profile...",
    "Scanning for complementary businesses...",
    "Searching local directories and social media...",
    "Identifying high-potential partnership opportunities...",
    "Compiling and scoring your top leads...",
];

const LeadGenerator: React.FC = () => {
    const [providerInfo, setProviderInfo] = useState({
        service_type: 'Medspa',
        location: 'Beverly Hills, CA',
        target_radius: '15',
        lead_preferences: 'Interested in anti-aging and wellness treatments, age 30-50.',
    });
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const messageIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isLoading) {
            let index = 0;
            setLoadingMessage(loadingMessages[index]);
            messageIntervalRef.current = window.setInterval(() => {
                index = (index + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[index]);
            }, 2000);
        } else {
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
                messageIntervalRef.current = null;
            }
        }
        return () => {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        };
    }, [isLoading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setProviderInfo(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerateLeads = async () => {
        setIsLoading(true);
        setError(null);
        setLeads([]);

        try {
            const result = await fetchLeadsFromAI(providerInfo);
            setLeads(result);
        } catch (e) {
            console.error(e);
            setError("Sorry, the AI couldn't generate leads at the moment. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const exportToCSV = () => {
        if (leads.length === 0) return;
        
        const headers = ["name", "phone", "email", "social_media", "profile_description", "rationale", "interest_score", "source"];
        const csvContent = [
            headers.join(','),
            ...leads.map(lead => {
                if (!lead) return null;
                const socialMediaString = lead.social_media?.map(sm => `${sm.platform}: ${sm.handle}`).join('; ') || '';
                const row = [
                    `"${lead.name || ''}"`,
                    lead.phone || '',
                    lead.email || '',
                    `"${socialMediaString}"`,
                    `"${lead.profile_description || ''}"`,
                    `"${lead.rationale || ''}"`,
                    lead.interest_score || 0,
                    `"${lead.source || ''}"`
                ];
                return row.join(',');
            }).filter(Boolean)
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        link.href = URL.createObjectURL(blob);
        link.download = `leads_for_solopro_${providerInfo.service_type.replace(' ', '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getSocialIcon = (platform: string) => {
        const platformLower = platform.toLowerCase();
        if (platformLower.includes('instagram')) return <InstagramIcon />;
        if (platformLower.includes('tiktok')) return <TikTokIcon />;
        if (platformLower.includes('facebook')) return <FacebookIcon />;
        return null;
    };

    const getSocialLink = (platform: string, handle: string) => {
        const platformLower = platform.toLowerCase();
        const handleClean = handle.replace('@', '');
        if (platformLower.includes('instagram')) return `https://instagram.com/${handleClean}`;
        if (platformLower.includes('tiktok')) return `https://tiktok.com/@${handleClean}`;
        if (platformLower.includes('facebook')) return `https://facebook.com/${handleClean}`;
        return `https://google.com/search?q=${handle}`;
    };


    const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
    const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };
    const labelStyle = "block text-sm font-medium text-stone-600 mb-2";
    const inputStyle = "w-full bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 shadow-[0_1px_3px_rgba(10,186,181,0.3)]";
    const providerTypes = ['Hairstylist', 'Esthetician', 'Barber', 'Gym Instructor', 'Pilates Instructor', 'Medspa', 'Injector'];

    return (
        <div className="space-y-8">
            <div className={cardStyle}>
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>Real-Time Smart Lead Generator</h3>
                        <p className="text-sm text-stone-600 mb-4">
                            Define your ideal client and let AI find potential leads in your area.
                        </p>
                    </div>
                    <span className="text-xs font-bold bg-pink-500 text-white px-3 py-1 rounded-full uppercase whitespace-nowrap">Pro Feature</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="service_type" className={labelStyle}>Service Type</label>
                        <select id="service_type" value={providerInfo.service_type} onChange={handleInputChange} className={inputStyle}>
                            {providerTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="location" className={labelStyle}>Location (City, State)</label>
                        <input id="location" type="text" value={providerInfo.location} onChange={handleInputChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="target_radius" className={labelStyle}>Target Radius (miles)</label>
                        <input id="target_radius" type="number" value={providerInfo.target_radius} onChange={handleInputChange} className={inputStyle} />
                    </div>
                </div>
                 <div>
                    <label htmlFor="lead_preferences" className={labelStyle}>Lead Preferences (Optional)</label>
                    <textarea id="lead_preferences" value={providerInfo.lead_preferences} onChange={handleInputChange} className={inputStyle} rows={2} placeholder="e.g., Interested in modern hair color, age 25-40..."></textarea>
                </div>
                 <button 
                    onClick={handleGenerateLeads} 
                    disabled={isLoading}
                    className="mt-4 w-full md:w-auto text-sm font-semibold text-black bg-pink-400 px-5 py-3 rounded-lg hover:bg-pink-500 transition-colors shadow-[0_0_10px_0] shadow-pink-400/50 disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : 'Generate AI Leads'}
                </button>
                 <p className="text-xs text-stone-500 mt-3">
                    Note: The AI generates realistic, but fictional, B2B leads for demonstration purposes.
                </p>
            </div>
            
            {error && <div className={`${cardStyle} text-center p-10 text-red-600 bg-red-50 border border-red-200 rounded-lg`}>{error}</div>}
            
            {(isLoading || leads.length > 0) && (
                <div className={cardStyle}>
                    <div className="flex justify-between items-center mb-4">
                         <div>
                            <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>Generated Leads</h3>
                            {isLoading && (
                                <div className="flex items-center text-sm text-pink-600 mt-1">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="animate-pulse">{loadingMessage}</span>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={exportToCSV}
                            disabled={leads.length === 0}
                            className="text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 px-4 py-2 rounded-md hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Export for SoloPro
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-stone-600">
                            <thead className="text-xs text-stone-700 uppercase bg-pink-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Contact Info</th>
                                    <th scope="col" className="px-6 py-3">Rationale</th>
                                    <th scope="col" className="px-6 py-3 text-center">Interest Score</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead, index) => (
                                    lead && (
                                        <tr key={index} className="bg-white border-b border-pink-100 last:border-b-0 animate-fade-in">
                                            <th scope="row" className="px-6 py-4 font-medium text-stone-900 whitespace-nowrap">
                                                {lead.name}
                                                <p className="font-normal text-xs text-stone-500">{lead.profile_description}</p>
                                                <p className="font-normal text-xs text-pink-600 mt-1">Source: {lead.source}</p>
                                            </th>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2 text-xs">
                                                    <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-pink-600 hover:underline">
                                                        <EmailIcon /> <span>{lead.email}</span>
                                                    </a>
                                                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-pink-600 hover:underline">
                                                        <PhoneIcon /> <span>{lead.phone}</span>
                                                    </a>
                                                    <div className="flex items-center gap-2 mt-1 text-stone-500">
                                                        {lead.social_media?.map((sm, smIndex) => (
                                                            <a key={smIndex} href={getSocialLink(sm.platform, sm.handle)} title={`${sm.platform}: ${sm.handle}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors">
                                                                {getSocialIcon(sm.platform)}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{lead.rationale}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-lg text-pink-700">{lead.interest_score}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => alert(`This would add '${lead.name}' to your contacts in SoloPro.`)}
                                                    className="flex items-center gap-2 text-xs font-semibold text-pink-700 bg-white/80 border border-pink-200 px-3 py-1.5 rounded-md hover:bg-pink-100 transition-colors"
                                                >
                                                    <PushIcon />
                                                    Add to SoloPro
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                         {isLoading && leads.length < 10 && (
                            <div className="text-center p-4 text-stone-500">Searching for more leads...</div>
                        )}
                    </div>
                </div>
            )}
             {!isLoading && leads.length === 0 && !error && (
                 <div className={`${cardStyle} text-center p-10 text-stone-500`}>
                    Click 'Generate AI Leads' to see the AI in action.
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

export default LeadGenerator;