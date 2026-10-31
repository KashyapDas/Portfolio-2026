import { useEffect, useId, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "../index.css"

gsap.registerPlugin(useGSAP);

const mod = (n, m) => ((n % m) + m) % m;
const clamp = gsap.utils.clamp;

const DEFAULT_ITEMS = [
  "One Unified Product,",
  { type: "image", src: "/images/skill1.jpg" },
  "Bringing Every Layer Together",
  { type: "image", src: "/images/skill2.jpg" },
  "Into One Seamless Experience.",
];
const ScrollPathText = ({
  items = DEFAULT_ITEMS,
  className = "h-[40vh]",
  textClassName = "fill-white text-5xl morganoBold font-medium tracking-tight md:text-7xl lg:text-[10vw]",
  imageSize = 84, // default image width/height (SVG units = px)
  imageRadius = 0.16, // 0 - 0.5, corner rounding of images
  gap, // space between items (px). Default: 0.3 * font size
  speed = 2, // px the content travels per px scrolled
  direction = -1, // -1: moves left while scrolling down, 1: moves right
  maxAmplitude = 520, // max wave height (px) at full scroll speed
  velocityScale = 2500, // scroll speed (px/s) that produces maxAmplitude
  wavelength, // px. Default: 80% of container width (constant frequency)
  waveSpeed = 4, // rad/s the wave drifts at a FIXED rate (0 = static wave)
  padding = 160, // how far the path extends past each screen edge
  showPath = false, // debug: draw the path
}) => {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const measureRefs = useRef([]);
  const itemRefs = useRef([]);

  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pathId = `spt-path-${uid}`;
  const clipId = `spt-clip-${uid}`;

  // Normalise + create a stable key so inline arrays don't retrigger effects.
  const itemsKey = JSON.stringify(items);
  const normalized = useMemo(
    () =>
      items.map((it) =>
        typeof it === "string"
          ? { type: "text", value: it }
          : { ...it, type: it.type || "image" },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemsKey],
  );

  const [metrics, setMetrics] = useState(null);

  /* ------------------------------------------------------------------ */
  /* 1. Measure container, text widths, and how many copies we need      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf;

    const measure = () => {
      const w = section.clientWidth;
      const h = section.clientHeight;
      if (!w || !h) return;

      const widths = normalized.map((it, i) =>
        it.type === "text"
          ? measureRefs.current[i]?.getComputedTextLength() || 0
          : (it.width ?? imageSize),
      );

      const firstText = measureRefs.current.find(Boolean);
      const fontPx = firstText
        ? parseFloat(getComputedStyle(firstText).fontSize) || 64
        : 64;
      const gapPx = gap ?? fontPx * 0.3;

      const unit = widths.reduce((a, b) => a + b, 0) + gapPx * widths.length; // one sequence
      const maxW = Math.max(...widths, 0);

      // Loop length must exceed the (stretched) path so the wrap-around
      // always happens off-screen.
      const needed = (w + padding * 2) * 1.35 + maxW;
      const repeat = Math.max(1, Math.ceil(needed / Math.max(unit, 1)));

      const next = { w, h, widths, fontPx, gapPx, unit, repeat };
      setMetrics((prev) =>
        prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
      );
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(section);
    schedule();
    document.fonts?.ready?.then(schedule);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [normalized, imageSize, gap, padding]);

  // Flat list of every rendered element, with its position inside the loop.
  const flat = useMemo(() => {
    if (!metrics) return [];
    const out = [];
    for (let c = 0; c < metrics.repeat; c++) {
      let cursor = c * metrics.unit;
      normalized.forEach((it, i) => {
        const w = metrics.widths[i];
        out.push({ ...it, key: `${c}-${i}`, srcIndex: i, w, base: cursor });
        cursor += w + metrics.gapPx;
      });
    }
    return out;
  }, [metrics, normalized]);

  /* ------------------------------------------------------------------ */
  /* 2. Animate: scroll => offset along path, scroll speed => bend       */
  /* ------------------------------------------------------------------ */
  useGSAP(
    () => {
      const path = pathRef.current;
      if (!metrics || !path || !flat.length) return;

      const { w, h, fontPx, unit, repeat } = metrics;
      const loop = unit * repeat;
      // Shared wrap window [-lead, loop - lead): every item shifts by the same
      // amount, so their spacing never changes.
      const lead = Math.max(...metrics.widths, 0);
      const cy = h / 2 + fontPx * 0.3; // optical vertical centre of the text
      const wl = wavelength ?? w * 0.8;
      // Keep the whole wave (glyph height, tilted images, lift) INSIDE the
      // section, so nothing is ever sliced by the section's edge / the next div.
      const imgHalf = Math.max(
        0,
        ...normalized.map((it) =>
          it.type === "image"
            ? (it.height ?? it.width ?? imageSize) / 2 + fontPx * 0.32
            : 0,
        ),
      );
      const extent = Math.max(fontPx * 0.85, imgHalf * 1.15) + 12;
      const maxAmp = Math.max(0, Math.min(maxAmplitude, h / 2 - extent));
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const els = flat.map((_, k) => itemRefs.current[k]);

      // ---- state -------------------------------------------------------
      let lastY = window.scrollY;
      let vel = 0; // smoothed scroll velocity (px/s)
      let amp = 0; // current wave amplitude (px, signed)
      let shift = lastY * speed * direction; // smoothed content offset
      let lastShift = NaN;
      let lastAmp = NaN;
      let lastPhase = NaN;
      let phase = 0; // constant: the wave shape never depends on scroll speed
      let active = true;

      // ---- geometry ----------------------------------------------------
      const buildPath = (a, phase) => {
        const x0 = -padding;
        const x1 = w + padding;
        const step = 6;
        let d = "";
        for (let x = x0; x <= x1 + step; x += step) {
          const y = cy + a * Math.sin((x / wl) * Math.PI * 2 + phase);
          d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
        }
        return d;
      };

      const render = () => {
        path.setAttribute("d", buildPath(amp, phase));
        const len = path.getTotalLength();

        for (let k = 0; k < flat.length; k++) {
          const it = flat[k];
          const el = els[k];
          if (!el) continue;

          // position of this item's start along the path (looping)
          const o = mod(it.base + shift + lead, loop) - lead;
          const visible = o < len && o + it.w > 0;
          el.setAttribute("visibility", visible ? "visible" : "hidden");
          if (!visible) continue;

          if (it.type === "text") {
            el.setAttribute("startOffset", o.toFixed(2));
          } else {
            const ih = it.height ?? it.width ?? imageSize;
            const c = clamp(0, len, o + it.w / 2);
            const p = path.getPointAtLength(c);
            const a = path.getPointAtLength(clamp(0, len, c - 3));
            const b = path.getPointAtLength(clamp(0, len, c + 3));
            const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
            const lift = fontPx * 0.32;
            el.setAttribute(
              "transform",
              `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${angle.toFixed(2)}) translate(${-it.w / 2} ${-ih / 2 - lift})`,
            );
          }
        }
      };

      // ---- ticker ------------------------------------------------------
      const tick = (_time, deltaTime) => {
        const dt = Math.max(deltaTime, 1) / 1000;
        const y = window.scrollY;
        const raw = (y - lastY) / dt;
        lastY = y;

        // Scroll speed only changes the HEIGHT of the wave (amplitude).
        // Frequency (wavelength) and phase stay constant, and we use the
        // speed's magnitude so scrolling up/down gives the same wave shape.
        vel += (raw - vel) * Math.min(1, dt * 10);
        const targetAmp = reduceMotion
          ? 0
          : clamp(0, 1, Math.abs(vel) / velocityScale) * maxAmp;
        // optional: wave drifts at a fixed rate in time (0 = static wave)
        if (waveSpeed && !reduceMotion) phase += waveSpeed * dt;
        amp += (targetAmp - amp) * Math.min(1, dt * 8);
        if (Math.abs(amp) < 0.05) amp = 0;

        // smooth content offset towards the scroll-driven target
        const targetShift = y * speed * direction;
        shift += (targetShift - shift) * Math.min(1, dt * 12);

        if (!active) return;
        if (
          Math.abs(shift - lastShift) < 0.01 &&
          Math.abs(amp - lastAmp) < 0.01 &&
          phase === lastPhase
        )
          return;
        lastShift = shift;
        lastAmp = amp;
        lastPhase = phase;
        render();
      };

      // Only do work while the section is near the screen. IntersectionObserver
      // is used instead of ScrollTrigger on purpose: creating/killing
      // ScrollTriggers makes GSAP re-measure every OTHER trigger on the page
      // (pins, spacers), which can make the scroll position jump.
      const io = new IntersectionObserver(
        ([entry]) => {
          active = entry.isIntersecting;
          if (active) lastShift = NaN; // force a redraw on re-entry
        },
        { rootMargin: "200px 0px 200px 0px" },
      );
      io.observe(sectionRef.current);

      render();
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        io.disconnect();
      };
    },
    {
      scope: sectionRef,
      dependencies: [
        metrics,
        flat,
        speed,
        direction,
        maxAmplitude,
        velocityScale,
        wavelength,
        waveSpeed,
        padding,
        imageSize,
      ],
      revertOnUpdate: true,
    },
  );

  /* ------------------------------------------------------------------ */

  return (
    <section
      ref={sectionRef}
      className={`relative w-full overflow-hidden bg-[#09090b] text-white ${className}`}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width={metrics?.w}
        height={metrics?.h}
        viewBox={metrics ? `0 0 ${metrics.w} ${metrics.h}` : undefined}
        style={{ opacity: metrics ? 1 : 0 }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <rect width="1" height="1" rx={imageRadius} ry={imageRadius} />
          </clipPath>
        </defs>

        <path
          ref={pathRef}
          id={pathId}
          fill="none"
          stroke={showPath ? "#a78bfa" : "none"}
          strokeWidth="1"
        />

        {/* hidden text used only to measure widths */}
        {normalized.map(
          (it, i) =>
            it.type === "text" && (
              <text
                key={`m-${i}`}
                ref={(el) => (measureRefs.current[i] = el)}
                className={textClassName}
                visibility="hidden"
                x="0"
                y="0"
              >
                {it.value}
              </text>
            ),
        )}

        {flat.map((it, k) =>
          it.type === "text" ? (
            <text
              key={it.key}
              className={textClassName}
              textRendering="geometricPrecision"
            >
              <textPath
                ref={(el) => (itemRefs.current[k] = el)}
                href={`#${pathId}`}
                startOffset="0"
                visibility="hidden"
              >
                {it.value}
              </textPath>
            </text>
          ) : (
            <g
              key={it.key}
              ref={(el) => (itemRefs.current[k] = el)}
              visibility="hidden"
            >
              <image
                href={it.src}
                width={it.w}
                height={it.height ?? it.width ?? imageSize}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${clipId})`}
              />
            </g>
          ),
        )}
      </svg>

      {/* Accessible text for screen readers (the SVG is decorative) */}
      <p className="sr-only">
        {normalized
          .filter((i) => i.type === "text")
          .map((i) => i.value)
          .join(" ")}
      </p>
    </section>
  );
};

export default ScrollPathText;
