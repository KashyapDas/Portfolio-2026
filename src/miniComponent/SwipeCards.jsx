
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

const DEFAULT_CARDS = [
  {
    body: "Add your strongest GSAP/React project. Describe the interaction, visual direction and the part you implemented. Attach a project video.",
    author: "Kashyap Jyoti Das",
    role: "Interactive Frontend",
    color: "#C4B4FF",
    avatar: "A",
  },
  {
    body: "Add a real MERN or PERN project. Explain the user problem, main features, backend and database choices.",
    author: "Kashyap Jyoti Das",
    role: "Full Stack Application",
    color: "#c4ff65",
    avatar: "S",
  },
  {
    body: "Add a real LangChain or PyTorch project. State what it does, what you learned and what is still experimental.",
    author: "Kashyap Jyoti Das",
    role: "AI / Python experiement",
    color: "#C4B4FF",
    avatar: "D",
  },
  {
    body: "Add another project only if it demonstrates a distinct capability. Link to a live demo or repository where available.",
    author: "Kashyap Jyoti Das",
    role: "More experiments",
    color: "#c4ff65",
    avatar: "M",
  },
  {
    body: "Using MWG is a plug-and-play experience. No bloated code, no overcrowding, just efficient code. I can't say it's the best resource for creative developers!",
    author: "Kashyap Jyoti Das",
    role: "Database and Developer Tools",
    color: "#C4B4FF",
    avatar: "N",
  },
  {
    body: "Showcase your Three.js or advanced animation experiments. Highlight 3D interactions, creative coding, motion design, and the technologies behind them.",
    author: "Kashyap Jyoti Das",
    role: "Creative Development 3D",
    color: "#c4ff65",
    avatar: "O",
  },
];

export default function SwipeCards({
  cards = DEFAULT_CARDS,
  className = "",
}) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const drag = useRef({
    isDragging: false,
    startX: 0,
    startPointerX: 0,
    lastPointerX: 0,
    lastTime: 0,
    velocity: 0,
    pointerId: null,
  });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) return;

    let resizeObserver;

    const getBounds = () => {
      const max = Math.max(
        0,
        track.scrollWidth - viewport.clientWidth
      );

      return {
        min: -max,
        max: 0,
      };
    };

    const clampX = (x) => {
      const bounds = getBounds();
      return gsap.utils.clamp(bounds.min, bounds.max, x);
    };

    const snapToNearest = (x) => {
      const children = [...track.children];

      if (!children.length) return 0;

      let closest = 0;
      let minDistance = Infinity;

      children.forEach((card) => {
        const position = clampX(-card.offsetLeft);
        const distance = Math.abs(position - x);

        if (distance < minDistance) {
          minDistance = distance;
          closest = position;
        }
      });

      return closest;
    };

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;

      if (e.target.closest("a, button")) return;

      gsap.killTweensOf(track);

      const currentX =
        Number(gsap.getProperty(track, "x")) || 0;

      drag.current = {
        isDragging: true,
        startX: currentX,
        startPointerX: e.clientX,
        lastPointerX: e.clientX,
        lastTime: performance.now(),
        velocity: 0,
        pointerId: e.pointerId,
      };

      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add("is-dragging");
    };

    const onPointerMove = (e) => {
      const d = drag.current;

      if (!d.isDragging || d.pointerId !== e.pointerId) return;

      const now = performance.now();
      const delta = e.clientX - d.startPointerX;

      const nextX = clampX(d.startX + delta);

      const timeDelta = Math.max(1, now - d.lastTime);

      const instantVelocity =
        (e.clientX - d.lastPointerX) / timeDelta;

      // Smooth velocity tracking
      d.velocity = gsap.utils.interpolate(
        d.velocity,
        instantVelocity,
        0.35
      );

      d.lastPointerX = e.clientX;
      d.lastTime = now;

      gsap.set(track, {
        x: nextX,
        force3D: true,
      });
    };

    const onPointerUp = (e) => {
      const d = drag.current;

      if (!d.isDragging || d.pointerId !== e.pointerId) return;

      d.isDragging = false;

      viewport.classList.remove("is-dragging");

      if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId);
      }

      const currentX =
        Number(gsap.getProperty(track, "x")) || 0;

      // Apply momentum after release
      const projectedX = clampX(
        currentX + d.velocity * 350
      );

      const targetX = snapToNearest(projectedX);

      gsap.to(track, {
        x: targetX,
        duration: 1.1,
        ease: "power4.out",
        force3D: true,
        overwrite: true,
      });

      d.pointerId = null;
    };

    const onResize = () => {
      const currentX =
        Number(gsap.getProperty(track, "x")) || 0;

      gsap.set(track, {
        x: clampX(currentX),
        force3D: true,
      });
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);

    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);

    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);

      resizeObserver?.disconnect();

      gsap.killTweensOf(track);
    };
  }, [cards]);

  return (
    <section
      className={`w-full overflow-hidden bg-[#09090B] py-16 ${className}`}
    >
      <div
        ref={viewportRef}
        className="swipe-viewport w-full overflow-hidden cursor-grab select-none"
        style={{
          touchAction: "pan-y",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-4 px-6 md:gap-5 md:px-12"
          style={{
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
          }}
        >
          {cards.map((card, index) => (
            <article
              key={index}
              className="relative flex h-57.5 w-61.25 shrink-0 flex-col justify-between overflow-hidden rounded-[10px] p-5 sm:h-65 sm:w-70 md:h-70 md:w-75"
              style={{
                backgroundColor: card.color || "#eeeeee",
                color: card.textColor || "#171717",
              }}
            >
              <p className="text-[13px] font-medium leading-[1.35] tracking-[-0.02em] sm:text-[14px]">
                {card.body}
              </p>

              <div className="flex items-center gap-3">
                {card.avatar?.startsWith("http") ||
                card.avatar?.startsWith("/") ? (
                  <img
                    src={card.avatar}
                    alt={card.author}
                    draggable={false}
                    className="pointer-events-none h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/10 text-[13px] font-bold">
                    {card.avatar || card.author?.charAt(0)}
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wide">
                    {card.author}
                  </h3>

                  <p className="mt-1 text-[9px] font-medium uppercase tracking-wide opacity-60">
                    {card.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .swipe-viewport {
          cursor: grab;
          -webkit-user-select: none;
          user-select: none;
        }

        .swipe-viewport.is-dragging {
          cursor: grabbing;
        }

        .swipe-viewport.is-dragging * {
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>
    </section>
  );
}
