import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * A tiny inline "image" chip used inside a line. Pass a real <img> instead if you like.
 */
const VideoChip = ({ src, poster }) => (
  <span
    aria-hidden
    className="mx-[0.20em] my-[0.20em]  inline-block h-[5vw] w-[10vw] translate-y-[0.06em] overflow-hidden rounded-[0.18em] align-middle"
  >
    <video
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="h-full w-full object-cover"
    />
  </span>
);

const DEFAULT_LINES = [
  "A Developer,",
  <>Builder<VideoChip src="/videos/aboutVideo1.mp4" /> Creative </>,
  "Thinker, Problem ",
  "Solver,",
  <>Full <VideoChip src="/videos/aboutVideo2.mp4" /> Stack</>,
  "Engineer With",
  "Fun Creative Ideas",
  <>That <VideoChip src="/videos/aboutVideo3.mp4" /> Keep</>,
  "Moving You",
  "Forward",
];

export default function CylinderScroll({
  lines = DEFAULT_LINES,
  radius = 300,
  step = 15,
  visible = 80,
  scrollPerLine = 140,
  hint = "Scroll to proceed",
  gap = visible, // >= visible keeps the first line fully hidden at rest
  className = "",
}) {
  const sectionRef = useRef(null);
  const itemRefs = useRef([]);

  useLayoutEffect(() => {
    const items = itemRefs.current.filter(Boolean);
    const n = items.length;
    const rad = Math.PI / 180;

    // Index 0 is the hint, parked at the centre (angle 0). The real lines wait
    // below it and rise in as the user scrolls; the hint folds away at the top.
    const angles = items.map((_, i) => (i === 0 ? 0 : gap + (i - 1) * step));
    const start = 0;
    const end = angles[n - 1] + visible;
    const state = { rot: start };

    const render = () => {
      items.forEach((el, i) => {
        // angle of this line relative to the centre; positive = below centre
        const a = angles[i] - state.rot;
        const abs = Math.abs(a);
        const t = Math.min(abs / visible, 1);
        const hidden = abs >= visible;

        gsap.set(el, {
          yPercent: -50,
          y: Math.sin(a * rad) * radius, // below centre => +y
          z: Math.cos(a * rad) * radius - radius,
          rotationX: a,
          opacity: hidden ? 0 : Math.pow(1 - t, 1.4),
          filter: `blur(${(t * 1.5).toFixed(2)}px)`,
          visibility: hidden ? "hidden" : "visible",
        });
      });
    };
    render();

    const ctx = gsap.context(() => {
      gsap.to(state, {
        rot: end,
        ease: "none",
        onUpdate: render,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${n * scrollPerLine}`,
          pin: true,
          scrub: 0.6, // smoothing so the cylinder eases to the scroll position
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [lines, radius, step, visible, scrollPerLine, gap, hint]);

  return (
    <section
      ref={sectionRef}
      className={`relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0c] text-white ${className}`}
    >
      {/* perspective wrapper */}
      <div
        className="relative h-0 w-full max-w-3xl"
        style={{ perspective: "900px", transformStyle: "preserve-3d" }}
      >
        {[hint, ...lines].map((line, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className={`absolute left-0 top-0 w-full select-none whitespace-nowrap text-center leading-none will-change-transform ${
              i === 0
                ? "text-sm font-normal uppercase tracking-[0.35em] text-white/70 sm:text-base"
                : "text-5xl font-medium tracking-tight sm:text-6xl md:text-7xl"
            }`}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            {line}
          </div>
        ))}
      </div>

    </section>
  );
}
