import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, aboutReveal } from "../../lib/gsap";
import RaggedyDivider from "./RaggedyDivider";
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
    className="invisible w-full max-w-[260px] lg:max-w-[200px] xl:max-w-[230px] 2xl:max-w-[270px] 3xl:max-w-[320px] 4xl:max-w-[440px] 5xl:max-w-[640px] mx-auto bg-white border border-on-light-stroke flex flex-col min-h-[290px] lg:min-h-[215px] xl:min-h-[250px] 2xl:min-h-[290px] 3xl:min-h-[345px] 4xl:min-h-[470px] 5xl:min-h-[690px]"
  >
    <div className="relative aspect-[260/180] overflow-hidden bg-on-light-highlight-brown shrink-0">
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
    <div className="flex-1 px-4 py-4 lg:px-3 lg:py-3 xl:px-3 xl:py-3 2xl:px-4 2xl:py-4 3xl:px-5 3xl:py-5 4xl:px-6 4xl:py-6 5xl:px-9 5xl:py-9">
      <p className="font-medium text-[14px] lg:text-[11px] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px] 4xl:text-[21px] 5xl:text-[30px] text-on-light-black mb-1 lg:mb-0">
        {year}
      </p>
      <p className="text-[12.5px] lg:text-[10px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[14px] 4xl:text-[19px] 5xl:text-[28px] text-on-light-grey leading-[1.55]">
        {caption}
      </p>
    </div>
  </article>
);

const JourneyThroughTime = () => {
  const sectionRef = useRef(null);

  useGSAP(
    (_context, contextSafe) => {
      const scope = sectionRef.current;
      if (!scope) return;

      const setup = contextSafe(() => {
        const headingEl = scope.querySelector("[data-journey-heading]");
        const cursiveEl = scope.querySelector("[data-journey-cursive]");
        const barEl = scope.querySelector("[data-journey-bar]");
        const allCards = scope.querySelectorAll("[data-journey-card]");

        const barRect = barEl ? barEl.querySelector("[data-bar]") : null;
        const allTicks = barEl ? barEl.querySelectorAll("[data-tick]") : [];
        const allDots = barEl ? barEl.querySelectorAll("[data-dot]") : [];

        const slots = [1, 2, 3, 4, 5].map((n) => ({
          n,
          card: scope.querySelector(`[data-card-pos="${n}"]`),
          tick: barEl ? barEl.querySelector(`[data-tick="${n}"]`) : null,
          dot: barEl ? barEl.querySelector(`[data-dot="${n}"]`) : null,
        }));

        const barWidthAtDot = [0, 199, 474, 676, 935];

        const headingSplit = headingEl
          ? SplitText.create(headingEl, {
              type: "words",
              wordsClass: "inline-block will-change-transform",
            })
          : null;

        gsap.set(headingEl, { autoAlpha: 1 });
        if (headingSplit) {
          gsap.set(headingSplit.words, { yPercent: 110, autoAlpha: 0 });
        }
        gsap.set(cursiveEl, { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' });
        gsap.set(barEl, { autoAlpha: 1 });
        if (barRect) gsap.set(barRect, { attr: { width: 0 } });
        if (allTicks.length) gsap.set(allTicks, { drawSVG: "100% 100%" });
        if (allDots.length)
          gsap.set(allDots, {
            autoAlpha: 0,
            scale: 0,
            transformOrigin: "50% 50%",
          });
        gsap.set(allCards, {
          y: 24,
          autoAlpha: 0,
          willChange: "transform, opacity",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scope,
            start: "top 25%",
            once: true,
          },
          defaults: { ease: "power3.out" },
          onComplete: () => {
            gsap.set(allCards, { willChange: "auto" });
          },
        });

        // Phase 1 — heading + cursive (0 → ~0.43s)
        if (headingSplit) {
          tl.to(
            headingSplit.words,
            { yPercent: 0, autoAlpha: 1, stagger: 0.025, duration: 0.35 },
            0,
          );
        }
        tl.to(
          cursiveEl,
          { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power1.inOut' },
          0.2,
        );

        // Phase 2 — cards left-to-right with synced bar growth (0.45 → 1.5s)
        const cardStart = 0.45;
        const slotDur = 0.18;

        slots.forEach((slot, i) => {
          const t = cardStart + i * slotDur;
          if (slot.card) {
            tl.to(slot.card, { y: 0, autoAlpha: 1, duration: 0.32 }, t);
          }
          if (slot.tick) {
            tl.to(
              slot.tick,
              { drawSVG: "0% 100%", duration: 0.28, ease: "power2.out" },
              t,
            );
          }
          if (slot.dot) {
            tl.to(
              slot.dot,
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.28,
                ease: "back.out(2)",
              },
              t,
            );
          }
        });

        // Bar grows segment-by-segment between consecutive dots
        if (barRect) {
          for (let i = 1; i < barWidthAtDot.length; i++) {
            tl.to(
              barRect,
              {
                attr: { width: barWidthAtDot[i] },
                duration: slotDur,
                ease: "none",
              },
              cardStart + (i - 1) * slotDur,
            );
          }
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
    },
    { scope: sectionRef },
  );

  return (
    <>
      <RaggedyDivider />
      <section
        ref={sectionRef}
        className="bg-pastel-brown-bg pt-2 px-6 lg:px-[9%] xl:px-[9%] 2xl:px-[9%] 3xl:px-[9%] 4xl:px-[9%] 5xl:px-[9%]"
      >
        <div className="text-center lg:-mt-[120px] lg:min-h-[150px] lg:flex lg:flex-col lg:items-center lg:justify-center xl:-mt-[160px] xl:min-h-[300px] 2xl:-mt-[200px] 2xl:min-h-[360px] 3xl:-mt-[240px] 3xl:min-h-[440px] 4xl:-mt-[320px] 4xl:min-h-[560px] 5xl:-mt-[460px] 5xl:min-h-[800px]">
          <h2
            data-journey-heading
            className="invisible font-normal text-[40px] lg:text-[36px] xl:text-[44px] 2xl:text-[52px] 3xl:text-[60px] 4xl:text-[78px] 5xl:text-[116px] leading-[1.2] -tracking-[1px] text-on-light-black"
          >
            A journey through time
          </h2>
          <InlineSVG
            src="/about/shaping-a-legacy.svg"
            aria-label="shaping a legacy of innovation"
            data-journey-cursive
            className="invisible mx-auto mt-3 h-6.5 lg:h-7 xl:h-8 2xl:h-9 3xl:h-10 4xl:h-14 5xl:h-20 w-auto"
          />
        </div>

        <div className="relative max-w-[1080px] lg:max-w-none xl:max-w-none 2xl:max-w-none 3xl:max-w-none 4xl:max-w-none 5xl:max-w-none mx-auto">
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
                caption="Completion of  Whitespring"
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

          <InlineSVG
            src="/about/journey-bar.svg"
            aria-hidden="true"
            data-journey-bar
            className="invisible block w-full lg:w-[105%] lg:-mx-[2.5%] lg:max-w-none xl:w-[110%] xl:-mx-[5%] 2xl:w-[112%] 2xl:-mx-[6%] 3xl:w-[114%] 3xl:-mx-[7%] 4xl:w-[116%] 4xl:-mx-[8%] 5xl:w-[118%] 5xl:-mx-[9%] h-auto my-10 lg:my-3 xl:my-5 2xl:my-6 3xl:my-8 4xl:my-10 5xl:my-14"
          />

          <div
            data-journey-bottom
            className="grid grid-cols-12 gap-4 lg:gap-12 xl:gap-14 2xl:gap-16 3xl:gap-20 4xl:gap-26 5xl:gap-36"
          >
            <div className="col-span-4 col-start-3 flex justify-center">
              <TimelineCard
                pos={2}
                year="2001 - 2010"
                caption="Factory operations moved from Borivali to Nashik. Master planning of Rivali Park begins"
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
      <RaggedyDivider flipped />
    </>
  );
};

export default JourneyThroughTime;
