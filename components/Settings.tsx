
import React, { useState } from 'react';
import type { DesignConfig } from '../App';

interface SettingsProps {
  config: DesignConfig;
  setConfig: React.Dispatch<React.SetStateAction<DesignConfig>>;
  builderTheme: string;
  setBuilderTheme: (theme: string) => void;
}

type TooltipProps = {
  text: string;
  className?: string;
};

const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => (
    <div className={`relative group ${className || ''}`}>
        {children}
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs
                         bg-stone-800 text-white text-xs rounded-md py-1.5 px-3
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 shadow-lg`}>
        {text}
        </div>
    </div>
);


const Settings: React.FC<SettingsProps> = ({ config, setConfig, builderTheme, setBuilderTheme }) => {
  const [errors, setErrors] = useState<{ aboutText?: string; contactInfo?: string }>({});

  const handleSettingsChange = (field: 'aboutText' | 'contactInfo', value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));

    let error: string | null = null;
    if (field === 'aboutText' && value.length > 500) {
        error = 'About text cannot exceed 500 characters.';
    }
    if (field === 'contactInfo' && value.length > 200) {
        error = 'Contact info cannot exceed 200 characters.';
    }


    if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
    } else {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }
  };


  const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
  const labelStyle = "block text-sm font-medium text-stone-600 mb-2";
  const inputStyle = (hasError: boolean) =>
    `w-full bg-white/50 text-stone-900 rounded-lg shadow-[0_1px_3px_rgba(10,186,181,0.3)] transition-colors ${
        hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-stone-300 focus:border-pink-500 focus:ring-pink-500'
    }`;
  const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };

  const builderThemes = {
    'Default': { bg: '#F5F3FF', border: '#E9D5FF' }, // bg-violet-50, border-purple-200
    'Light': { bg: '#F8FAFC', border: '#E2E8F0' }, // bg-slate-100, border-slate-300
    'Dark': { bg: '#111827', border: '#4B5563' }, // bg-gray-900, border-gray-600
    'Serene': { bg: '#F0FDFA', border: '#A5F3FC' }, // bg-teal-50, border-cyan-200
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className={cardStyle}>
        <h3 className="font-bold text-xl mb-1 text-stone-800" style={title3DStyle}>App Information</h3>
        <p className="text-sm text-stone-600 mb-4">This info will appear on your app's static pages.</p>
        
        <div className="space-y-6">
            <Tooltip text="Write a short bio about your business. This will appear on your app's 'Contact & Info' page.">
                <div>
                    <div className="flex justify-between items-baseline">
                        <label htmlFor="aboutText" className={labelStyle}>About Us / Bio</label>
                        <span className={`text-xs ${config.aboutText.length > 500 ? 'text-red-600' : 'text-stone-500'}`}>{config.aboutText.length} / 500</span>
                    </div>
                    <textarea 
                        id="aboutText" 
                        rows={4} 
                        placeholder="Tell your clients about your business, your mission, and what makes you special."
                        className={inputStyle(!!errors.aboutText)}
                        value={config.aboutText}
                        onChange={(e) => handleSettingsChange('aboutText', e.target.value)}
                        maxLength={500}
                    ></textarea>
                     {errors.aboutText && <p className="text-xs text-red-600 mt-1">{errors.aboutText}</p>}
                </div>
            </Tooltip>
            <Tooltip text="Your business address, phone number, and hours. This will also appear on the 'Contact & Info' page.">
                 <div>
                     <div className="flex justify-between items-baseline">
                        <label htmlFor="contactInfo" className={labelStyle}>Contact Info / Address</label>
                        <span className={`text-xs ${config.contactInfo.length > 200 ? 'text-red-600' : 'text-stone-500'}`}>{config.contactInfo.length} / 200</span>
                    </div>
                    <textarea 
                        id="contactInfo" 
                        rows={3} 
                        placeholder="123 Beauty Lane, Suite 100..."
                        className={inputStyle(!!errors.contactInfo)}
                        value={config.contactInfo}
                        onChange={(e) => handleSettingsChange('contactInfo', e.target.value)}
                        maxLength={200}
                    ></textarea>
                    {errors.contactInfo && <p className="text-xs text-red-600 mt-1">{errors.contactInfo}</p>}
                </div>
            </Tooltip>
        </div>
      </div>

      <div className={cardStyle}>
        <h3 className="font-bold text-xl mb-1 text-stone-800" style={title3DStyle}>SoloPro Theme</h3>
        <p className="text-sm text-stone-600 mb-4">Customize your App builder experience by picking a theme to help your creative juices flow.</p>
        
        <Tooltip text="Change the look and feel of this App Builder panel. This setting does not affect your client's app.">
            <div>
              <label className={labelStyle}>UI Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(builderThemes).map(([name, theme]) => (
                  <button
                    key={name}
                    onClick={() => setBuilderTheme(name)}
                    className={`p-3 rounded-lg border-2 transition-all ${builderTheme === name ? 'border-pink-500 bg-pink-50 scale-105' : 'border-stone-200 hover:border-pink-300'}`}
                  >
                    <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-full" style={{ backgroundColor: theme.bg, border: `2px solid ${theme.border}` }}>
                      {builderTheme === name && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm font-semibold mt-2 text-center text-stone-700">{name}</p>
                  </button>
                ))}
              </div>
            </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default Settings;
