import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';

const SunSvg = ({ className }) => (
  <svg className={className} width="34" height="26" viewBox="0 0 34 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4313 24.4607L27.3821 24.3896C28.2997 24.3874 29.2434 24.3762 30.0977 24.1391C31.2585 23.817 32.1429 23.0515 32.3708 22.1844C32.5987 21.3173 32.1568 20.3762 31.2373 19.7761C30.5963 19.3529 29.7132 19.0979 28.8472 19.1603C27.9812 19.2226 27.1516 19.6392 26.8868 20.2255C27.1692 19.0417 27.2569 17.7828 26.5885 16.6744C25.9202 15.5661 24.3002 14.6711 22.6136 14.8145C21.5456 14.9074 20.5917 15.4104 20.053 16.0682C19.5143 16.7261 19.3781 17.5249 19.5415 18.2801C19.1526 17.229 17.1198 16.694 15.8592 17.3003C14.5986 17.9067 14.5804 19.4373 15.825 20.072C14.8493 19.159 12.9384 18.8548 11.4706 19.317C10.0029 19.7793 9.06337 20.9443 9.13925 22.0849C9.21512 23.2255 10.2208 24.4698 11.4313 24.4607Z" stroke="currentColor" strokeWidth="1.2427" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.77311 4.82364C9.95133 5.07894 10.9972 5.85829 11.5929 6.91982C12.1886 7.98134 12.321 9.28474 11.9503 10.4538C11.8444 10.7897 11.6988 11.1122 11.4738 11.3809C11.2355 11.6631 10.931 11.8781 10.6 12.0528C9.1835 12.7784 7.35659 12.5634 6.16513 11.5019C4.97367 10.4403 4.56327 8.57258 5.21196 7.12137C5.86064 5.67017 7.58165 4.58177 8.75987 4.83707L8.77311 4.82364Z" stroke="currentColor" strokeWidth="1.2427" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.95605 0.621582V2.59124" stroke="currentColor" strokeWidth="1.2427" strokeLinecap="round"/>
    <path d="M2.7168 8.94043H0.62088" stroke="currentColor" strokeWidth="1.2427" strokeLinecap="round"/>
    <path d="M8.95605 14.1396V16.312" stroke="currentColor" strokeWidth="1.2427" strokeLinecap="round"/>
    <path d="M14.0927 8.95792C14.1055 8.95792 14.1183 8.95792 14.4788 8.95792C14.8393 8.95792 15.5471 8.95792 16.2344 8.94043" stroke="currentColor" strokeWidth="1.2427" strokeLinecap="round"/>
    <path d="M13.1162 4.78174C13.1105 4.78174 13.1049 4.78174 13.0512 4.81951C12.9975 4.85727 12.896 4.93281 12.8127 4.99684C12.7295 5.06086 12.6676 5.11109 12.4975 5.2544" stroke="currentColor" strokeWidth="1.2427" strokeLinecap="round"/>
    <path d="M3.17629 4.78174C3.17927 4.78174 3.18225 4.78174 3.22324 4.82037C3.26423 4.85901 3.34313 4.93627 3.41299 5.0035C3.48284 5.07073 3.54124 5.12558 3.75684 5.24565" stroke="currentColor" strokeWidth="1.2427" strokeLinecap="round"/>
    <path d="M4.79688 13.0996C4.79408 13.1024 4.79129 13.1052 4.75594 13.139C4.72058 13.1727 4.65274 13.2374 4.49771 13.3909" stroke="currentColor" strokeWidth="1.2427" strokeLinecap="round"/>
    <path d="M12.7214 13.0996C12.7272 13.0996 12.733 13.0996 12.7588 13.1301C12.7846 13.1606 12.8303 13.2216 12.8814 13.2838C12.9325 13.3461 12.9877 13.4076 13.1162 13.5052" stroke="currentColor" strokeWidth="1.2427" strokeLinecap="round"/>
  </svg>
);

const MoonSvg = ({ className }) => (
  <svg className={className} width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.34965 4.85311C3.26661 4.74282 4.03362 4.07554 4.43731 3.28142C4.841 2.4873 4.94481 1.58841 4.96788 0.706055C4.87561 1.67664 4.88137 2.69686 5.32543 3.5737C5.76949 4.45054 6.75565 5.13988 7.76488 4.9965C6.54227 5.09576 5.52728 6.03878 5.04862 7.11966C4.56995 8.20054 4.51228 10.5884 4.51228 10.5884C4.51228 10.5884 4.7891 8.60311 4.61032 7.62701C4.43154 6.65091 3.88368 5.68583 2.96096 5.22811C2.27468 4.89172 1.4673 4.86414 0.706055 4.96341C1.42116 4.90826 2.14204 4.87517 2.34965 4.85311Z" stroke="currentColor" strokeWidth="1.41176" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.6154 3.53575C11.49 3.26465 4.64958 12.2791 9.24602 20.4784C11.4022 24.3247 20.0005 25.9102 23.1649 23.698C24.0083 23.1084 20.5061 23.3807 18.8985 22.654C13.8687 20.3804 12.6533 18.2312 13.0642 12.4048C13.3296 8.64218 17.4276 5.65796 19.6143 3.53561" stroke="currentColor" strokeWidth="1.41176" strokeLinecap="round"/>
  </svg>
);

// Border outline for each half of the toggle (viewBox 240x84). Outer corners
// rounded (r=8), the divider edge (x=120) stays square — matches the design's
// 8px 0 0 8px / 0 8px 8px 0 radii. preserveAspectRatio="none" lets the whole
// thing scale uniformly with the (fixed-aspect) container, so the stroke width
// and corner radius scale proportionally on every breakpoint.
const DAY_BORDER = 'M120 0.75 L8 0.75 A7.25 7.25 0 0 0 0.75 8 L0.75 76 A7.25 7.25 0 0 0 8 83.25 L120 83.25 Z';
const NIGHT_BORDER = 'M120 0.75 L232 0.75 A7.25 7.25 0 0 1 239.25 8 L239.25 76 A7.25 7.25 0 0 1 232 83.25 L120 83.25 Z';

const ViewsPage = () => {
  const [isDay, setIsDay] = useState(true);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  const containerRef = useRef(null);

  const activateScene = (sceneId) => {
    const iframeDocument = iframeRef.current?.contentDocument;
    const sceneElement = iframeDocument?.querySelector(`.scene[data-id="${sceneId}"]`);

    if (sceneElement) {
      sceneElement.click();
    }
  };

  const dayBorderRef = useRef(null);
  const nightBorderRef = useRef(null);

  useEffect(() => {
    // Only the selected tab's border animates (draws in); buttons/icons never resize.
    if (isDay) {
      gsap.fromTo(dayBorderRef.current, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.out' });
      gsap.to(nightBorderRef.current, { drawSVG: '0%', duration: 0.4 });
    } else {
      gsap.fromTo(nightBorderRef.current, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.out' });
      gsap.to(dayBorderRef.current, { drawSVG: '0%', duration: 0.4 });
    }
  }, [isDay]);

  useEffect(() => {
    if (!isViewerReady) {
      return;
    }

    activateScene(isDay ? '0-cci_park2day' : '1-cci_park2night');
  }, [isDay, isViewerReady]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        data-bg-image
        src="/RivaliCCI_P2ViewsMarzipano/index.html"
        title="360 panorama viewer"
        className="absolute inset-0 h-full w-full border-0"
        onLoad={() => {
          setIsViewerReady(true);
          activateScene(isDay ? '0-cci_park2day' : '1-cci_park2night');
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_28%)]" />

      {/* Header */}
      <div
        className="absolute left-0 top-0 z-10 flex h-22.5 w-full items-center px-10 pb-2.5 pt-5"
        style={{
          background:
            'linear-gradient(180deg, rgba(243, 198, 143, 0.0009) 0%, rgba(243, 198, 143, 0) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.7) -134.3%, rgba(0, 0, 0, 0) 79.65%)'
        }}
      >
        <button
          data-back-btn
          onClick={() => navigate(-1)}
          className="flex h-15 w-15 items-center justify-center rounded-full bg-on-light-black/20 transition-colors hover:bg-on-light-black/40 backdrop-blur-sm"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12H2M2 12L10.4 3.65M2 12L10.4 20.35" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Day / Night Toggle */}
      <div className="absolute bottom-13 left-13 z-10 flex h-19 w-54 lg:h-16 lg:w-49 overflow-hidden rounded-lg bg-pastel-brown-bg/90 shadow-2xl backdrop-blur-md">
        {/* Borders: static grey outline on both halves + animated brown on the selected one */}
        <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 240 84" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={DAY_BORDER} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          <path d={NIGHT_BORDER} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          <path ref={dayBorderRef} d={DAY_BORDER} stroke="#7a4833" strokeWidth="1.5" />
          <path ref={nightBorderRef} d={NIGHT_BORDER} stroke="#7a4833" strokeWidth="1.5" />
        </svg>

        {/* Day Button */}
        <button
          onClick={() => setIsDay(true)}
          className="group relative flex flex-1 flex-col items-center justify-center gap-2 py-3"
        >
          {isDay && <div className="pointer-events-none absolute inset-0 bg-brand-brown/16" />}
          <SunSvg className={`relative z-10 w-auto h-6 transition-colors duration-500 ${isDay ? 'text-on-light-black' : 'text-on-light-grey'}`} />
          <span
            data-card-label
            className={`relative z-10 text-xs uppercase leading-none transition-colors duration-500 ${isDay ? 'font-semibold tracking-[0.07em] text-on-light-black' : 'font-normal tracking-widest text-on-light-grey'}`}
          >
            Day
          </span>
        </button>

        {/* Night Button */}
        <button
          onClick={() => setIsDay(false)}
          className="group relative flex flex-1 flex-col items-center justify-center gap-2 py-3"
        >
          {!isDay && <div className="pointer-events-none absolute inset-0 bg-brand-brown/16" />}
          <MoonSvg className={`relative z-10 w-auto h-6 transition-colors duration-500 ${!isDay ? 'text-on-light-black' : 'text-on-light-grey'}`} />
          <span
            data-card-label
            className={`relative z-10 text-xs uppercase leading-none transition-colors duration-500 ${!isDay ? 'font-semibold tracking-[0.07em] text-on-light-black' : 'font-normal tracking-widest text-on-light-grey'}`}
          >
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
