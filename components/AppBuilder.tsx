
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Marketing from './Marketing';
import Design from './PromptDisplay';
import Settings from './Settings';
import Recommendations from './Recommendations';
import ClientAnalyzer from './ClientAnalyzer';
import LeadGenerator from './LeadGenerator';
import BusinessCoach from './BusinessCoach';
import Payments from './Payments';
import PublishModal from './PublishModal';
import AppPreview from './ResultDisplay';
import { RocketIcon, DesignIcon, AnalyzerIcon, RecommendationsIcon, MarketingIcon, SettingsIcon, LeadGenIcon, CoachIcon, PaymentsIcon, UndoIcon, RedoIcon } from './icons';

// FIX: Broke circular dependency with App.tsx by defining all shared types here as the single source of truth.
// This resolves multiple "Type alias circularly references itself" errors in both files.
export type ContentType = 'home' | 'services' | 'gallery' | 'blog' | 'contact';
export type GalleryItemType = 'image' | 'video';
export interface GalleryItem {
    src: string;
    type: GalleryItemType;
}
export interface Testimonial {
    author: string;
    text: string;
}
export interface NavItem {
    label: string;
    icon: string;
    iconColor: string;
    content: ContentType;
    visible: boolean;
}
export interface DesignConfig {
  theme: string;
  appName: string;
  logoUrl: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor1: string;
  accentColor2: string;
  accentColor3: string;
  fontFamily: string;
  buttonShape: 'rounded-lg' | 'rounded-md' | 'rounded-full';
  heroImageUrl: string;
  navItems: NavItem[];
  galleryItems: GalleryItem[];
  testimonials: Testimonial[];
  showServices: boolean;
  showGallery: boolean;
  showTestimonials: boolean;
  showBlog: boolean;
  showContact: boolean;
  heroTitle: string;
  homeTestimonialsTitle: string;
  homeGalleryTitle: string;
  homeBlogTitle: string;
  servicesPageTitle: string;
  galleryPageTitle: string;
  blogPageTitle: string;
  contactPageTitle: string;
  bookingLink: string;
  showBookingLink: boolean;
  aboutText: string;
  contactInfo: string;
}

interface AppBuilderProps {
    userId: string;
    isGuest: boolean;
}

const navItems = [
  { name: 'Design', icon: <DesignIcon /> },
  { name: 'Analyzer', icon: <AnalyzerIcon />, isPro: true },
  { name: 'Recommendations', icon: <RecommendationsIcon />, isPro: true },
  { name: 'Marketing', icon: <MarketingIcon />, isPro: true },
  { name: 'Lead Gen', icon: <LeadGenIcon />, isPro: true },
  { name: 'Coach', icon: <CoachIcon />, isPro: true },
  { name: 'Payments', icon: <PaymentsIcon />, isPro: true },
  { name: 'Settings', icon: <SettingsIcon /> },
];

const initialDesignConfig: DesignConfig = {
  theme: 'Oceanic',
  appName: 'Aura Aesthetics',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/346/346145.png',
  primaryColor: '#0E7490', // Teal
  backgroundColor: '#F0FDFA', // Light Cyan
  textColor: '#155E75', // Dark Cyan
  accentColor1: '#06B6D4', // Bright Cyan
  accentColor2: '#67E8F9', // Lighter Cyan
  accentColor3: '#CFFAFE', // Lightest Cyan
  fontFamily: 'Comfortaa',
  buttonShape: 'rounded-full',
  heroImageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  navItems: [
    { label: 'Home', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8Z'/%3E%3C/svg%3E", iconColor: '#0E7490', content: 'home', visible: true },
    { label: 'Services', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2Z'/%3E%3C/svg%3E", iconColor: '#155E75', content: 'services', visible: true },
    { label: 'Gallery', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ccircle cx='12' cy='12' r='3.2'/%3E%3Cpath d='M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9Zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5 5-5Z'/%3E%3C/svg%3E", iconColor: '#155E75', content: 'gallery', visible: true },
    { label: 'Blog', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5 9H13Z'/%3E%3C/svg%3E", iconColor: '#155E75', content: 'blog', visible: true },
    { label: 'Contact', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z'/%3E%3C/svg%3E", iconColor: '#155E75', content: 'contact', visible: true },
  ],
  galleryItems: [
    { type: 'image', src: 'https://images.pexels.com/photos/7174389/pexels-photo-7174389.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { type: 'image', src: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { type: 'image', src: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { type: 'image', src: 'https://images.pexels.com/photos/4127431/pexels-photo-4127431.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { type: 'image', src: 'https://images.pexels.com/photos/7615463/pexels-photo-7615463.jpeg?auto=compress&cs=tinysrgb&w=600' },
  ],
  testimonials: [
      { author: 'Jessica P.', text: 'Literally the best facial I have ever had. My skin is glowing!' },
      { author: 'Emily R.', text: 'I always leave feeling refreshed and confident. Highly recommend!' }
  ],
  showServices: true,
  showGallery: true,
  showTestimonials: true,
  showBlog: true,
  showContact: true,
  heroTitle: 'Your Brand, Your App.',
  homeTestimonialsTitle: 'What Our Clients Say',
  homeGalleryTitle: 'Featured Gallery',
  homeBlogTitle: 'From The Blog',
  servicesPageTitle: 'Our Services',
  galleryPageTitle: 'Transformation Gallery',
  blogPageTitle: 'Our Blog',
  contactPageTitle: 'Contact Us',
  bookingLink: 'https://calendly.com/your-username',
  showBookingLink: true,
  aboutText: 'Aura Aesthetics is a boutique studio dedicated to providing personalized aesthetic treatments that enhance your natural beauty and boost your confidence.',
  contactInfo: '123 Glamour Ave, Suite 101\nBeverly Hills, CA 90210\n(310) 555-0123',
};

type SaveStatus = 'unsaved' | 'saving' | 'saved';

// Helper to load state from localStorage, now user-specific
const loadState = (userId: string) => {
    const DESIGN_STATE_KEY = `soloProAppState_v1_${userId}`;
    try {
        const savedState = localStorage.getItem(DESIGN_STATE_KEY);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            // Basic validation to ensure the loaded state is not malformed
            if (parsed.designConfig && parsed.historyStack && typeof parsed.currentIndex === 'number') {
                return {
                    designConfig: parsed.designConfig,
                    historyStack: parsed.historyStack,
                    currentIndex: parsed.currentIndex,
                };
            }
        }
    } catch (error) {
        console.error("Failed to load or parse state from localStorage:", error);
    }
    // Return default state if nothing is saved or if there's an error
    return {
        designConfig: initialDesignConfig,
        historyStack: [initialDesignConfig],
        currentIndex: 0,
    };
};


const AppBuilder: React.FC<AppBuilderProps> = ({ userId, isGuest }) => {
  const [activeTab, setActiveTab] = useState('Design');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  const { designConfig: initialLoadedConfig, historyStack: initialHistory, currentIndex: initialIndex } = useMemo(() => loadState(userId), [userId]);

  const [designConfig, _setDesignConfig] = useState<DesignConfig>(initialLoadedConfig);
  const [historyStack, setHistoryStack] = useState<DesignConfig[]>(initialHistory);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const [builderTheme, setBuilderTheme] = useState(() => {
    const BUILDER_THEME_KEY = `soloProBuilderTheme_v1_${userId}`;
    try {
        const savedTheme = localStorage.getItem(BUILDER_THEME_KEY);
        return savedTheme ? JSON.parse(savedTheme) : 'Default';
    } catch {
        return 'Default';
    }
  });

  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const DESIGN_STATE_KEY = `soloProAppState_v1_${userId}`;
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = window.setTimeout(() => {
        try {
            const stateToSave = {
                designConfig: historyStack[currentIndex],
                historyStack,
                currentIndex
            };
            localStorage.setItem(DESIGN_STATE_KEY, JSON.stringify(stateToSave));
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to save state to localStorage:", error);
        }
    }, 500);
  }, [currentIndex, historyStack, userId]);
  
  useEffect(() => {
      const BUILDER_THEME_KEY = `soloProBuilderTheme_v1_${userId}`;
      try {
          localStorage.setItem(BUILDER_THEME_KEY, JSON.stringify(builderTheme));
      } catch (error) {
          console.error("Failed to save theme to localStorage:", error);
      }
  }, [builderTheme, userId]);

  const setDesignConfig = (newConfigOrUpdater: React.SetStateAction<DesignConfig>) => {
    _setDesignConfig(prevConfig => {
      const newConfig = typeof newConfigOrUpdater === 'function'
        ? (newConfigOrUpdater as (prevState: DesignConfig) => DesignConfig)(prevConfig)
        : newConfigOrUpdater;

      if (JSON.stringify(newConfig) === JSON.stringify(historyStack[currentIndex])) {
        return newConfig;
      }
      
      setSaveStatus('unsaved');
      const newHistory = historyStack.slice(0, currentIndex + 1);
      newHistory.push(newConfig);
      setHistoryStack(newHistory);
      setCurrentIndex(newHistory.length - 1);

      return newConfig;
    });
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      _setDesignConfig(historyStack[newIndex]);
      setSaveStatus('unsaved');
    }
  };

  const handleRedo = () => {
    if (currentIndex < historyStack.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      _setDesignConfig(historyStack[newIndex]);
      setSaveStatus('unsaved');
    }
  };

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < historyStack.length - 1;

  const [isScrolled, setIsScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
        setIsScrolled(mainEl.scrollTop > 10);
    };

    mainEl.addEventListener('scroll', handleScroll);
    return () => {
        mainEl.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const themeClasses: { [key: string]: string } = {
    'Default': 'bg-violet-50 text-stone-800',
    'Light': 'bg-slate-100 text-slate-800',
    'Dark': 'bg-gray-900 text-gray-100',
    'Serene': 'bg-teal-50 text-teal-900',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Marketing':
        return <Marketing />;
      case 'Design':
        return <Design config={designConfig} setConfig={setDesignConfig} />;
      case 'Settings':
        return <Settings 
                    config={designConfig} 
                    setConfig={setDesignConfig}
                    builderTheme={builderTheme}
                    setBuilderTheme={(theme) => {
                        setSaveStatus('unsaved');
                        setBuilderTheme(theme);
                    }}
                />;
      case 'Recommendations':
        return <Recommendations />;
      case 'Analyzer':
        return <ClientAnalyzer />;
      case 'Lead Gen':
        return <LeadGenerator />;
      case 'Coach':
        return <BusinessCoach />;
      case 'Payments':
        return <Payments />;
      default:
        return <Design config={designConfig} setConfig={setDesignConfig} />;
    }
  };
  
  const SaveStatusIndicator = () => {
      let text, icon;
      switch (saveStatus) {
        case 'saving':
            text = 'Saving...';
            icon = <svg className="animate-spin h-4 w-4 text-stone-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
            break;
        case 'saved':
            text = 'All changes saved';
            icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
            break;
        case 'unsaved':
        default:
            text = 'Unsaved changes';
            icon = <div className="h-3 w-3 rounded-full bg-yellow-400"></div>;
            break;
      }
      return (
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              {icon}
              <span>{text}</span>
          </div>
      );
  };

  return (
    <div className={`${themeClasses[builderTheme]} font-sans transition-colors duration-300`}
         style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems} />
      <div className="flex flex-col min-h-screen min-w-0 xl:ml-64">
        <header className={`flex justify-between items-center p-5 sm:p-6 border-b sticky top-0 z-10 transition-all duration-300 ${
            isScrolled 
            ? 'border-pink-200 bg-white/90 backdrop-blur-md shadow-md' 
            : 'border-transparent bg-white/70 backdrop-blur-sm'
        }`}>
          <div className="flex items-center gap-4">
             <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                App Builder
                </h1>
                <p className="text-sm text-pink-600 hidden sm:block">Customize your client-facing application.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="hidden sm:block">
                <SaveStatusIndicator />
            </div>
            {(activeTab === 'Design' || activeTab === 'Settings') && (
                <div className="flex items-center bg-white/80 border border-pink-200 rounded-lg shadow-sm">
                    <button 
                        onClick={handleUndo} 
                        disabled={!canUndo} 
                        className="p-2 rounded-l-md hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                        aria-label="Undo"
                        title="Undo"
                    >
                        <UndoIcon />
                    </button>
                    <div className="w-px h-5 bg-pink-200"></div>
                    <button 
                        onClick={handleRedo} 
                        disabled={!canRedo} 
                        className="p-2 rounded-r-md hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                        aria-label="Redo"
                        title="Redo"
                    >
                        <RedoIcon />
                    </button>
                </div>
            )}
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold text-black bg-pink-400 p-2 sm:px-4 sm:py-2 rounded-md hover:bg-pink-500 transition-colors shadow-[0_0_10px_0] shadow-pink-400/50">
              <RocketIcon />
              <span className="hidden md:inline">Publish</span>
            </button>
          </div>
        </header>
        <main ref={mainRef} className="flex-1 p-6 lg:p-8 overflow-y-auto pb-24 xl:pb-8">
          {renderContent()}
        </main>
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems} />
      {isPublishModalOpen && <PublishModal onClose={() => setIsPublishModalOpen(false)} config={designConfig} userId={userId} isGuest={isGuest} />}
    </div>
  );
};

export default AppBuilder;
