import React, { useState, useRef, useEffect } from 'react';
import type { DesignConfig, ContentType, GalleryItem } from '../App';

interface AppPreviewProps {
  config: DesignConfig;
}

const blogPosts = [
    {
        title: "5 Tips for Glowing Skin Before Your Big Day",
        excerpt: "Getting ready for a special event? Here are our top tips to make sure your skin is radiant and photo-ready...",
        image: "https://images.unsplash.com/photo-1552693673-1bf958298935?w=400&q=80"
    },
    {
        title: "The Truth About Microneedling: Is It For You?",
        excerpt: "We break down the benefits, the process, and what to expect from one of our most popular advanced treatments.",
        image: "https://images.unsplash.com/photo-1616394584738-FC6e6fb3e198?w=400&q=80"
    }
];

const TrimmedVideoPlayer: React.FC<{ item: GalleryItem; controls?: boolean, className?: string; autoPlay?: boolean }> = ({ item, controls = false, className = '', autoPlay = true }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hasTrim = typeof item.startTime === 'number' && typeof item.endTime === 'number' && item.endTime > item.startTime;

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !hasTrim) return;

        const handleTimeUpdate = () => {
            if (video.currentTime >= item.endTime!) {
                video.currentTime = item.startTime!;
                 if (!video.loop) {
                    video.pause();
                }
            }
        };

        const handleLoadedMetadata = () => {
            if (video.currentTime < item.startTime!) {
                video.currentTime = item.startTime!;
            }
        };
        
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);

        // Set initial time
        video.currentTime = item.startTime!;

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [item.src, item.startTime, item.endTime, hasTrim]);

    return (
        <video 
            ref={videoRef}
            src={item.src} 
            className={className}
            muted={!controls} 
            loop={!controls}
            playsInline 
            autoPlay={autoPlay && !controls}
            controls={controls}
            key={item.src} // Add key to force re-render when src changes
        />
    );
};


// --- Content Components for different tabs ---

const HomeContent: React.FC<{ config: DesignConfig; setActiveTabByContent: (content: ContentType) => void }> = ({ config, setActiveTabByContent }) => {
  const { buttonShape, showServices, heroImageUrl, showBookingLink, bookingLink } = config;

  const handleServicesClick = () => {
    setActiveTabByContent('services');
  };

  return (
    <>
      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${heroImageUrl})` }}>
        <div className="w-full h-full bg-black/40 flex items-center justify-center p-5">
          <h2 className="text-3xl font-bold text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{config.heroTitle}</h2>
        </div>
      </div>

      <div className="p-5">
        <p className="text-center opacity-80 mb-6">Welcome to a unique client experience, powered by you.</p>

        <div className="mb-6">
            {showBookingLink && bookingLink ? (
                <a 
                    href={bookingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`block text-center gel-button text-white font-bold py-3 px-4 transition-transform transform hover:scale-105 ${buttonShape}`}
                >
                    Book Now
                </a>
            ) : showServices ? (
                <button onClick={handleServicesClick} className={`w-full gel-button text-white font-bold py-3 px-4 transition-transform transform hover:scale-105 ${buttonShape}`}>
                    View Our Services
                </button>
            ) : null}
        </div>
        
        {/* Featured Service Section */}
        {config.showFeaturedService && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 themed-text">{config.featuredServiceTitle}</h3>
                <div className="accent-2-bg/30 rounded-lg overflow-hidden border themed-border shadow-md">
                    <img src={config.featuredServiceImageUrl} alt="Featured Service" className="w-full h-32 object-cover" />
                    <div className="p-4">
                        <div className="flex justify-between items-baseline">
                            <h4 className="font-bold text-lg app-text">{config.featuredServiceName}</h4>
                            <p className="font-bold text-lg accent-1-text">{config.featuredServicePrice}</p>
                        </div>
                        <p className="text-sm opacity-80 mt-2">
                            {config.featuredServiceDescription}
                        </p>
                        {config.showBookingLink && config.bookingLink && (
                            <a 
                                href={config.bookingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`inline-block mt-4 gel-button text-white font-bold py-2 px-5 text-sm transition-transform transform hover:scale-105 ${config.buttonShape}`}
                            >
                                Book This Service
                            </a>
                        )}
                    </div>
                </div>
            </div>
        )}

        {config.showTestimonials && config.testimonials && config.testimonials.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 themed-text">{config.homeTestimonialsTitle}</h3>
            <div className="space-y-4">
              {config.testimonials.slice(0, 2).map((testimonial, index) => (
                <div key={index} className="accent-3-bg p-4 rounded-lg border-l-4 themed-border">
                  <p className="italic opacity-90">"{testimonial.text}"</p>
                  <p className="text-right font-bold text-sm mt-2 accent-1-text">- {testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {config.showGallery && config.galleryItems.length > 0 && (
          <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 themed-text">{config.homeGalleryTitle}</h3>
              <div className="flex space-x-4 overflow-x-auto pb-4">
                  {config.galleryItems.slice(0, 4).map((item, index) => (
                    <div key={index} className="w-32 h-32 rounded-lg shadow-md flex-shrink-0 border-2 themed-border bg-black overflow-hidden">
                      {item.type === 'image' ? (
                        <img src={item.src} className="w-full h-full object-cover" alt={`gallery preview ${index}`} />
                      ) : (
                        <TrimmedVideoPlayer item={item} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
              </div>
          </div>
        )}
        
        {config.showBlog && blogPosts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 themed-text">{config.homeBlogTitle}</h3>
            <div className="space-y-4">
              {blogPosts.slice(0, 1).map((post, index) => (
                <div key={index} className="accent-3-bg rounded-lg overflow-hidden border themed-border">
                  <img src={post.image} alt={post.title} className="w-full h-32 object-cover" />
                  <div className="p-4">
                      <h3 className="font-bold text-lg app-text">{post.title}</h3>
                      <p className="text-sm opacity-80 mt-2">{post.excerpt}</p>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); setActiveTabByContent('blog'); }}
                        className="font-bold text-sm mt-3 inline-block themed-text hover:underline"
                      >
                        Read More &rarr;
                      </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const ServicesContent: React.FC<{config: DesignConfig}> = ({ config }) => {
  const services = [
    { name: 'Signature Facial', price: '$85', duration: '60 min' },
    { name: 'Microneedling', price: '$250', duration: '75 min' },
    { name: 'LED Therapy Add-On', price: '$40', duration: '15 min' },
    { name: 'Botox Consultation', price: 'Free', duration: '30 min' },
  ];
  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold themed-text mb-4">{config.servicesPageTitle}</h2>
      <div className="space-y-3">
        {services.map(service => (
          <div key={service.name} className="flex justify-between items-center accent-3-bg p-4 rounded-lg">
            <div>
              <p className="font-semibold">{service.name}</p>
              <p className="text-sm opacity-70">{service.duration}</p>
            </div>
            <p className="font-bold accent-1-text">{service.price}</p>
          </div>
        ))}
      </div>
      {config.showBookingLink && config.bookingLink && (
        <a 
            href={config.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-center w-full mt-6 gel-button text-white font-bold py-3 px-4 transition-transform transform hover:scale-105 ${config.buttonShape}`}>
            Book an Appointment
        </a>
       )}
    </div>
  );
};

const GalleryContent: React.FC<{config: DesignConfig}> = ({ config }) => {
  const { galleryItems } = config;

  if (!galleryItems || galleryItems.length === 0) {
    return (
        <div className="p-5 text-center">
            <h2 className="text-2xl font-bold themed-text mb-4">{config.galleryPageTitle}</h2>
            <p className="opacity-70">The gallery is currently empty. Add photos and videos in the design panel!</p>
        </div>
    );
  }

  return (
    <div className="p-5">
       <h2 className="text-2xl font-bold accent-1-text mb-4">{config.galleryPageTitle}</h2>
       <div className="columns-2 gap-4 space-y-4">
          {galleryItems.map((item, index) => (
            <div key={index} className="break-inside-avoid w-full h-auto rounded-lg shadow-md border-2 themed-border overflow-hidden bg-black flex items-center justify-center">
                {item.type === 'image' ? (
                    <img src={item.src} className="w-full h-auto object-cover" alt={`gallery item ${index + 1}`} />
                ) : (
                     <TrimmedVideoPlayer item={item} className="w-full h-auto object-cover" controls autoPlay={false} />
                )}
            </div>
          ))}
       </div>
    </div>
  );
};

const BlogContent: React.FC<{config: DesignConfig}> = ({ config }) => {
    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold themed-text mb-4">{config.blogPageTitle}</h2>
            {blogPosts.length > 0 ? (
                <div className="space-y-6">
                    {blogPosts.map((post, index) => (
                        <div key={index} className="accent-3-bg rounded-lg overflow-hidden border themed-border">
                            <img src={post.image} alt={post.title} className="w-full h-32 object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold text-lg app-text">{post.title}</h3>
                                <p className="text-sm opacity-80 mt-2">{post.excerpt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="opacity-70">No blog posts available yet. Check back soon!</p>
                </div>
            )}
        </div>
    );
};

const ContactContent: React.FC<{config: DesignConfig}> = ({ config }) => (
    <div className="p-5">
      <h2 className="text-2xl font-bold themed-text mb-4">{config.contactPageTitle}</h2>
      <div className="accent-3-bg p-4 rounded-lg space-y-3">
        <div>
          <p className="font-semibold text-sm accent-1-text opacity-90">Location</p>
          <p>123 Glamour Ave, Suite 101, Beverly Hills, CA 90210</p>
        </div>
        <div>
          <p className="font-semibold text-sm accent-1-text opacity-90">Hours</p>
          <p>Mon - Sat: 9:00 AM - 6:00 PM</p>
        </div>
        <div>
          <p className="font-semibold text-sm accent-1-text opacity-90">Phone</p>
          <p>(310) 555-0123</p>
        </div>
      </div>
       <div className="mt-4 h-40 rounded-lg bg-gray-600 flex items-center justify-center themed-text font-bold text-lg" style={{ backgroundImage: 'url(https://www.mapquestapi.com/staticmap/v5/map?key=YOUR_KEY_HERE&center=34.069,-118.40&zoom=15&size=375,160&type=dark)', backgroundSize: 'cover' }}>
          [Map Placeholder]
       </div>
    </div>
);

const FacebookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>;
const InstagramIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.645-.07-4.85s.012-3.585.07-4.85c.148-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg>;
const TiktokIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.86-.95-6.69-2.8-1.95-1.98-3.03-4.56-3.03-7.25 0-2.11 1.05-4.14 2.8-5.52.54-.42 1.12-.76 1.73-1.01.03-.01.07-.02.1-.03.02-.01.04-.01.06-.02.04-.02.09-.03.13-.04.02-.01.05-.01.07-.02.08-.02.15-.04.23-.05.02-.01.05-.01.07-.02.11-.03.23-.05.34-.07.02-.01.04-.01.06-.01.11-.03.22-.05.33-.06.02-.01.05-.01.07-.01.11-.03.22-.04.34-.06.01-.01.03-.01.05-.01.1-.02.2-.04.3-.05.02-.01.03-.01.05-.01.11-.02.22-.04.33-.05.02-.01.04-.01.06-.02.09-.02.18-.03.27-.04.04-.01.07-.02.11-.02.02-.01.03-.01.05-.01.09-.02.18-.03.27-.04a.99.99 0 0 1 .28-.04c.06-.01.12-.02.18-.03.01 0 .02-.01.03-.01.11-.02.21-.03.32-.04.03-.01.06-.01.09-.02.09-.02.18-.03.27-.04.03-.01.06-.01.09-.02.09-.02.18-.03.27-.04.02-.01.04-.01.06-.01.09-.02.19-.03.28-.04.03-.01.05-.01.08-.02.09-.02.18-.03.27-.04l.06-.01c.09-.02.18-.03.27-.04l.06-.01c.09-.02.18-.03.27-.04l.06-.01.09-.01.18-.03.27-.04.07-.01.18-.02.27-.03.06-.01.18-.02.27-.03.06-.01.18-.02.27-.03.06-.01.18-.02.27-.03.05-.01.1-.02.16-.02.08-.02.17-.03.25-.04.09-.01.18-.02.27-.03.01 0 .02 0 .02-.01.12-.02.25-.03.37-.04.04-.01.08-.01.12-.02.01 0 .02 0 .03-.01.23-.02.46-.04.69-.05.02 0 .03-.01.05-.01l.12-.01c.23-.02.46-.03.69-.04.01 0 .02 0 .03-.01.11-.01.22-.02.33-.03.02 0 .04-.01.06-.01.22-.02.45-.02.67-.03.01 0 .02 0 .03-.01.11-.01.22-.01.33-.02l.06-.01c.22-.01.45-.01.67-.02a4.99 4.99 0 0 1 .67-.02z"/></svg>;

const SocialLinks: React.FC<{ config: DesignConfig }> = ({ config }) => {
    const { facebookUrl, instagramUrl, tiktokUrl } = config;
    const hasLinks = facebookUrl || instagramUrl || tiktokUrl;

    if (!hasLinks) {
        return null;
    }

    return (
        <div className="app-bg flex items-center justify-center gap-6 py-3 border-t border-black/5">
            {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="app-text opacity-60 hover:opacity-100 themed-text-hover transition-colors">
                    <FacebookIcon />
                </a>
            )}
            {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="app-text opacity-60 hover:opacity-100 themed-text-hover transition-colors">
                    <InstagramIcon />
                </a>
            )}
            {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="app-text opacity-60 hover:opacity-100 themed-text-hover transition-colors">
                    <TiktokIcon />
                </a>
            )}
        </div>
    );
};

const AppPreview: React.FC<AppPreviewProps> = ({ config }) => {
  const { appName, logoUrl, primaryColor, backgroundColor, textColor, fontFamily, navItems, accentColor1, accentColor2, accentColor3, showServices, showGallery, showBlog, showContact } = config;
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Inline style for dynamic theming
  const appStyle = {
    '--primary-color': primaryColor,
    '--background-color': backgroundColor,
    '--text-color': textColor,
    '--accent-color-1': accentColor1,
    '--accent-color-2': accentColor2,
    '--accent-color-3': accentColor3,
    fontFamily: fontFamily,
  } as React.CSSProperties;

  const findTabIndexByContent = (content: ContentType) => {
    // Find the item in the original navItems array to get a stable index
    return navItems.findIndex(item => item.content === content);
  };

  const handleSetTabByContent = (content: ContentType) => {
      const index = findTabIndexByContent(content);
      if (index !== -1) {
          setActiveTabIndex(index);
      }
  };

  const renderActiveContent = () => {
    // Use the original navItems to determine content, even if hidden
    const activeContent = navItems[activeTabIndex]?.content || 'home';
    switch (activeContent) {
      case 'home':
        return <HomeContent config={config} setActiveTabByContent={handleSetTabByContent} />;
      case 'services':
        return <ServicesContent config={config} />;
      case 'gallery':
        return <GalleryContent config={config} />;
      case 'blog':
        return <BlogContent config={config} />;
      case 'contact':
        return <ContactContent config={config} />;
      default:
        return <HomeContent config={config} setActiveTabByContent={handleSetTabByContent} />;
    }
  };

  const isContentVisible = (content: ContentType) => {
    switch (content) {
        case 'services': return showServices;
        case 'gallery': return showGallery;
        case 'blog': return showBlog;
        case 'contact': return showContact;
        default: return true; // Home is always visible
    }
  };

  const visibleNavItems = navItems.filter(item => item.visible && isContentVisible(item.content));

  const getColoredIconUrl = (iconUrl: string, color: string) => {
    // Only attempt to color SVGs that are formatted as data URIs
    if (!iconUrl || !iconUrl.startsWith('data:image/svg+xml')) {
      return iconUrl; 
    }
    // URL-encode the color value (# becomes %23, etc.) to be valid in a URL.
    const encodedColor = encodeURIComponent(color);
    // Replace the hardcoded `fill='black'` with the dynamic, encoded color.
    return iconUrl.replace(/fill='black'/, `fill='${encodedColor}'`);
  };

  return (
    <div className="w-[375px] h-[750px] bg-gradient-to-br from-gray-500 to-gray-800 rounded-[40px] shadow-2xl p-2 border-2 border-gray-900 transform scale-[0.85]">
      <div 
        id="appContainer"
        className="w-full h-full rounded-[32px] overflow-hidden flex flex-col transition-colors duration-300"
        style={appStyle}
      >
        <style>
            {`
                .themed-bg { background-color: var(--primary-color); } 
                .themed-text { color: var(--primary-color); }
                .app-bg { background-color: var(--background-color); }
                .app-text { color: var(--text-color); }
                .themed-border { border-color: var(--primary-color); }
                .gel-button {
                    background: linear-gradient(to bottom, ${primaryColor}99, ${primaryColor});
                    border: 1px solid ${primaryColor};
                    box-shadow: inset 0 0 10px ${primaryColor}50, 0 0 5px ${primaryColor}80;
                }
                .accent-1-text { color: var(--accent-color-1); }
                .accent-1-bg { background-color: var(--accent-color-1); }
                .accent-1-border { border-color: var(--accent-color-1); }
                
                .accent-2-text { color: var(--accent-color-2); }
                .accent-2-bg { background-color: var(--accent-color-2); }
                .accent-2-border { border-color: var(--accent-color-2); }

                .accent-3-text { color: var(--accent-color-3); }
                .accent-3-bg { background-color: var(--accent-color-3); }
                .accent-3-border { border-color: var(--accent-color-3); }

                .icon-glow {
                    filter: drop-shadow(0 0 5px var(--primary-color));
                }
                
                .themed-text-hover:hover { color: var(--primary-color); }

                /* Support for dynamic grid columns */
                .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}
        </style>
        
        <header className="flex items-center p-4 border-b border-white/10 app-bg">
            {logoUrl && <img src={logoUrl} alt="logo" className="w-8 h-8 mr-3 object-contain" />}
            <h1 className="font-bold text-xl app-text uppercase tracking-widest">{appName}</h1>
        </header>

        <main className="flex-1 overflow-y-auto app-bg app-text">
            {renderActiveContent()}
        </main>
        
        <SocialLinks config={config} />

        <nav className="app-bg border-t border-black/5 shadow-[0_-2px_8px_rgba(0,0,0,0.07)]">
            <div className="flex justify-around items-center h-16">
                {visibleNavItems.map((item) => {
                    const originalIndex = navItems.findIndex(i => i === item);
                    const isUrl = item.icon.startsWith('http') || item.icon.startsWith('data:');
                    const isActive = activeTabIndex === originalIndex;
                    
                    const iconColor = isActive ? primaryColor : textColor;
                    const coloredIconSrc = getColoredIconUrl(item.icon, iconColor);

                    return (
                        <button
                            key={originalIndex}
                            onClick={() => setActiveTabIndex(originalIndex)}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all duration-200 transform hover:scale-105 focus:outline-none ${
                                isActive ? 'themed-text' : 'app-text opacity-60 hover:opacity-100'
                            }`}
                        >
                            <div className={`h-6 w-6 transition-all duration-200`}>
                                {isUrl ? (
                                    <img 
                                        src={coloredIconSrc}
                                        alt={`${item.label} icon`}
                                        className={`w-full h-full object-contain ${isActive ? 'icon-glow' : ''}`}
                                    />
                                ) : (
                                    <span className="text-2xl leading-none">{item.icon}</span>
                                )}
                            </div>
                            <span className="block text-[10px] font-medium mt-px uppercase tracking-wider">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
      </div>
    </div>
  );
};

export default AppPreview;