import { forwardRef, useImperativeHandle, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, aboutReveal } from "../../lib/gsap";
import InlineSVG from "./InlineSVG";

const TimelineCard = ({
  pos,
  year,
  caption,
  image,
  badge,
  badgeClass = "h-[55%]",
  contain = false,
  imageClass = "",
}) => (
  <article
    data-journey-card
    data-card-pos={pos}
    data-fade-out="decor"
    className="invisible w-full max-w-[260px] lg:max-w-[200px] xl:max-w-[230px] 2xl:max-w-[270px] 3xl:max-w-[320px] 4xl:max-w-[440px] 5xl:max-w-[640px] mx-auto flex flex-col"
  >
    <div className="card-shine relative aspect-[260/180] overflow-hidden bg-on-light-highlight-brown shrink-0">
      <img
        src={image}
        alt=""
        loading="eager"
        decoding="async"
        className={`absolute inset-0 w-full h-full ${contain ? "object-contain p-3" : "object-cover"} ${imageClass}`}
      />
      {badge && (
        <img
          src={badge}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className={`absolute left-1/2 top-2/5 -translate-x-1/2 -translate-y-1/2 w-auto ${badgeClass}`}
        />
      )}
    </div>
    <div className="flex flex-col items-center text-center gap-1 mt-3.5 lg:mt-2.5 xl:mt-3 2xl:mt-3.5 3xl:mt-4 4xl:mt-5 5xl:mt-7">
      <p
        data-card-title
        className="font-medium text-[16px] lg:text-[11px] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px] 4xl:text-[21px] 5xl:text-[30px] text-on-light-black"
      >
        {year}
      </p>
      <p
        data-card-subtitle
        className="font-medium text-[14px] lg:text-[10px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[16px] 4xl:text-[22px] 5xl:text-[32px] text-on-light-grey leading-[1.6]"
      >
        {caption}
      </p>
    </div>
  </article>
);

const JourneyThroughTime = forwardRef((_props, ref) => {
  const sectionRef = useRef(null);
  const tlRef = useRef(null);
  const splitsRef = useRef([]);
  const isReadyRef = useRef(false);
  const queuedActionRef = useRef(null);

  useGSAP(
    (_context, contextSafe) => {
      const scope = sectionRef.current;
      if (!scope) return;

      const setup = contextSafe(() => {
        const headingEl = scope.querySelector("[data-journey-heading]");
        const cursiveEl = scope.querySelector("[data-journey-cursive]");
        const barEl = scope.querySelector("[data-journey-bar]");
        const allCards = scope.querySelectorAll("[data-journey-card]");

        const barPath = barEl ? barEl.querySelector("[data-bar]") : null;
        const allTicks = barEl ? barEl.querySelectorAll("[data-tick]") : [];
        const allDots = barEl ? barEl.querySelectorAll("[data-dot]") : [];

        const slots = [1, 2, 3, 4, 5].map((n) => ({
          n,
          card: scope.querySelector(`[data-card-pos="${n}"]`),
          tick: barEl ? barEl.querySelector(`[data-tick="${n}"]`) : null,
          dot: barEl ? barEl.querySelector(`[data-dot="${n}"]`) : null,
        }));

        // Bar path spans x=240→1180 with a midpoint at x=684.29.
        // Total path length ≈ 940. Dot x positions (247, 440, 714, 916, 1175)
        // map to these % along the path:
        const barPctAtDot = [0.75, 21.28, 50.43, 71.93, 99.47];

        gsap.set(headingEl, { autoAlpha: 0, y: 18 });
        gsap.set(cursiveEl, { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' });
        gsap.set(barEl, { autoAlpha: 1 });
        if (barPath) gsap.set(barPath, { drawSVG: '0% 0%' });
        if (allTicks.length) gsap.set(allTicks, { drawSVG: "100% 100%" });
        if (allDots.length)
          gsap.set(allDots, {
            autoAlpha: 0,
            scale: 0,
            transformOrigin: "50% 50%",
          });
        gsap.set(allCards, {
          autoAlpha: 1,
          clipPath: "inset(0 0 100% 0)",
          willChange: "clip-path",
        });

        const cardSplits = slots.map((slot) => {
          if (!slot.card) return { titleSplit: null, subtitleSplit: null };
          const titleEl = slot.card.querySelector("[data-card-title]");
          const subtitleEl = slot.card.querySelector("[data-card-subtitle]");
          const titleSplit = titleEl
            ? SplitText.create(titleEl, {
                type: "words",
                wordsClass: "card-title-word",
                mask: "words",
              })
            : null;
          const subtitleSplit = subtitleEl
            ? SplitText.create(subtitleEl, {
                type: "lines",
                linesClass: "card-subtitle-line",
                mask: "lines",
              })
            : null;
          return { titleSplit, subtitleSplit };
        });
        splitsRef.current = cardSplits;

        cardSplits.forEach(({ titleSplit, subtitleSplit }) => {
          if (titleSplit) {
            gsap.set(titleSplit.words, { yPercent: 100, autoAlpha: 0 });
          }
          if (subtitleSplit) {
            gsap.set(subtitleSplit.lines, { yPercent: 100, autoAlpha: 0 });
          }
        });

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
          onComplete: () => {
            gsap.set(allCards, { willChange: "auto" });
          },
        });

        tl.to(headingEl, { autoAlpha: 1, y: 0, duration: 0.5 }, 0);
        tl.to(
          cursiveEl,
          { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power1.inOut' },
          0.2,
        );

        const barStart = 0.5;
        const barDuration = 4.0;

        if (barPath) {
          tl.to(
            barPath,
            { drawSVG: "0% 100%", duration: barDuration, ease: "none" },
            barStart,
          );
        }

        slots.forEach((slot, i) => {
          const anchor = barStart + barDuration * (barPctAtDot[i] / 100);
          if (slot.dot) {
            tl.to(
              slot.dot,
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.25,
                ease: "back.out(2)",
              },
              anchor,
            );
          }
          if (slot.tick) {
            // fromTo (not to) pins the start at the bar end ("100% 100%") so
            // the tick grows outward from the bar. A plain .to() records its
            // start lazily, by which point useSlideTransition has forced the
            // tick to drawSVG:0 (the outer tip), making it grow inward instead.
            // immediateRender:false keeps the gsap.set above as the resting
            // pre-intro state.
            tl.fromTo(
              slot.tick,
              { drawSVG: "100% 100%" },
              {
                drawSVG: "0% 100%",
                duration: 0.30,
                ease: "power2.out",
                immediateRender: false,
              },
              anchor + 0.20,
            );
          }
          const cardDuration = 1.0;
          const cardBodyStart = anchor + 0.35;
          if (slot.card) {
            tl.to(
              slot.card,
              {
                clipPath: "inset(0 0 0% 0)",
                duration: cardDuration,
                ease: "power2.out",
              },
              cardBodyStart,
            );
          }
          // The card reveal uses power2.out, which front-loads its motion: the
          // image LOOKS fully revealed at ~70% through the tween, well before its
          // mathematical end (cardBodyStart + cardDuration). Anchoring the text to
          // that mathematical end left a visible dead pause at the tail. Instead,
          // fire the text a beat after the image is *visually* complete.
          const cardVisualEnd = cardBodyStart + cardDuration * 0.7;
          const split = cardSplits[i];
          if (split?.titleSplit) {
            tl.to(
              split.titleSplit.words,
              {
                yPercent: 0,
                autoAlpha: 1,
                stagger: 0.07,
                duration: 0.9,
                ease: "power4.out",
              },
              cardVisualEnd + 0.05,
            );
          }
          if (split?.subtitleSplit) {
            tl.to(
              split.subtitleSplit.lines,
              {
                yPercent: 0,
                autoAlpha: 1,
                stagger: 0.08,
                duration: 0.8,
                ease: "power3.out",
              },
              cardVisualEnd + 0.18,
            );
          }
        });

        tlRef.current = tl;
        isReadyRef.current = true;

        const queued = queuedActionRef.current;
        queuedActionRef.current = null;
        if (queued === "in") {
          gsap.set(scope, { autoAlpha: 1 });
          tl.timeScale(1).play(0);
        } else if (queued === "out") {
          tl.timeScale(2.5).reverse();
        }
      });

      const cardImages = scope.querySelectorAll("[data-journey-card] img");
      const decodes = Array.from(cardImages).map((img) => {
        if (img.complete && img.decode) return img.decode().catch(() => {});
        if (img.decode)
          return new Promise((res) => {
            img.addEventListener("load", () => img.decode().then(res, res), {
              once: true,
            });
            img.addEventListener("error", () => res(), { once: true });
          });
        return Promise.resolve();
      });

      Promise.all([aboutReveal(scope), ...decodes]).then(setup);

      return () => {
        splitsRef.current.forEach(({ titleSplit, subtitleSplit }) => {
          titleSplit?.revert?.();
          subtitleSplit?.revert?.();
        });
        splitsRef.current = [];
      };
    },
    { scope: sectionRef },
  );

  useImperativeHandle(ref, () => ({
    prepare: () => {
      if (!isReadyRef.current || !tlRef.current) return;
      const scope = sectionRef.current;
      gsap.set(scope, { autoAlpha: 1 });
      tlRef.current.timeScale(1).pause(0);
      // pause(0) only rewinds tweens whose start time is 0. Cards (clipPath)
      // and dots animate later, so they don't auto-rewind. Re-snap to the
      // pre-intro state so they don't leak in on re-entry.
      if (!scope) return;
      const cards = scope.querySelectorAll('[data-journey-card]');
      if (cards.length) {
        gsap.set(cards, {
          autoAlpha: 1,
          clipPath: "inset(0 0 100% 0)",
          willChange: "clip-path",
        });
      }
      const dots = scope.querySelectorAll('[data-dot]');
      if (dots.length) gsap.set(dots, { autoAlpha: 0, scale: 0 });
    },
    playIn: () => {
      if (!isReadyRef.current || !tlRef.current) {
        queuedActionRef.current = "in";
        return;
      }
      gsap.set(sectionRef.current, { autoAlpha: 1 });
      tlRef.current.timeScale(1).play(0);
    },
    // stop freezes the intro timeline so its tweens stop fighting the exit
    // choreography, and animates the dots out. Dots have data-no-undraw
    // (filled rects can't drawSVG) and no data-fade-out, so without this they
    // linger past the 0.5s bar-undraw and bleed through the wrapper crossfade.
    stop: () => {
      if (tlRef.current) tlRef.current.pause();
      const scope = sectionRef.current;
      if (!scope) return;
      const dots = scope.querySelectorAll('[data-dot]');
      if (dots.length) {
        gsap.to(dots, {
          autoAlpha: 0,
          scale: 0,
          duration: 0.5,
          stagger: 0.005,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      }
      // Ticks carry data-no-undraw so the shared exit (which collapses paths
      // to drawSVG:0 — the outer tip) skips them. Retract them to "100% 100%"
      // instead so they undraw back into the bar, mirroring the draw direction.
      const ticks = scope.querySelectorAll('[data-tick]');
      if (ticks.length) {
        gsap.to(ticks, {
          drawSVG: '100% 100%',
          duration: 0.5,
          stagger: 0.005,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      }
    },
  }));

  return (
    <section
      ref={sectionRef}
      className="bg-pastel-brown-bg w-full h-full px-6 lg:px-[9%] xl:px-[9%] 2xl:px-[9%] 3xl:px-[9%] 4xl:px-[9%] 5xl:px-[9%]"
    >
      <div className="text-center">
        <h2
          data-journey-heading
          data-fade-out="text"
          className="invisible font-normal text-[40px] lg:text-[36px] xl:text-[46px] 2xl:text-[56px] 3xl:text-[71px] 4xl:text-[92px] 5xl:text-[140px] leading-[1.2] -tracking-[1px] text-on-light-black"
        >
          A journey through time
        </h2>
        <InlineSVG
          src="/about/shaping-a-legacy.svg"
          aria-label="shaping a legacy of innovation"
          data-journey-cursive
          data-fade-out="decor"
          data-clip-reverse
          className="invisible mx-auto mt-3 h-6.5 lg:h-[1.83rem] xl:h-[2.4rem] 2xl:h-[2.9rem] 3xl:h-[3.7rem] 4xl:h-[4.8rem] 5xl:h-[7.4rem] w-auto"
        />
      </div>

      <div className="relative max-w-[1080px] lg:max-w-none xl:max-w-none 2xl:max-w-none 3xl:max-w-none 4xl:max-w-none 5xl:max-w-none mx-auto mt-8 lg:mt-10 xl:mt-12 2xl:mt-14 3xl:mt-16 4xl:mt-20 5xl:mt-28">
        <div
          data-journey-top
          className="grid grid-cols-12 gap-4 lg:gap-12 xl:gap-14 2xl:gap-16 3xl:gap-20 4xl:gap-26 5xl:gap-36"
        >
          <div className="col-span-4 flex justify-center">
            <TimelineCard
              pos={1}
              year="2001"
              caption="CCI Projects is formed"
              image="/about/timeline-image-36.webp"
              imageClass="object-[center_0%] origin-top scale-140"
              badge="/about/cci-logo.webp"
              badgeClass="h-[35%] max-w-100"
            />
          </div>
          <div className="col-span-4 flex justify-center">
            <TimelineCard
              pos={3}
              year="2016"
              caption="Completion of Whitespring"
              image="/about/whitespring.webp"
              imageClass="object-right origin-top-right translate-y-[0%]"
            />
          </div>
          <div className="col-span-4 flex justify-center">
            <TimelineCard
              pos={5}
              year="2023"
              caption="Launch of Rivali Park 2"
              image="/about/central-courtyard.webp"
            />
          </div>
        </div>

        <div
          data-journey-bar
          data-undraw
          data-inline-svg=""
          data-inline-svg-loaded="true"
          aria-hidden="true"
          className="invisible block w-full lg:w-[105%] lg:-mx-[2.5%] lg:max-w-none xl:w-[110%] xl:-mx-[5%] 2xl:w-[112%] 2xl:-mx-[6%] 3xl:w-[114%] 3xl:-mx-[7%] 4xl:w-[116%] 4xl:-mx-[8%] 5xl:w-[118%] 5xl:-mx-[9%] h-auto my-10 lg:my-3 xl:my-5 2xl:my-6 3xl:my-8 4xl:my-10 5xl:my-14"
        >
          <svg
            width="1440"
            height="52"
            viewBox="0 0 1440 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              data-tick="1"
              data-no-undraw
              d="M247.545 6.31005L248.162 10.2407C248.605 13.0658 248.514 15.9491 247.892 18.7403C247.394 20.9768 247.235 23.2756 247.422 25.5594L247.731 29.3448"
              stroke="#7A4833"
              strokeWidth="4"
            />
            <rect data-dot="1" data-no-undraw x="240" y="24.3563" width="13" height="13" rx="6.5" fill="#7A4833" />
            <path
              data-tick="2"
              data-no-undraw
              d="M439.545 50.3128L440.162 46.3821C440.605 43.557 440.514 40.6737 439.892 37.8825C439.394 35.646 439.235 33.3472 439.422 31.0634L439.731 27.278"
              stroke="#7A4833"
              strokeWidth="4"
            />
            <rect data-dot="2" data-no-undraw x="432" y="19.2665" width="13" height="13" rx="6.5" fill="#7A4833" />
            <path
              data-tick="3"
              data-no-undraw
              d="M714.545 0.310052L715.162 4.24072C715.605 7.06581 715.514 9.94908 714.892 12.7403C714.394 14.9768 714.235 17.2756 714.422 19.5594L714.731 23.3448"
              stroke="#7A4833"
              strokeWidth="4"
            />
            <rect data-dot="3" data-no-undraw x="707" y="18.3563" width="13" height="13" rx="6.5" fill="#7A4833" />
            <path
              data-tick="4"
              data-no-undraw
              d="M916.545 51.3128L917.162 47.3821C917.605 44.557 917.514 41.6737 916.892 38.8825C916.394 36.646 916.235 34.3472 916.422 32.0634L916.731 28.278"
              stroke="#7A4833"
              strokeWidth="4"
            />
            <rect data-dot="4" data-no-undraw x="909" y="20.2665" width="13" height="13" rx="6.5" fill="#7A4833" />
            <path
              data-tick="5"
              data-no-undraw
              d="M1175.55 4.31005L1176.16 8.24072C1176.61 11.0658 1176.51 13.9491 1175.89 16.7403C1175.39 18.9768 1175.24 21.2756 1175.42 23.5594L1175.73 27.3448"
              stroke="#7A4833"
              strokeWidth="4"
            />
            <rect data-dot="5" data-no-undraw x="1168" y="22.3563" width="13" height="13" rx="6.5" fill="#7A4833" />
            <path
              data-bar=""
              d="M240 29.853 L684.286 23.2665 L1180 30.215"
              stroke="#7A4833"
              strokeWidth="5"
              fill="none"
            />
          </svg>
        </div>

        <div
          data-journey-bottom
          className="grid grid-cols-12 gap-4 lg:gap-12 xl:gap-14 2xl:gap-16 3xl:gap-20 4xl:gap-26 5xl:gap-36"
        >
          <div className="col-span-4 col-start-3 flex justify-center">
            <TimelineCard
              pos={2}
              year="2001 - 2010"
              caption={
                <>
                  Factories moved to Nashik
                  <br />
                  Master planning of Rivali Park begins
                </>
              }
              image="/about/timeline-image-36.webp"
              imageClass="object-left origin-top-left scale-280 -translate-y-[68%]"
              badge="/about/rivali-park-white.webp"
              badgeClass="h-[40%] max-w-100"
            />
          </div>
          <div className="col-span-4 col-start-7 flex justify-center">
            <TimelineCard
              pos={4}
              year="2021"
              caption="Completion of Wintergreen"
              image="/about/rivali-transformation.webp"
              imageClass="object-center origin-top scale-110 translate-y-[0%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

JourneyThroughTime.displayName = "JourneyThroughTime";

export default JourneyThroughTime;
