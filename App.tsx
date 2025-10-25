import React, { useState, useEffect } from 'react';
import AppBuilder from './components/AppBuilder';
import AppPreview from './components/ResultDisplay';
// FIX: Type alias 'DesignConfig' circularly references itself.
// This was caused by a circular dependency where AppBuilder.tsx also imported types from App.tsx.
// Types are now defined in AppBuilder.tsx as the source of truth. We import them here for use
// and re-export them for other components.
import type { DesignConfig, ContentType, GalleryItemType, GalleryItem, NavItem, Testimonial } from './components/AppBuilder';

// Re-export the types so other components that import from 'App.tsx' do not break.
export type { DesignConfig, ContentType, GalleryItemType, GalleryItem, NavItem, Testimonial };


const App: React.FC = () => {
  const [publishedAppConfig, setPublishedAppConfig] = useState<DesignConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appNotFound, setAppNotFound] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  // Effect to handle routing: check for published app, Automate Your Spa Portal user, or guest
  useEffect(() => {
    const path = window.location.pathname;
    const appPathMatch = path.match(/^\/customer-apps\/(.+)/);

    if (appPathMatch && appPathMatch[1]) {
        const appId = decodeURIComponent(appPathMatch[1]);
        setIsLoading(true);
        fetch(`/api/get-app?id=${appId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch with status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.success && data.config) {
                    setPublishedAppConfig(data.config);
                } else {
                    setAppNotFound(true);
                }
            })
            .catch(err => {
                console.error("Failed to fetch published app:", err);
                setAppNotFound(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const automateYourSpaPortalLocationId = urlParams.get('locationId');
    const GUEST_ID_KEY = 'soloProGuestId';

    if (automateYourSpaPortalLocationId) { // Builder view from Automate Your Spa Portal
        setLocationId(automateYourSpaPortalLocationId);
        setIsGuest(false);
        localStorage.removeItem(GUEST_ID_KEY); // Clean up guest ID
        setIsLoading(false);
        // Clean URL for better UX, keeping locationId for reloads
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('app');
        newUrl.searchParams.delete('user');
        window.history.replaceState({}, document.title, newUrl.toString());
    } else { // Guest user access
        let guestId = localStorage.getItem(GUEST_ID_KEY);
        if (!guestId) {
            guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(GUEST_ID_KEY, guestId);
        }
        setLocationId(guestId);
        setIsGuest(true);
        setIsLoading(false);
    }
  }, []);

  if (isLoading) {
      return <div className="w-screen h-screen bg-violet-50"></div>;
  }

  if (appNotFound) {
      return (
        <div className="w-screen h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans text-center">
            <h1 className="text-5xl font-bold text-pink-600">404</h1>
            <h2 className="text-2xl font-semibold text-stone-800 mt-2">App Not Found</h2>
            <p className="text-stone-600 mt-2 max-w-sm">The app you are looking for does not exist or has been moved. Please check the URL and try again.</p>
            <a href="/" className="mt-8 px-6 py-3 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 transition-colors font-semibold">
                ← Return to the App Builder
            </a>
        </div>
      );
  }

  if (publishedAppConfig) {
      return (
        <div className="w-screen min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4 font-sans">
             <div className="flex-grow flex items-center justify-center">
                <AppPreview config={publishedAppConfig} />
            </div>
             <div className="flex-shrink-0 mt-4 text-center">
                <p className="text-xs text-gray-500 mt-2">
                    Powered by SoloPro
                </p>
            </div>
        </div>
      );
  }
  
  // If we have a locationId (either from Automate Your Spa Portal or as a guest), render the builder.
  if (locationId) {
    return <AppBuilder locationId={locationId} isGuest={isGuest} />;
  }
  
  // Fallback, though this state should not be reachable with the new logic.
  return <div className="w-screen h-screen bg-violet-50"></div>;
};

export default App;