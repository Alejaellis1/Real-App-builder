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

// In a real app embedded in Automate Your Spa Portal, this function would use the GHL API
// to fetch live performance data for the current sub-account (locationId).
const fetchAutomateYourSpaPortalKpiData = async () => {
    console.log("Fetching live KPI data from Automate Your Spa Portal...");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Data received.");
    return liveData;
};


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
    const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [kpiData, setKpiData] = useState(demoData);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const [insights, setInsights] = useState<string[] | null>(demoInsights);
    const [error, setError] = useState<string | null>(null);

    const generateInsights = async (dataToAnalyze: typeof demoData) => {
        setIsGeneratingInsights(true);
        setInsights(null);
        setError(null);
        
        try {
            const generatedInsights = await getBusinessInsights(dataToAnalyze);
            setInsights(generatedInsights);
        } catch(e) {
            console.error(e);
            setError("Couldn't connect to the AI. Showing sample insights instead.");
            setInsights(demoInsights); 
        } finally {
            setIsGeneratingInsights(false);
        }
    };

    const handleConnectAutomateYourSpaPortal = async () => {
        setConnectionState('connecting');
        try {
            const data = await fetchAutomateYourSpaPortalKpiData();
            setKpiData(data);
            setConnectionState('connected');
            await generateInsights(data);
        } catch (e) {
            console.error("Failed to fetch Automate Your Spa Portal data", e);
            setConnectionState('disconnected');
        }
    };
    
    const handleDisconnectAutomateYourSpaPortal = () => {
        setConnectionState('disconnected');
        setKpiData(demoData);
        setInsights(demoInsights);
    };

    const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
    const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header and Connection */}
            <div className={cardStyle}>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800" style={title3DStyle}>AI Business Coach</h2>
                        <p className="text-stone-600 mt-1">Your personalized dashboard for business growth.</p>
                    </div>
                </div>
                {connectionState === 'disconnected' && (
                    <div className="mt-4 bg-pink-50 border border-pink-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                         <div className="flex items-center gap-3">
                            <InfoIcon />
                            <p className="text-sm text-pink-800 text-center sm:text-left">
                                This is demo data. Connect your Automate Your Spa Portal account to pull your live KPIs.
                            </p>
                         </div>
                        <button 
                            onClick={handleConnectAutomateYourSpaPortal}
                            className="text-sm font-semibold text-white bg-pink-600 px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors whitespace-nowrap w-full sm:w-auto"
                        >
                            Connect Automate Your Spa Portal Account
                        </button>
                    </div>
                )}
                 {connectionState === 'connecting' && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-sm text-blue-800 font-semibold animate-pulse">
                            Connecting to Automate Your Spa Portal and fetching live data...
                        </p>
                    </div>
                )}
                {connectionState === 'connected' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-sm text-green-800 font-semibold">
                            ✅ Automate Your Spa Portal Account Connected. Displaying live data.
                        </p>
                         <button 
                            onClick={handleDisconnectAutomateYourSpaPortal}
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
                    <KpiCard title="Weekly Bookings" value={`${kpiData.weekly_bookings.value}`} trend={kpiData.weekly_bookings.trend} note="vs. last week" />
                    <KpiCard title="Monthly Revenue" value={`$${kpiData.monthly_revenue.value.toLocaleString()}`} trend={kpiData.monthly_revenue.trend} note="vs. last month" />
                    <KpiCard title="Client Retention" value={`${(kpiData.client_retention.value * 100).toFixed(0)}%`} trend={kpiData.client_retention.trend} note="60-day cohort" />
                    <KpiCard title="Leads Generated" value={`${kpiData.leads_generated.value}`} trend={kpiData.leads_generated.trend} note="this month" />
                    <KpiCard title="Leads Converted" value={`${kpiData.leads_converted.value}`} trend={kpiData.leads_converted.trend} note="this month" />
                    <KpiCard title="Top Service" value={kpiData.top_services[0]} trend={0} note="most booked" />
                </div>
            </div>

            {/* AI Insights & Actions */}
            <div className={cardStyle}>
                 <h3 className="font-bold text-xl text-stone-800 mb-4" style={title3DStyle}>AI-Powered Insights & Actions</h3>
                 {isGeneratingInsights && <Loader message="Analyzing your business data..." />}
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
                     <button onClick={() => alert('This would open the email workflow composer in Automate Your Spa Portal, targeted at a smart list of clients who haven\'t booked recently (based on your live Automate Your Spa Portal data).')} className="flex items-center gap-2 text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 p-2 px-3 rounded-md hover:bg-pink-50 transition-colors">
                        <ActionIcon />
                        <span>Send Re-Engagement Email via Automate Your Spa Portal</span>
                     </button>
                      <button onClick={() => alert(`This would open the social post scheduler in Automate Your Spa Portal, pre-filled with content related to your top service, '${kpiData.top_services[0]}'.`)} className="flex items-center gap-2 text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 p-2 px-3 rounded-md hover:bg-pink-50 transition-colors">
                        <ActionIcon />
                        <span>Schedule Social Post in Automate Your Spa Portal</span>
                     </button>
                      <button onClick={() => alert(`This would create a new promotion in Automate Your Spa Portal for your service '${kpiData.top_services[1]}', allowing you to easily share it with clients.`)} className="flex items-center gap-2 text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 p-2 px-3 rounded-md hover:bg-pink-50 transition-colors">
                        <ActionIcon />
                        <span>Create Promotion via Automate Your Spa Portal</span>
                     </button>
                 </div>
            </div>
        </div>
    );
};

export default BusinessCoach;