
import React, { useState, useEffect } from 'react';
import { getBusinessInsights } from '../services/geminiService';
import Loader from './Loader';

// Icons for KPIs and Actions
const TrendUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>;
const TrendDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ActionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>;


const demoData = {
    weekly_bookings: { value: 15, trend: 0.1 }, // 10% up
    monthly_revenue: { value: 3200, trend: -0.05 }, // 5% down
    client_retention: { value: 0.7, trend: 0.02 }, // 2% up
    leads_generated: { value: 10, trend: 0 }, // neutral
    leads_converted: { value: 5, trend: 0.25 }, // 25% up
    top_services: ["Botox", "Facials", "Lash Extensions"],
    recent_social_posts: [
        { platform: "Instagram", engagement: 120 },
        { platform: "TikTok", engagement: 90 }
    ]
};

const liveData = {
    weekly_bookings: { value: 22, trend: 0.15 },
    monthly_revenue: { value: 5600, trend: 0.12 },
    client_retention: { value: 0.82, trend: 0.05 },
    leads_generated: { value: 25, trend: 0.3 },
    leads_converted: { value: 15, trend: 0.1 },
    top_services: ["Microneedling", "Botox", "Chemical Peels"],
    recent_social_posts: [
        { platform: "Instagram", engagement: 250 },
        { platform: "TikTok", engagement: 180 }
    ]
};

const demoInsights = [
  "Your revenue dipped slightly last month. Consider running a 'win-back' campaign for clients who haven't booked in over 90 days. A small discount can reactivate them.",
  "Your client retention is strong! Leverage this by creating a referral program. Offer existing clients a credit for each new client they bring in.",
  "Botox is your top service. Create an Instagram post highlighting its benefits or showcasing a before-and-after to attract more high-value bookings.",
];


const KpiCard: React.FC<{ title: string; value: string; trend: number; note: string; }> = ({ title, value, trend, note }) => {
    const isUp = trend > 0;
    const isDown = trend < 0;
    const trendPercent = Math.abs(trend * 100).toFixed(0) + '%';
    
    return (
        <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-200">
            <h4 className="text-sm font-semibold text-stone-600">{title}</h4>
            <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl font-bold text-stone-900">{value}</p>
                {trend !== 0 && (
                    <div className={`flex items-center text-xs font-bold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                        {isUp ? <TrendUpIcon /> : <TrendDownIcon />}
                        <span>{trendPercent}</span>
                    </div>
                )}
            </div>
            <p className="text-xs text-stone-500 mt-1">{note}</p>
        </div>
    );
};

const BusinessCoach: React.FC = () => {
    const [isSoloProConnected, setIsSoloProConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const data = isSoloProConnected ? liveData : demoData;

    const generateInsights = async () => {
        setIsLoading(true);
        setInsights(null);
        setError(null);
        
        try {
            const generatedInsights = await getBusinessInsights(data);
            setInsights(generatedInsights);
        } catch(e) {
            console.error(e);
            setError("Couldn't connect to the AI. Showing sample insights instead.");
            setInsights(demoInsights); 
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        generateInsights();
    }, [isSoloProConnected]);
    
    const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
    const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header and SoloPro Connection */}
            <div className={cardStyle}>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800" style={title3DStyle}>AI Business Coach</h2>
                        <p className="text-stone-600 mt-1">Your personalized dashboard for business growth.</p>
                    </div>
                </div>
                {!isSoloProConnected ? (
                    <div className="mt-4 bg-pink-50 border border-pink-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                         <div className="flex items-center gap-3">
                            <InfoIcon />
                            <p className="text-sm text-pink-800 text-center sm:text-left">
                                This is demo data. Connect your SoloPro account to see your real insights.
                            </p>
                         </div>
                        <button 
                            onClick={() => setIsSoloProConnected(true)}
                            className="text-sm font-semibold text-white bg-pink-600 px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors whitespace-nowrap w-full sm:w-auto"
                        >
                            Connect SoloPro Account
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-sm text-green-800 font-semibold">
                            ✅ SoloPro Account Connected. Displaying live data.
                        </p>
                         <button 
                            onClick={() => setIsSoloProConnected(false)}
                            className="text-sm font-semibold text-stone-600 hover:text-stone-900"
                         >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className={cardStyle}>
                <h3 className="font-bold text-xl text-stone-800 mb-4" style={title3DStyle}>Key Performance Indicators</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <KpiCard title="Weekly Bookings" value={`${data.weekly_bookings.value}`} trend={data.weekly_bookings.trend} note="vs. last week" />
                    <KpiCard title="Monthly Revenue" value={`$${data.monthly_revenue.value.toLocaleString()}`} trend={data.monthly_revenue.trend} note="vs. last month" />
                    <KpiCard title="Client Retention" value={`${(data.client_retention.value * 100).toFixed(0)}%`} trend={data.client_retention.trend} note="60-day cohort" />
                    <KpiCard title="Leads Generated" value={`${data.leads_generated.value}`} trend={data.leads_generated.trend} note="this month" />
                    <KpiCard title="Leads Converted" value={`${data.leads_converted.value}`} trend={data.leads_converted.trend} note="this month" />
                    <KpiCard title="Top Service" value={data.top_services[0]} trend={0} note="most booked" />
                </div>
            </div>

            {/* AI Insights & Actions */}
            <div className={cardStyle}>
                 <h3 className="font-bold text-xl text-stone-800 mb-4" style={title3DStyle}>AI-Powered Insights & Actions</h3>
                 {isLoading && <Loader message="Analyzing your business data..." />}
                 {error && <div className="text-center p-4 text-orange-600 bg-orange-50 border border-orange-200 rounded-lg text-sm">{error}</div>}
                 {insights && (
                     <div className="space-y-4">
                        {insights.map((insight, index) => (
                             <div key={index} className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                                <p className="text-stone-700">{insight}</p>
                            </div>
                        ))}
                     </div>
                 )}
                 {/* Action Buttons - These are static examples for the demo */}
                 <div className="mt-6 border-t border-pink-200 pt-4 flex flex-wrap gap-3">
                     <button onClick={() => alert('Opening email composer in SoloPro...')} className="flex items-center gap-2 text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 p-2 px-3 rounded-md hover:bg-pink-50 transition-colors">
                        <ActionIcon />
                        <span>Send Re-Engagement Email</span>
                     </button>
                      <button onClick={() => alert('Opening social scheduler in SoloPro...')} className="flex items-center gap-2 text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 p-2 px-3 rounded-md hover:bg-pink-50 transition-colors">
                        <ActionIcon />
                        <span>Schedule Social Post</span>
                     </button>
                      <button onClick={() => alert(`Creating promotion for ${data.top_services[1]}...`)} className="flex items-center gap-2 text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 p-2 px-3 rounded-md hover:bg-pink-50 transition-colors">
                        <ActionIcon />
                        <span>Create Promotion for {data.top_services[1]}</span>
                     </button>
                 </div>
            </div>
        </div>
    );
};

export default BusinessCoach;
