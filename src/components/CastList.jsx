import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TransitionLink } from "./Pagetransition";
import { useGSAP } from "@gsap/react";

const HOVER_INTENT_MS = 200;
const SWAP_DURATION = 0.38;
const SWAP_EASE = "power2.inOut";

const CATEGORIES = [
  {
    label: "Home",
    to: "/",
    end: true,
    images: [
      ["navImage1", "Silhouette of a sprinter against a red-orange backdrop"],
      ["navImage6", "Athlete glancing over her shoulder in a studio portrait"],
      ["navImage11", "Running shoe floating on a light grey backdrop"],
      ["navImage16", "Profile silhouette of an athlete against orange"],
    ],
  },
  {
    label: "About",
    to: "/about",
    images: [
      ["navImage2", "Backlit profile of a cyclist wearing sport sunglasses"],
      ["navImage7", "Navy cycling jacket hanging against a grey backdrop"],
      ["navImage12", "Sport sunglasses floating on a warm peach backdrop"],
      ["navImage17", "Athlete in a white jacket, profile against orange"],
    ],
  },
  {
    label: "Skills",
    to: "/skills",
    images: [
      ["navImage3", "Tennis player silhouette raising a racket against blue"],
      ["navImage8", "Tennis ball resting on the top of a net"],
      ["navImage13", "Tennis ball balanced on a racket frame"],
      ["navImage18", "Basketball player silhouette mid-dunk against amber"],
    ],
  },
  {
    label: "Works",
    to: "/works",
    images: [
      ["navImage4", "Silhouette of a woman in a visor against green"],
      ["navImage9", "Colourful ball resting in rings of mown grass"],
      ["navImage14", "Football boot against a teal gradient"],
      ["navImage19", "Grass pitch with a white boundary line"],
    ],
  },
  {
    label: "Contact",
    to: "/contact",
    images: [
      ["navImage5", "Profile silhouette of an athlete against lavender"],
      ["navImage10", "Woman in profile against a blue backdrop"],
      ["navImage15", "Ski boot on a pale backdrop"],
      ["navImage20", "Groomed snow with a blue ski track"],
    ],
  },
];

const SLOTS = [
  {
    // large, top-left
    box: "left-[6%] top-[4%] w-[min(46vw,21svh)] aspect-[4/5] md:landscape:left-[10.3%] md:landscape:top-[8.96%] md:landscape:w-[23%]",
    delay: 0.03,
  },
  {
    // small portrait, top-right
    box: "right-[6%] top-[9%] w-[min(34vw,16svh)] aspect-[3/4] md:landscape:right-auto md:landscape:left-[74.8%] md:landscape:top-[12.06%] md:landscape:w-[14.9%]",
    delay: 0.04,
  },
  {
    // small, bottom-left
    box: "left-[6%] bottom-[5%] w-[min(34vw,17svh)] aspect-[4/5] md:landscape:bottom-auto md:landscape:left-[2.3%] md:landscape:top-[62.3%] md:landscape:w-[14.9%]",
    delay: 0,
  },
  {
    // large, bottom-right
    box: "right-[6%] bottom-[4%] w-[min(46vw,21svh)] aspect-[4/5] md:landscape:bottom-auto md:landscape:right-auto md:landscape:left-[74.8%] md:landscape:top-[48.3%] md:landscape:w-[22.9%]",
    delay: 0,
  },
];

export default function CastList(props) {
  const { basePath = "/images", navbarAccess } = props;
  const [active, setActive] = useState(0);

  const activeRef = useRef(0);
  const intentTimer = useRef(null);
  const zCounter = useRef(1);
  const layerRefs = useRef(SLOTS.map(() => []));

  const clearIntent = useCallback(() => {
    if (intentTimer.current) {
      clearTimeout(intentTimer.current);
      intentTimer.current = null;
    }
  }, []);

  const swapTo = useCallback((next) => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    zCounter.current += 1;

    SLOTS.forEach((slot, s) => {
      const layers = layerRefs.current[s];
      const incoming = layers[next];
      if (!incoming) return;

      const outgoing = layers.filter(
        (el, i) => el && i !== next && gsap.getProperty(el, "opacity") > 0.01
      );
      const delay = reduceMotion ? 0 : slot.delay;
      const duration = reduceMotion ? 0.2 : SWAP_DURATION;

      gsap.killTweensOf(layers);
      gsap.set(incoming, { zIndex: zCounter.current });

      if (gsap.getProperty(incoming, "opacity") < 0.05) {
        gsap.set(
          incoming,
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, yPercent: 5, scale: 1.04, filter: "blur(6px)" }
        );
      }

      gsap.to(incoming, {
        opacity: 1,
        yPercent: 0,
        scale: 1,
        filter: "blur(0px)",
        duration,
        delay,
        ease: SWAP_EASE,
        overwrite: "auto",
        onComplete: () => gsap.set(incoming, { clearProps: "filter" }),
      });

      if (outgoing.length) {
        gsap.to(outgoing, {
          opacity: 0,
          duration,
          delay,
          ease: "power1.inOut",
          overwrite: "auto",
        });
      }
    });
  }, []);

  const activate = useCallback(
    (index) => {
      clearIntent();
      if (index === activeRef.current) return;
      activeRef.current = index;
      setActive(index);
      swapTo(index);
    },
    [clearIntent, swapTo]
  );

  const handlePointerEnter = (event, index) => {
    clearIntent();
    if (event.pointerType && event.pointerType !== "mouse") {
      activate(index);
      return;
    }
    intentTimer.current = setTimeout(() => activate(index), HOVER_INTENT_MS);
  };

  useEffect(() => {
    const layers = layerRefs.current;
    return () => {
      clearIntent();
      layers.forEach((slot) => slot.forEach((el) => el && gsap.killTweensOf(el)));
    };
  }, [clearIntent]);

  const { contextSafe } = useGSAP();

  const handleDivState = contextSafe(() => {
    if (!navbarAccess?.current) return;
    gsap.to(navbarAccess.current, {
      xPercent: 0,
      autoAlpha: 0,
      duration: 0.8,
      delay: 0.7,
      ease: "power4.inOut",
      onComplete: () => {
        document.body.style.overflow = "";
        document.body.style.overscrollBehavior = "";
      },
    });
  });

  return (
    <section
      aria-label="Cast list"
      className="fixed inset-0 h-dvh w-screen select-none overflow-hidden overscroll-none touch-none bg-[#0c0c0c]"
    >
      {/* Contained Stage */}
      <div className="absolute inset-0 h-full w-full overflow-hidden md:landscape:left-1/2 md:landscape:top-1/2 md:landscape:h-auto md:landscape:w-[min(100vw,calc(100svh*1.592))] md:landscape:aspect-1280/804 md:landscape:-translate-x-1/2 md:landscape:-translate-y-1/2">
        {/* Images */}
        {SLOTS.map((slot, s) => (
          <div key={s} className={`absolute pointer-events-none ${slot.box}`} aria-hidden="true">
            {CATEGORIES.map((category, c) => {
              const [file, alt] = category.images[s];
              return (
                <img
                  key={file}
                  ref={(el) => {
                    layerRefs.current[s][c] = el;
                  }}
                  src={`${basePath}/${file}.jpg`}
                  alt={alt}
                  draggable={false}
                  decoding="async"
                  style={{ zIndex: c === 0 ? 1 : 0 }}
                  className={`absolute inset-0 h-full w-full rounded-xs object-cover pointer-events-none ${
                    c === 0 ? "opacity-100" : "opacity-0"
                  }`}
                />
              );
            })}
          </div>
        ))}

        {/* Category list */}
        <ul
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(26px,3.6svh,38px)] font-light leading-[1.357] tracking-[-0.01em] md:landscape:text-[min(2.1875vw,3.482svh)]"
          style={{
            fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
          onPointerLeave={clearIntent}
        >
          {CATEGORIES.map((category, i) => (
            <li key={category.label}>
              <TransitionLink
                to={category.to}
                end={category.end}
                onPointerEnter={(e) => handlePointerEnter(e, i)}
                onPointerLeave={clearIntent}
                onFocus={() => activate(i)}
                onClick={handleDivState}
                className={`inline-block cursor-pointer px-4 py-1.5 outline-none transition-colors duration-200 ease-out focus-visible:underline focus-visible:underline-offset-8 md:landscape:py-0 ${
                  active === i ? "text-[#eee]" : "text-[#666]"
                }`}
              >
                {category.label}
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}