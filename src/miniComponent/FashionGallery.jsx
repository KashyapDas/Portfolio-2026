"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(Draggable, Flip, CustomEase);

/* -------------------------------------------------------------------------- */
/*  Config & data                                                             */
/* -------------------------------------------------------------------------- */

const ROWS = 8;
const COLS = 12;
const TOTAL = ROWS * COLS;
const DEFAULT_ZOOM = 0.6; // grid is shown at 60%

// Responsive tile size: phones / tablets / desktop
const sizeFor = (w) => (w < 640 ? 220 : w < 1024 ? 280 : 320);

const FONT_CSS = `
@import url("https://fonts.cdnfonts.com/css/thegoodmonolith");
@font-face {
  font-family: "PPNeueMontreal";
  src: url("https://assets.codepen.io/7558/PPNeueMontreal-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}`;

const SANS = "font-['PPNeueMontreal',sans-serif]";
const MONO = "font-['TheGoodMonolith',monospace]";

const LINE_CLASS = `block overflow-hidden ${SANS} text-sm font-light leading-[1.4] text-white/80 min-[900px]:text-base`;

const DEFAULT_IMAGES =  [
  `images/about1.jpg`,
  `images/about2.jpg`,
  `images/about3.jpg`,
  `images/about4.jpg`,
  `images/about5.jpg`,
  `images/about6.jpg`,
  `images/about7.jpg`,
  `images/about8.jpg`,
  `images/about9.jpg`,
  `images/about10.jpg`,
  `images/about11.jpg`,
  `images/about12.jpg`,
  `images/about13.jpg`,
  `images/about14.jpg`,
  `images/about15.jpg`,
  `images/about16.jpg`,
  `images/about17.jpg`,
  `images/about18.jpg`,
  
];

const DEFAULT_SLIDES = [
  ["01", "Ideas Into Experiences", "Every great digital experience begins with an idea. I turn those ideas into interactive, meaningful, and memorable realities."],

  ["02", "Design Meets Engineering", "Beautiful interfaces deserve powerful engineering. I bring both together to create experiences that look good and work even better."],

  ["03", "Beyond the Interface", "A website is more than pixels on a screen. It's an experience shaped by thoughtful interactions, smooth transitions, and purposeful details."],

  ["04", "Motion With Meaning", "Animation isn't just decoration. Every movement has a purpose, every transition tells a story, and every interaction creates a connection."],

  ["05", "Built to Make an Impact", "Good code solves problems. Great products make a difference. I focus on building digital solutions that do both."],

  ["06", "Curiosity Drives Creation", "Technology never stands still, and neither should creativity. Explore new tools, experiment with ideas, and keep pushing boundaries."],

  ["07", "Every Pixel Has a Purpose", "From the smallest interaction to the biggest layout, details matter. Precision is what transforms an ordinary interface into an extraordinary one."],

  ["08", "Think Beyond the Stack", "Frameworks are tools, not limitations. Understand the problem first, choose the right technology, and build with intention."],

  ["09", "Crafted Through Iteration", "The first version is just the beginning. Test, refine, rebuild, and repeat until the experience feels right."],

  ["10", "Performance Is a Feature", "A beautiful website should never compromise speed. Smooth interactions, optimized assets, and clean architecture belong together."],

  ["11", "From Frontend to Backend", "Great experiences need more than a polished interface. I connect thoughtful frontend design with reliable backend engineering."],

  ["12", "Experiment Without Limits", "Some of the best ideas come from unexpected experiments. Break patterns, explore possibilities, and discover what hasn't been built yet."],

  ["13", "Code With Intention", "Clean code is not just about fewer lines. It's about clarity, maintainability, and creating something that can grow."],

  ["14", "The Web Is My Canvas", "Every browser is an opportunity to create. Through code, motion, and interaction, I turn empty screens into living experiences."],

  ["15", "Problems Into Possibilities", "Challenges are part of the process. Understand the complexity, find the right direction, and turn obstacles into opportunities."],

  ["16", "Always in Progress", "Technology evolves, ideas improve, and skills grow. Stay curious, keep learning, and never stop building."],

  ["17", "Function With Personality", "A great digital product should be intuitive without being ordinary. Give functionality a personality and let the experience speak."],

  ["18", "Build. Break. Improve. Repeat.", "Every project teaches something new. Keep experimenting, embrace the difficult parts, and make every next creation better than the last."]
].map(([number, title, description]) => ({ number, title, description }));

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const initialState = () => ({
  zoom: DEFAULT_ZOOM,
  gap: 32,
  dims: { width: 0, height: 0 },
  last: { x: 0, y: 0 },
  draggable: null,
  observer: null,
  zoomActive: false,
  exiting: false,
  selected: null,
  flip: null,
  lines: [],
  description: "",
  introDone: false,
  dragging: false,
});

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

// Greedy line splitter (SplitText replacement) – measures with the real line styles.
function splitIntoLines(el, text) {
  el.textContent = "";
  const maxWidth = el.clientWidth;
  const probe = document.createElement("span");
  probe.className = `${LINE_CLASS} absolute invisible whitespace-nowrap`;
  el.appendChild(probe);

  const lines = [];
  let current = "";
  text.split(/\s+/).forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    probe.textContent = test;
    if (probe.offsetWidth > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);

  el.textContent = "";
  return lines.map((line) => {
    const span = document.createElement("span");
    span.className = LINE_CLASS;
    span.textContent = line;
    el.appendChild(span);
    return span;
  });
}

/* -------------------------------------------------------------------------- */
/*  Grid tile                                                                 */
/* -------------------------------------------------------------------------- */

const GridItem = memo(function GridItem({ index, src, size, register, onOpen }) {
  return (
    <div
      ref={(el) => register(index, el)}
      role="button"
      tabIndex={0}
      aria-label={`Open portrait ${index + 1}`}
      onClick={() => onOpen(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(index);
        }
      }}
      style={{ width: size, height: size }}
      className="absolute left-0 top-0 z-1 cursor-pointer bg-black opacity-0 will-change-[transform,opacity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <img
        src={src}
        alt={`Fashion portrait ${index + 1}`}
        draggable={false}
        decoding="async"
        className="pointer-events-none block h-full w-full select-none object-cover"
      />
    </div>
  );
});


export default function FashionGallery({ images = DEFAULT_IMAGES, slides = DEFAULT_SLIDES,onReady, }) {
  // DOM refs
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const itemRefs = useRef([]);
  const splitRef = useRef(null);
  const zoomTargetRef = useRef(null);
  const overlayRef = useRef(null);
  const overlayImgRef = useRef(null);
  const titleOverlayRef = useRef(null);
  const numberRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const closeRef = useRef(null);

  // Imperative engine state (kept out of React state so dragging never re-renders)
  const st = useRef(null);
  if (st.current === null) st.current = initialState();
  const apiRef = useRef({});
  const itemSizeRef = useRef(320);
  const slidesRef = useRef(slides);

  // UI state
  const [itemSize, setItemSize] = useState(320);
  const [zoomOn, setZoomOn] = useState(false);
  const [slide, setSlide] = useState(slides[0]);

  const register = useCallback((i, el) => {
    itemRefs.current[i] = el;
  }, []);
  const openItem = useCallback((i) => apiRef.current.enterZoom?.(i), []);

  /* ------------------------- responsive tile sizing ------------------------ */

  useEffect(() => {
    const root = rootRef.current;
    const update = () => setItemSize(sizeFor(root.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useIsoLayoutEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useIsoLayoutEffect(() => {
    itemSizeRef.current = itemSize;
    apiRef.current.relayout?.();
  }, [itemSize]);

  /* ------------------------------ gallery engine --------------------------- */

  useEffect(() => {
    const s = st.current;
    Object.assign(s, initialState());

    const root = rootRef.current;
    itemSizeRef.current = sizeFor(root.clientWidth);
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    const split = splitRef.current;
    const zoomTarget = zoomTargetRef.current;
    const overlay = overlayRef.current;
    const overlayImg = overlayImgRef.current;
    const titleOverlay = titleOverlayRef.current;
    const numberEl = numberRef.current;
    const titleEl = titleRef.current;
    const descEl = descRef.current;
    const closeBtn = closeRef.current;

    const itemEls = itemRefs.current.slice(0, TOTAL);
    const items = itemEls.map((el, index) => ({
      el,
      index,
      row: Math.floor(index / COLS),
      col: index % COLS,
      baseX: 0,
      baseY: 0,
    }));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const customEase = CustomEase.create("smooth", ".87,0,.13,1");
    const tile = () => itemSizeRef.current;
    const viewW = () => root.clientWidth;
    const viewH = () => root.clientHeight;

    /* ---- layout math ---- */

    const gapFor = (z) => (z >= 1 ? 16 : z >= 0.6 ? 32 : 64);

    const calcDims = (gap) => {
      s.dims = {
        width: COLS * (tile() + gap) - gap,
        height: ROWS * (tile() + gap) - gap,
      };
    };

    const centered = (zoom) => ({
      x: (viewW() - s.dims.width * zoom) / 2,
      y: (viewH() - s.dims.height * zoom) / 2,
    });

    const computeLayout = () => {
      s.gap = gapFor(s.zoom);
      calcDims(s.gap);
      items.forEach((it) => {
        it.baseX = it.col * (tile() + s.gap);
        it.baseY = it.row * (tile() + s.gap);
      });
      const { x, y } = centered(s.zoom);
      gsap.set(canvas, { width: s.dims.width, height: s.dims.height, scale: s.zoom, x, y });
      s.last = { x, y };
    };

    const calcBounds = () => {
      const vw = viewW();
      const vh = viewH();
      const sw = s.dims.width * s.zoom;
      const sh = s.dims.height * s.zoom;
      const margin = s.gap * s.zoom;
      let minX, maxX, minY, maxY;
      if (sw <= vw) minX = maxX = (vw - sw) / 2;
      else {
        maxX = margin;
        minX = vw - sw - margin;
      }
      if (sh <= vh) minY = maxY = (vh - sh) / 2;
      else {
        maxY = margin;
        minY = vh - sh - margin;
      }
      return { minX, maxX, minY, maxY };
    };

    /* ---- dragging & visibility ---- */

    const initDraggable = () => {
      s.draggable?.kill();
      calcDims(s.gap);
      s.draggable = Draggable.create(canvas, {
        type: "x,y",
        bounds: calcBounds(),
        edgeResistance: 0.8,
        onDragStart: () => {
          s.dragging = true;
          root.dataset.mode = "dragging";
          s.last = { x: s.draggable.x, y: s.draggable.y };
        },
        onDrag: () => {
          s.last = { x: s.draggable.x, y: s.draggable.y };
        },
        onDragEnd: () => {
          s.dragging = false;
          root.dataset.mode = s.zoomActive ? "zoom" : "";
        },
      })[0];
      if (s.zoomActive) s.draggable.disable();
    };

    const setupObserver = () => {
      s.observer?.disconnect();
      s.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (s.selected && entry.target === s.selected.el) return;
            gsap.to(entry.target, {
              opacity: entry.isIntersecting ? 1 : 0.1,
              duration: 0.6,
              ease: "power2.out",
              overwrite: "auto",
            });
          });
        },
        { root: null, threshold: 0.15, rootMargin: "10%" }
      );
      items.forEach((it) => s.observer.observe(it.el));
    };

    const onMouseLeave = (e) => {
      if (!s.dragging) return;
      s.dragging = false;
      root.dataset.mode = "";
      gsap.to(canvas, { duration: 0.6, x: s.last.x, y: s.last.y, ease: "power2.out" });
      s.draggable?.endDrag(e);
    };

    const relayout = () => {
      gsap.killTweensOf(canvas);
      computeLayout();
      if (!s.introDone) return; // intro finishes with a relayout of its own
      items.forEach((it) => gsap.set(it.el, { left: it.baseX, top: it.baseY }));
      initDraggable();
      setupObserver();
    };

    /* ---- split-screen zoom (single image) ---- */

    const showText = (description) => {
      s.description = description;
      s.lines = splitIntoLines(descEl, description);
      gsap.set([numberEl, titleEl, ...s.lines], { yPercent: 110, opacity: 0 });
      gsap.to(titleOverlay, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(numberEl, { yPercent: 0, opacity: 1, duration: 0.8, ease: customEase, delay: 0.1 });
      gsap.to(titleEl, { yPercent: 0, opacity: 1, duration: 0.8, ease: customEase, delay: 0.15 });
      gsap.to(s.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        ease: customEase,
        delay: 0.2,
        stagger: 0.15,
      });
    };

    const hideText = () => {
      gsap.to(titleOverlay, { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.to([numberEl, titleEl], {
        yPercent: -110,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
      if (s.lines.length) {
        gsap.to(s.lines, {
          yPercent: -110,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
          stagger: -0.05,
          overwrite: "auto",
        });
      }
    };

    const enterZoom = (index) => {
      const item = items[index];
      if (!item || s.zoomActive || !s.introDone) return;

      const img = item.el.querySelector("img");
      const data = slidesRef.current[index % slidesRef.current.length];

      s.zoomActive = true;
      s.selected = item;
      s.draggable?.disable();
      root.dataset.mode = "zoom";

      setSlide(data);
      setZoomOn(true);
      gsap.to(split, { opacity: 1, duration: 1.2, ease: customEase });

      overlayImg.src = img.currentSrc || img.src;
      overlayImg.alt = img.alt;
      const r = img.getBoundingClientRect();
      const rr = root.getBoundingClientRect();
      gsap.set(overlay, {
        display: "block",
        left: r.left - rr.left,
        top: r.top - rr.top,
        width: r.width,
        height: r.height,
        x: 0,
        y: 0,
        opacity: 1,
      });
      gsap.set(img, { opacity: 0 });

      s.flip = Flip.fit(overlay, zoomTarget, {
        duration: 1.2,
        ease: customEase,
        absolute: true,
        onComplete: () => showText(data.description),
      });

      gsap.fromTo(
        closeBtn,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.9 }
      );
    };

    const exitZoom = () => {
      if (!s.zoomActive || s.exiting || !s.selected) return;
      s.exiting = true;
      s.flip?.kill();
      hideText();
      gsap.to(closeBtn, { duration: 0.3, opacity: 0, x: 40, ease: "power2.in", overwrite: "auto" });
      setZoomOn(false);
      gsap.to(split, { opacity: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });

      const { el } = s.selected;
      const img = el.querySelector("img");
      Flip.fit(overlay, el, {
        duration: 1.2,
        ease: customEase,
        absolute: true,
        onComplete: () => {
          gsap.set(img, { opacity: 1 });
          gsap.set(overlay, { clearProps: "all" });
          root.dataset.mode = "";
          s.draggable?.enable();
          s.zoomActive = false;
          s.exiting = false;
          s.selected = null;
          s.flip = null;
        },
      });
    };

    /* ---- intro ---- */

    const playIntro = () => {
      const vw = viewW();
      const vh = viewH();
      const cx = gsap.getProperty(canvas, "x");
      const cy = gsap.getProperty(canvas, "y");
      const sc = gsap.getProperty(canvas, "scaleX");
      const centerX = (vw / 2 - cx) / sc - tile() / 2;
      const centerY = (vh / 2 - cy) / sc - tile() / 2;

      gsap.set(itemEls, {
        left: centerX,
        top: centerY,
        scale: 0.8,
        opacity: 0,
        zIndex: (i) => TOTAL - i,
      });

      gsap.to(itemEls, {
        duration: reduced ? 0.01 : 0.2,
        left: (i) => items[i].baseX,
        top: (i) => items[i].baseY,
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        stagger: { amount: reduced ? 0 : 1.5, from: "start", grid: [ROWS, COLS] },
        onComplete: () => {
          gsap.set(itemEls, { zIndex: 1 });
          s.introDone = true;
          relayout();
          onReady?.();
        },

      });
    };

    /* ---- init ---- */

    computeLayout();
    gsap.set(viewport, { opacity: 0 });
    gsap.to(viewport, {
      duration: 0.6,
      opacity: 1,
      ease: "power2.inOut",
      onComplete: playIntro,
    });

    apiRef.current = { enterZoom, exitZoom, relayout };

    /* ---- listeners ---- */

    const onKey = (e) => {
      if (s.zoomActive && e.key === "Escape") exitZoom();
    };

    let resizeTimer;
    let lastWidth = viewW();
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const widthChanged = viewW() !== lastWidth;
        lastWidth = viewW();
        if (widthChanged) relayout();
        else if (s.introDone && !s.zoomActive) initDraggable();

        if (s.zoomActive && !s.exiting) {
          // keep the zoomed image & text aligned with the new layout
          Flip.fit(overlay, zoomTarget, { absolute: true });
          if (s.description) {
            s.lines = splitIntoLines(descEl, s.description);
            gsap.set(s.lines, { yPercent: 0, opacity: 1 });
          }
        }
      }, 150);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mouseleave", onMouseLeave);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(root);

    /* ---- cleanup (also makes React StrictMode / HMR safe) ---- */

    return () => {
      clearTimeout(resizeTimer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mouseleave", onMouseLeave);
      resizeObserver.disconnect();
      s.observer?.disconnect();
      s.draggable?.kill();
      s.flip?.kill();

      const targets = [viewport, split, overlay, titleOverlay, numberEl, titleEl, closeBtn, ...s.lines];
      gsap.killTweensOf([canvas, ...itemEls, ...targets]);
      gsap.set(itemEls, { clearProps: "opacity,left,top,zIndex,transform" });
      gsap.set([canvas, ...targets], { clearProps: "all" });
      root.dataset.mode = "";
      apiRef.current = {};
    };
  }, []);

  /* --------------------------------- render -------------------------------- */

  const exit = () => apiRef.current.exitZoom?.();

  return (
    <div
      ref={rootRef}
      data-mode=""
      className={`absolute inset-0 isolate cursor-grab select-none overflow-hidden bg-black text-white ${SANS} data-[mode=dragging]:cursor-grabbing data-[mode=zoom]:cursor-default`}
    >
      <style>{FONT_CSS}</style>

      {/* Draggable grid */}
      <div ref={viewportRef} className="absolute inset-0 z-1 overflow-hidden opacity-0">
        <div ref={canvasRef} className="absolute left-0 top-0 isolate origin-top-left will-change-transform">
          <div className="relative h-full w-full">
            {Array.from({ length: TOTAL }, (_, i) => (
              <GridItem
                key={i}
                index={i}
                src={images[i % images.length]}
                size={itemSize}
                register={register}
                onOpen={openItem}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Split screen (side by side on desktop, stacked on mobile) */}
      <div
        ref={splitRef}
        className={`absolute inset-0 z-2 flex flex-col opacity-0 md:flex-row ${
          zoomOn ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={exit}
          className="relative z-1 flex h-1/2 w-full cursor-pointer items-center justify-center bg-black/60 md:h-full md:w-1/2"
        >
          <div ref={zoomTargetRef} className="relative z-1 flex h-full w-full items-center justify-center" />
        </div>
        <div
          onClick={exit}
          className="relative z-1 flex h-1/2 w-full cursor-pointer items-center justify-center bg-black/60 md:h-full md:w-1/2"
        />
      </div>

      {/* Image that flies from the grid into the split panel */}
      <div ref={overlayRef} className="pointer-events-none absolute left-0 top-0 z-3 hidden will-change-transform">
        <img ref={overlayImgRef} alt="" className="block h-full w-full object-cover" />
      </div>

      {/* Title / description */}
      <div
        ref={titleOverlayRef}
        className="pointer-events-none absolute bottom-5 left-5 right-5 z-4 text-white opacity-0 md:bottom-10 md:left-10 md:right-auto md:w-[min(25rem,calc(50%-5rem))]"
      >
        <div className="mb-2 overflow-hidden">
          <span
            ref={numberRef}
            className={`block ${MONO} text-xs font-normal uppercase leading-normal tracking-widest`}
          >
            {slide.number}
          </span>
        </div>
        <div className="mb-4 overflow-hidden">
          <h1
            ref={titleRef}
            className={`${SANS} text-[28px] font-medium leading-[1.2] tracking-[-0.02em] sm:text-4xl min-[900px]:text-5xl`}
          >
            {slide.title}
          </h1>
        </div>
        <div ref={descRef} className="min-h-20 overflow-hidden" />
      </div>

      {/* Back arrow */}
      <button
        ref={closeRef}
        type="button"
        aria-label="Close image"
        onClick={exit}
        className={`absolute right-5 top-1/2 z-5 -mt-5 flex h-10 w-10 items-center justify-center opacity-0 focus-visible:outline focus-visible:outline-white md:-mt-8 md:h-16 md:w-16 ${
          zoomOn ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full rotate-180 transition-opacity hover:opacity-70">
          <path d="M7.89873 16L6.35949 14.48L11.8278 9.08H0V6.92H11.8278L6.35949 1.52L7.89873 0L16 8L7.89873 16Z" fill="white" />
        </svg>
      </button>

      {/* Top vignette */}
      <div className="pointer-events-none absolute inset-0 z-9998">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.5)_20%,transparent_40%)] mix-blend-overlay" />
      </div>
    </div>
  );
}
