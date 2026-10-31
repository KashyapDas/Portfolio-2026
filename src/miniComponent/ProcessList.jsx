import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const EASE = "power4.inOut";
const DURATION = 0.85;
const RAIL_DURATION = 0.45;
const RAIL_LAG = 0.09;
const SHIFT = 35;

// [active, inactive]
const COLOR = {
  title: ["#1e1e1e", "#a3a3a3"],
  body: ["#6b6b6b", "#bdbdbd"],
  num: ["#8f8f8f", "#cfcfcf"],
};

const DEFAULT_STEPS = [
  {
    title: "StrawberryDB",
    body: "A TypeScript database abstraction project exploring one consistent developer experience across relational and document databases.",
    image: "/images/strawberrydb.jpg",
    alt: "StrawberryDB project preview",
  },
  {
    title: "Bridge",
    body: "A lightweight developer productivity CLI that connects different development technologies through a unified command-line interface.",
    image: "/images/bridge.jpg",
    alt: "Bridge CLI project preview",
  },
  {
    title: "Payora",
    body: "A modern fintech payment platform designed to simplify digital transactions with a clean interface, intuitive payment experience, and seamless financial management.",
    image: "/images/payora.jpg",
    alt: "Payora project preview",
  },
  {
    title: "EduPredict",
    body: "A PyTorch-based machine learning project that predicts student academic performance (Pass/Fail) using study hours, attendance, and other academic factors.",
    image: "/images/edupredict.jpg",
    alt: "EduPredict project preview",
  },
];

export default function ProcessList({ steps = DEFAULT_STEPS, className = "" }) {
  const rootRef = useRef(null);
  const api = useRef({ select: () => {} });

  const count = steps.length;

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root || count === 0) return;

    const n = count;

    const motion = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    let active = -1;
    let ro = null;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      const list = q("[data-list]")[0];
      const indicator = q("[data-indicator]")[0];
      const strip = q("[data-strip]")[0];

      const items = q("[data-item]");
      const btns = q("[data-btn]");
      const inners = q("[data-inner]");
      const titles = q("[data-title]");
      const bodies = q("[data-body]");
      const nums = q("[data-num]");

      if (!list || !indicator || !strip) return;

      // Calculate the active rail position.
      const railEdges = (i) => {
        const el = items[i];

        return {
          top: el.offsetTop,
          bottom: list.offsetHeight - (el.offsetTop + el.offsetHeight),
        };
      };

      // Animate the selected project.
      const goTo = (next, instant = false) => {
        if (next < 0 || next >= n) return;
        if (next === active && !instant) return;

        const prev = active;

        active = next;

        const move = (target, props, opts = {}) => {
          if (instant || !motion) {
            gsap.set(target, props);
          } else {
            gsap.to(target, {
              ...props,
              duration: DURATION,
              ease: EASE,
              overwrite: "auto",
              ...opts,
            });
          }
        };

        // Sliding image strip.
        move(strip, {
          yPercent: -(100 / n) * next,
        });

        // Project text animation.
        items.forEach((_, i) => {
          const on = i === next ? 0 : 1;

          move(inners[i], {
            x: i === next ? SHIFT : 0,
          });

          move(titles[i], {
            color: COLOR.title[on],
          });

          move(bodies[i], {
            color: COLOR.body[on],
          });

          move(nums[i], {
            color: COLOR.num[on],
          });

          btns[i].setAttribute("aria-current", i === next ? "step" : "false");
        });

        // Active indicator animation.
        const { top, bottom } = railEdges(next);

        const down = next > prev;

        move(
          indicator,
          { top },
          {
            duration: RAIL_DURATION,
            delay: down ? RAIL_LAG : 0,
          },
        );

        move(
          indicator,
          { bottom },
          {
            duration: RAIL_DURATION,
            delay: down ? 0 : RAIL_LAG,
          },
        );
      };

      // Only called by project button clicks.
      const select = (i) => {
        if (i === active) return;

        goTo(i);
      };

      api.current.select = select;

      // Set the first project as active initially.
      goTo(0, true);

      // Recalculate indicator position on resize.
      ro = new ResizeObserver(() => {
        if (active >= 0) {
          gsap.set(indicator, railEdges(active));
        }
      });

      ro.observe(list);
    }, root);

    return () => {
      if (ro) ro.disconnect();

      api.current.select = () => {};

      ctx.revert();
    };
  }, [count]);

  const pick = (i) => {
    api.current.select(i);
  };

  return (
    <section
      ref={rootRef}
      className={`relative flex min-h-svh w-full items-center px-6 py-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-202">
        <div className="mt-5 grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_347px]">
          {/* Project list */}
          <ol data-list className="relative flex flex-col gap-8.75">
            {/* Background rail */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-px bg-black/[0.07]"
            />

            {/* Active rail indicator */}
            <span
              data-indicator
              aria-hidden
              className="pointer-events-none absolute left-0 w-px bg-violet-400"
            />

            {steps.map((s, i) => (
              <li key={s.title ?? i} data-item>
                <button
                  type="button"
                  data-btn
                  onClick={() => pick(i)}
                  aria-current={i === 0 ? "step" : "false"}
                  className="block w-full cursor-pointer text-left outline-none focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-neutral-500"
                >
                  <span
                    data-inner
                    className="flex pl-4.25 will-change-transform"
                  >
                    {/* Project number */}
                    <span
                      data-num
                      className="mt-2 w-5.75 shrink-0 text-[9px] leading-none tabular-nums text-[#cfcfcf]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Project information */}
                    <span className="block">
                      <span
                        data-title
                        className="block text-[22px] font-bold leading-6.75 tracking-[-0.03em] text-[#a3a3a3]"
                      >
                        {s.title}
                      </span>

                      <span
                        data-body
                        className="mt-1 block max-w-71.25 text-[12px] leading-4.25 tracking-[-0.005em] text-[#bdbdbd]"
                      >
                        {s.body}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          {/* Project image strip */}
          <div className="relative aspect-4/5 w-full max-w-86.75 overflow-hidden md:justify-self-end">
            <div
              data-strip
              className="absolute inset-x-0 top-0 will-change-transform"
              style={{
                height: `${count * 100}%`,
              }}
            >
              {steps.map((s, i) => (
                <div
                  key={s.title ?? i}
                  className="relative w-full overflow-hidden"
                  style={{
                    height: `${100 / count}%`,
                  }}
                >
                  <img
                    src={s.image}
                    alt={s.alt ?? s.title}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
