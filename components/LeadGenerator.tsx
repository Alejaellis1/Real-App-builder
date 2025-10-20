import React, { useState, useEffect, useRef } from 'react';
import { generateLeads as fetchLeadsFromAI } from '../services/geminiService';

// --- SVG Icons for Contact Actions ---
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a11.03 11.03 0 004.435 4.435l.759-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;
const WebsiteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
const VerifiedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944a11.954 11.954 0 007.834 3.055a1.96 1.96 0 01.522 3.565A12.01 12.01 0 0110 18.451a12.01 12.01 0 01-8.356-9.886a1.96 1.96 0 01.522-3.565zM10 16.511l3.556-1.867a1 1 0 00.444-1.333l-1.222-2.115a1 1 0 00-1.333-.444L10 12.511l-1.444-.759a1 1 0 00-1.333.444l-1.222 2.115a1 1 0 00.444 1.333L10 16.511z" clipRule="evenodd" /></svg>;


interface Lead {
    company_name: string;
    website: string;
    contact_person: string;
    role: string;
    email: string;
    phone: string;
    linkedin_profile: string;
    rationale: string;
    verification_status: 'Verified' | 'Likely' | string;
    interest_score: number;
}

const loadingMessages = [
    "Analyzing ideal partner profile...",
    "Cross-referencing B2B databases for your region...",
    "Identifying key decision-makers...",
    "Verifying contact information and scoring leads...",
    "Compiling your high-intent partnership list...",
];

const LeadGenerator: React.FC = () => {
    const [providerInfo, setProviderInfo] = useState({
        service_type: 'Medspa',
        location: 'Beverly Hills, CA',
        target_radius: '15',
        lead_preferences: 'High-end salons, boutique hotels, and corporate wellness programs that cater to clients interested in anti-aging and wellness treatments, age 30-50.',
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
                        <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>AI Lead Generator</h3>
                        <p className="text-sm text-stone-600 mb-4">
                            Define your ideal partner and let AI find verified B2B leads in your area.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="service_type" className={labelStyle}>Your Service Type</label>
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
                    <label htmlFor="lead_preferences" className={labelStyle}>Ideal Client/Partner Profile</label>
                    <textarea id="lead_preferences" value={providerInfo.lead_preferences} onChange={handleInputChange} className={inputStyle} rows={2} placeholder="e.g., Boutique hotels, corporate wellness programs, high-end salons..."></textarea>
                </div>
                 <button 
                    onClick={handleGenerateLeads} 
                    disabled={isLoading}
                    className="mt-4 w-full md:w-auto text-sm font-semibold text-black bg-pink-400 px-5 py-3 rounded-lg hover:bg-pink-500 transition-colors shadow-[0_0_10px_0] shadow-pink-400/50 disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : 'Generate AI Leads'}
                </button>
            </div>
            
            {error && <div className={`${cardStyle} text-center p-10 text-red-600 bg-red-50 border border-red-200 rounded-lg`}>{error}</div>}
            
            {isLoading && (
                 <div className={`${cardStyle}`}>
                    <div className="flex justify-center items-center text-sm text-pink-600">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="animate-pulse font-semibold">{loadingMessage}</span>
                    </div>
                 </div>
            )}

            {leads.length > 0 && (
                <div className="space-y-6">
                    <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>Generated Leads</h3>
                    {leads.map((lead, index) => (
                        lead && (
                            <div key={index} className="bg-white p-5 rounded-lg border border-pink-200 shadow-sm animate-fade-in">
                                {/* Header with Company Name and Verified Badge */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg text-stone-800">{lead.company_name}</h4>
                                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-600 hover:underline flex items-center gap-1.5">
                                            <WebsiteIcon />
                                            {lead.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                                        </a>
                                    </div>
                                    {lead.verification_status === 'Verified' && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full flex-shrink-0">
                                            <VerifiedIcon />
                                            Verified
                                        </div>
                                    )}
                                </div>
                                
                                {/* Interest Score */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-semibold text-stone-600">Interest Score</span>
                                        <span className="text-sm font-bold text-pink-700">{lead.interest_score}</span>
                                    </div>
                                    <div className="w-full bg-pink-100 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-pink-400 to-pink-600 h-2 rounded-full" style={{ width: `${lead.interest_score}%` }}></div>
                                    </div>
                                </div>

                                {/* Contact Person */}
                                <div className="mt-4 border-t border-pink-100 pt-4">
                                    <p className="font-semibold text-stone-800">{lead.contact_person}</p>
                                    <p className="text-sm text-stone-500">{lead.role}</p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
                                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-pink-600 hover:underline">
                                            <EmailIcon /> {lead.email}
                                        </a>
                                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-pink-600 hover:underline">
                                            <PhoneIcon /> {lead.phone}
                                        </a>
                                        <a href={lead.linkedin_profile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-pink-600 hover:underline">
                                            <LinkedinIcon /> LinkedIn
                                        </a>
                                    </div>
                                </div>

                                {/* Rationale */}
                                <div className="mt-4 bg-pink-50/50 p-3 rounded-lg border border-pink-200">
                                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">AI Rationale</p>
                                    <p className="text-sm text-stone-700 mt-1">{lead.rationale}</p>
                                </div>
                            </div>
                        )
                    ))}
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