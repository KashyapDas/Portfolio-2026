import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const DEFAULT_CARDS = [
  {
    title: "User Experience",
    lines: ["Responsive UI", "Interaction & motion"],
  },
  {
    title: "Application",
    lines: ["Components", "APIs & business logic"],
  },
  {
    title: "Data",
    lines: ["Schema design", "Queries & persistence"],
  },
  {
    title: "Intelligence",
    lines: ["Retrieval", "Model-powered features"],
  },
];
const CardMarquee = ({
  cards = DEFAULT_CARDS,
  speed = 100, // px per second
  gap = 20, // px between cards
  fade = true, // soft fade on the left/right edges
  className = "",
  cardClassName = "w-65 md:w-75",
}) => {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const setRef = useRef(null); // ONE set of cards, used for measuring

  const [metrics, setMetrics] = useState({ repeat: 2, groupW: 0 });

  // Stable key so an inline `cards` array doesn't restart the animation.
  const cardsKey = JSON.stringify(cards);

  /* ------------------------------------------------------------------ */
  /* 1. Measure: how many times must the set repeat to fill the screen?  */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let raf;

    const measure = () => {
      const setW = setRef.current?.offsetWidth || 0;
      if (!setW) return;
      const repeat = Math.max(1, Math.ceil(root.clientWidth / setW));
      const groupW = setW * repeat;
      setMetrics((prev) =>
        prev.repeat === repeat && prev.groupW === groupW ? prev : { repeat, groupW }
      );
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    ro.observe(setRef.current);
    document.fonts?.ready?.then(schedule);
    schedule();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [cardsKey, gap]);

  /* ------------------------------------------------------------------ */
  /* 2. Animate: right -> left, forever, constant speed                  */
  /* ------------------------------------------------------------------ */
  useGSAP(
    () => {
      const { groupW } = metrics;
      if (!groupW || !trackRef.current) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      gsap.fromTo(
        trackRef.current,
        { x: 0 },
        {
          x: -groupW,
          duration: groupW / speed,
          ease: "none",
          repeat: -1,
        }
      );
    },
    { scope: rootRef, dependencies: [metrics.groupW, speed], revertOnUpdate: true }
  );

  /* ------------------------------------------------------------------ */

  const renderSet = (setKey, hidden, ref) => (
    <div key={setKey} ref={ref} className="flex shrink-0 pt-10 lg:pt-20" aria-hidden={hidden || undefined}>
      {cards.map((card, i) => (
        <article
          key={`${setKey}-${i}`}
          className={`shrink-0 overflow-hidden rounded-md bg-violet-500 ${cardClassName}`}
          style={{ marginRight: gap }}
        >
          <header className="bg-violet-700 px-5 py-4">
            <h3 className="home-hero text-base font-extralight uppercase tracking-wide md:text-xl text-white">
              {card.title}
            </h3>
          </header>
          <ul className="px-5 py-5 text-sm leading-relaxed text-neutral-500 md:text-base">
            {card.lines.map((line, j) => (
              <li className="home-subtitle text-white text-lg" key={j}>{line}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );

  const renderGroup = (groupKey, hidden) => (
    <div key={groupKey} className="flex shrink-0" aria-hidden={hidden || undefined}>
      {Array.from({ length: metrics.repeat }, (_, r) =>
        renderSet(
          `${groupKey}-${r}`,
          hidden || r > 0,
          groupKey === "a" && r === 0 ? setRef : undefined
        )
      )}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={
        fade
          ? {
              maskImage:
                "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
            }
          : undefined
      }
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {renderGroup("a", false)}
        {renderGroup("b", true)}
      </div>
    </div>
  );
};

export default CardMarquee;
