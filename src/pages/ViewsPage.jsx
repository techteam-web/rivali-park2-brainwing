import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import sunIcon from '../assets/svgs-viewspage/sun-cloud.svg';
import moonIcon from '../assets/svgs-viewspage/moon-star.svg';

const ViewsPage = () => {
  const [isDay, setIsDay] = useState(true);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const [isAutorotateEnabled, setIsAutorotateEnabled] = useState(true);
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  const activateScene = (sceneId) => {
    const iframeDocument = iframeRef.current?.contentDocument;
    const sceneElement = iframeDocument?.querySelector(`.scene[data-id="${sceneId}"]`);

    if (sceneElement) {
      sceneElement.click();
    }
  };

  const toggleAutorotate = () => {
    const iframeDocument = iframeRef.current?.contentDocument;
    const autorotateToggle = iframeDocument?.querySelector('#autorotateToggle');

    if (autorotateToggle) {
      autorotateToggle.click();
      setIsAutorotateEnabled((currentValue) => !currentValue);
    }
  };

  useEffect(() => {
    if (!isViewerReady) {
      return;
    }

    activateScene(isDay ? '0-cci_park2day' : '1-cci_park2night');
  }, [isDay, isViewerReady]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src="/RivaliCCI_P2ViewsMarzipano/index.html"
        title="360 panorama viewer"
        className="absolute inset-0 h-full w-full border-0"
        onLoad={() => {
          setIsViewerReady(true);
          activateScene(isDay ? '0-cci_park2day' : '1-cci_park2night');
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0)_16%),linear-gradient(0deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_28%)]" />

      <button
        type="button"
        onClick={toggleAutorotate}
        aria-pressed={isAutorotateEnabled}
        aria-label={isAutorotateEnabled ? 'Pause autorotate' : 'Start autorotate'}
        className={`absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition-all duration-300 ease-out hover:scale-105 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/30 ${isAutorotateEnabled ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_8px_24px_rgba(0,0,0,0.25)]'}`}
      >
        <span
          className={`absolute inset-0 rounded-full bg-white/10 transition-opacity duration-300 ${isAutorotateEnabled ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
        />
        <svg
          className={`relative h-5 w-5 transition-transform duration-500 ease-out ${isAutorotateEnabled ? 'rotate-0' : '-rotate-45'}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3a9 9 0 1 1-6.36 15.36"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M5.5 17.5 5.5 14.5 8.5 14.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Header */}
      <div
        className="absolute left-0 top-0 z-10 flex h-22.5 w-full items-center px-10 pb-2.5 pt-5"
        style={{
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)'
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex h-15 w-15 items-center justify-center rounded-full border border-white/20 bg-on-light-black/20 transition-colors hover:bg-on-light-black/40 backdrop-blur-sm"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Day / Night Toggle */}
      <div className="absolute bottom-13 left-13 z-10 flex h-19 w-54 lg:h-16 lg:w-49 overflow-hidden rounded-lg bg-pastel-brown-bg/90 shadow-lg backdrop-blur-sm">
        {/* Day Button */}
        <button
          onClick={() => setIsDay(true)}
          className={`relative flex flex-1 flex-col items-center justify-center py-3 transition-colors ${isDay ? 'rounded-l-lg border-2 border-brand-brown bg-brand-brown/10' : 'border border-on-light-stroke'}`}
        >
          {isDay && <div className="pointer-events-none absolute inset-0 bg-brand-brown/10" />}
          <img src={sunIcon} alt="Day" className={`w-8 h-6 mb-2 ${isDay ? '' : 'opacity-50 grayscale'}`} />
          <span className={`uppercase font-semibold tracking-widest text-sm ${isDay ? 'text-on-light-black' : 'text-on-light-grey'}`}>
            Day
          </span>
        </button>

        {/* Night Button */}
        <button
          onClick={() => setIsDay(false)}
          className={`relative flex flex-1 flex-col items-center justify-center py-3 transition-colors ${!isDay ? 'rounded-r-lg border-2 border-brand-brown bg-brand-brown/10' : 'border border-on-light-stroke'}`}
        >
          {!isDay && <div className="pointer-events-none absolute inset-0 bg-brand-brown/10" />}
          <img src={moonIcon} alt="Night" className={`w-8 h-6 mb-2 ${!isDay ? '' : 'opacity-50 grayscale'}`} />
          <span className={`uppercase font-semibold tracking-widest text-sm ${!isDay ? 'text-on-light-black' : 'text-on-light-grey'}`}>
            Night
          </span>
        </button>
      </div>

      {!isViewerReady && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/80">
          Loading 360 view...
        </div>
      )}
    </div>
  );
};

export default ViewsPage;