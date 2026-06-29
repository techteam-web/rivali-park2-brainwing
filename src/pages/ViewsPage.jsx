import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { usePageTransition } from '../hooks/usePageTransition';
import useLoaderReady from '../hooks/useLoaderReady';
import SketchLoadingScreen from '../components/loaders/SketchLoadingScreen';
import LoaderVector from '../assets/svgs-viewspage/views-loader-vector.svg?react';
import LoaderSubheading from '../assets/svgs-viewspage/views-loader-subheading.svg?react';

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

  // Hand-sketch loading overlay: stays until the 360 viewer iframe has loaded
  // (and a minimum display window so the draw-in animation is seen).
  const ready = useLoaderReady(isViewerReady);
  const [overlayGone, setOverlayGone] = useState(false);

  const containerRef = useRef(null);
  // Entrance is handled by the sketch loader above; we only need the animated
  // exit so going back home matches the rest of the app's scale+blur+fade.
  const { exitWith } = usePageTransition({ containerRef, skipEntrance: true });

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
        className="absolute left-0 top-0 z-10 flex w-full items-center h-12 xl:h-15 2xl:h-18 3xl:h-22.5 4xl:h-30 5xl:h-45 px-5.25 xl:px-6.75 2xl:px-8 3xl:px-10 4xl:px-13.25 5xl:px-20 pt-2.5 xl:pt-3.25 2xl:pt-4 3xl:pt-5 4xl:pt-6.75 5xl:pt-10 pb-1.25 xl:pb-1.75 2xl:pb-2 3xl:pb-2.5 4xl:pb-3.25 5xl:pb-5"
        style={{
          background:
            'linear-gradient(180deg, rgba(243, 198, 143, 0.0009) 0%, rgba(243, 198, 143, 0) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.7) -134.3%, rgba(0, 0, 0, 0) 79.65%)'
        }}
      >
        <button
          data-back-btn
          onClick={() => exitWith(() => navigate(-1))}
          className="flex items-center justify-center rounded-full bg-on-light-black/20 transition-colors hover:bg-on-light-black/40 backdrop-blur-sm h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
            <path d="M22 12H2M2 12L10.4 3.65M2 12L10.4 20.35" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Day / Night Toggle */}
      <div className="absolute z-10 flex overflow-hidden bg-pastel-brown-bg/90 shadow-2xl backdrop-blur-md bottom-7 left-7 xl:bottom-8.75 xl:left-8.75 2xl:bottom-10.5 2xl:left-10.5 3xl:bottom-13 3xl:left-13 4xl:bottom-17.25 4xl:left-17.25 5xl:bottom-26 5xl:left-26 h-8.5 w-26 xl:h-10.75 xl:w-32.75 2xl:h-12.75 2xl:w-39.25 3xl:h-16 3xl:w-49 4xl:h-21.25 4xl:w-65.25 5xl:h-32 5xl:w-98 rounded-sm xl:rounded-[5px] 2xl:rounded-md 3xl:rounded-lg 4xl:rounded-[11px] 5xl:rounded-2xl">
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
          className="group relative flex flex-1 flex-col items-center justify-center gap-1 xl:gap-1.5 2xl:gap-1.5 3xl:gap-2 4xl:gap-2.5 5xl:gap-4 py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 4xl:py-4 5xl:py-6"
        >
          {isDay && <div className="pointer-events-none absolute inset-0 bg-brand-brown/16" />}
          <SunSvg className={`relative z-10 w-auto h-3.5 xl:h-4 2xl:h-5 3xl:h-6 4xl:h-8 5xl:h-12 transition-colors duration-500 ${isDay ? 'text-on-light-black' : 'text-on-light-grey'}`} />
          <span
            data-card-label
            className={`relative z-10 text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs 4xl:text-[16px] 5xl:text-[24px] uppercase leading-none transition-colors duration-500 ${isDay ? 'font-semibold tracking-[0.07em] text-on-light-black' : 'font-normal tracking-widest text-on-light-grey'}`}
          >
            Day
          </span>
        </button>

        {/* Night Button */}
        <button
          onClick={() => setIsDay(false)}
          className="group relative flex flex-1 flex-col items-center justify-center gap-1 xl:gap-1.5 2xl:gap-1.5 3xl:gap-2 4xl:gap-2.5 5xl:gap-4 py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 4xl:py-4 5xl:py-6"
        >
          {!isDay && <div className="pointer-events-none absolute inset-0 bg-brand-brown/16" />}
          <MoonSvg className={`relative z-10 w-auto h-3.5 xl:h-4 2xl:h-5 3xl:h-6 4xl:h-8 5xl:h-12 transition-colors duration-500 ${!isDay ? 'text-on-light-black' : 'text-on-light-grey'}`} />
          <span
            data-card-label
            className={`relative z-10 text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs 4xl:text-[16px] 5xl:text-[24px] uppercase leading-none transition-colors duration-500 ${!isDay ? 'font-semibold tracking-[0.07em] text-on-light-black' : 'font-normal tracking-widest text-on-light-grey'}`}
          >
            Night
          </span>
        </button>
      </div>

      {!overlayGone && (
        <SketchLoadingScreen
          ready={ready}
          onExitComplete={() => setOverlayGone(true)}
          Vector={LoaderVector}
          vectorClassName="w-52 md:w-60 lg:w-60 2xl:w-72 3xl:w-80 h-auto"
          heading="The view"
          Subheading={LoaderSubheading}
          subheadingClassName="w-64 md:w-72 lg:w-72 2xl:w-80 h-auto"
        />
      )}
    </div>
  );
};

export default ViewsPage;
