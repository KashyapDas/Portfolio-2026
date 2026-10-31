import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const KineticFooter = ({
  title = "THE WORLD DOESN'T NEED ANOTHER WEBSITE. IT NEEDS A REASON TO REMEMBER.",
  images = [],
}) => {
  const { pathname } = useLocation();

  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const letterRefs = useRef([]);
  const imageRefs = useRef([]);

  // `images = []` / inline arrays create a new reference on every render,
  // which would rebuild the ScrollTrigger constantly. Use a stable string key.
  const imagesKey = images
    .map((image) => (typeof image === "string" ? image : image.src))
    .join("|");

  /* ------------------------------------------------------------------ */
  /* 1. Build the pinned animation (rebuilt on every route change)       */
  /* ------------------------------------------------------------------ */
  useGSAP(
    () => {
      if (!images.length) return;

      const letters = letterRefs.current.filter(Boolean);
      const cards = imageRefs.current.filter(Boolean);
      let cancelled = false;

      const resetLetters = () => {
        gsap.set(letters, { x: 0, y: 0, rotation: 0 });
      };

      // Letter origins are computed LIVE from layout (offsetLeft/offsetTop are
      // not affected by transforms), so there is no cached, stale position.
      const repelLetters = (card) => {
        const container = textRef.current;
        if (!container) return;

        const box = container.getBoundingClientRect();
        const imageRect = card.getBoundingClientRect();
        const imageX = imageRect.left + imageRect.width / 2;
        const imageY = imageRect.top + imageRect.height / 2;

        const radius = 300;
        const strength = 55;
        const verticalStrength = 115;

        letters.forEach((letter) => {
          const ox = box.left + letter.offsetLeft + letter.offsetWidth / 2;
          const oy = box.top + letter.offsetTop + letter.offsetHeight / 2;

          const dx = ox - imageX;
          const dy = oy - imageY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < radius) {
            const force = Math.pow(1 - distance / radius, 1.6);
            const safeDistance = Math.max(distance, 1);

            gsap.set(letter, {
              x: (dx / safeDistance) * strength * force,
              y: (dy / safeDistance) * verticalStrength * force,
              rotation: (dx > 0 ? 1 : -1) * force * 16,
            });
          } else {
            gsap.set(letter, { x: 0, y: 0, rotation: 0 });
          }
        });
      };

      resetLetters();

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${images.length * 100}%`,
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Footer sits below everything else, so its start position depends
          // on the other triggers/pin-spacers above it. Refresh it LAST.
          refreshPriority: -1,
          onLeave: resetLetters,
          onLeaveBack: resetLetters,
        },
      });

      cards.forEach((card, index) => {
        const position = index * 1.15;

        gsap.set(card, { x: "110vw", scale: 0.35, opacity: 1 });

        timeline.to(
          card,
          {
            x: "-110vw",
            duration: 1,
            ease: "none",
            onUpdate: () => repelLetters(card),
          },
          position
        );

        timeline.to(
          card,
          { scale: 1.4, duration: 0.4, ease: "power2.out" },
          position
        );

        timeline.to(
          card,
          { scale: 0.15, duration: 0.6, ease: "power2.in" },
          position + 0.4
        );

        timeline.to(card, { opacity: 0, duration: 0.15 }, position + 0.85);
      });

      timeline.eventCallback("onComplete", resetLetters);
      timeline.eventCallback("onReverseComplete", resetLetters);

      // Wait for fonts + images, then refresh.
      const refreshAfterLayout = async () => {
        if (document.fonts?.ready) await document.fonts.ready;

        await Promise.all(
          cards.map((card) => {
            const img = card.querySelector("img");
            if (!img || img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            });
          })
        );

        if (cancelled) return;
        requestAnimationFrame(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
      };

      refreshAfterLayout();

      return () => {
        cancelled = true;
        resetLetters();
      };
    },
    {
      scope: sectionRef,
      // pathname => rebuild the trigger after every navigation
      dependencies: [imagesKey, title, pathname],
      revertOnUpdate: true,
    }
  );

  /* ------------------------------------------------------------------ */
  /* 2. Keep the trigger in sync with the page's real height             */
  /*    (page transitions, lazy images, accordions, route swaps, etc.)  */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let timer;
    let lastHeight = document.body.scrollHeight;

    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 150);
    };

    // Ignore the height changes caused by ScrollTrigger's own refresh.
    const onRefresh = () => {
      lastHeight = document.body.scrollHeight;
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);

    const observer = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastHeight) > 1) {
        lastHeight = h;
        scheduleRefresh();
      }
    });
    observer.observe(document.body);

    // Extra safety passes after a route change: the incoming page may mount
    // after a transition delay, so refresh again once it has settled.
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 300);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 1000);

    window.addEventListener("load", scheduleRefresh);

    return () => {
      clearTimeout(timer);
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.removeEventListener("load", scheduleRefresh);
    };
  }, [pathname]);

  /* ------------------------------------------------------------------ */

  const words = title.split(" ");
  let letterIndex = 0;

  return (
    <div className="w-full">
      {/* GSAP Animated Section */}
      <section
        ref={sectionRef}
        className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden bg-[#09090b] text-white"
      >
        <div
          ref={textRef}
          className="relative z-10 flex w-full lg:w-[80vw] max-w-275 flex-wrap items-center justify-center gap-x-[0.22em] gap-y-1 px-5 text-[4.6vw] lg:text-6xl text-center font-normal leading-[0.95] tracking-[-0.075em]"
        >
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-flex whitespace-nowrap">
              {word.split("").map((char) => {
                const currentIndex = letterIndex++;
                return (
                  <span
                    key={currentIndex}
                    ref={(el) => {
                      letterRefs.current[currentIndex] = el;
                    }}
                    className="inline-block will-change-transform"
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          ))}
        </div>

        {/* Moving Image Cards */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          {images.map((image, index) => (
            <div
              key={index}
              ref={(el) => {
                imageRefs.current[index] = el;
              }}
              className="absolute left-1/2 top-1/2 h-5 w-15 lg:h-25 lg:w-35 -translate-x-1/2 -translate-y-1/2 overflow-hidden will-change-transform"
            >
              <img
                src={typeof image === "string" ? image : image.src}
                alt=""
                loading="eager"
                draggable="false"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="flex min-h-[30vh] w-full flex-col items-center justify-center gap-6 bg-[#09090b] px-6 py-12 text-white">
        <h2 className="max-w-4xl text-center text-2xl font-medium tracking-tight md:text-4xl">
          Have a project in mind?
          <br />
          Let's make something unforgettable.
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* For phones */}
          <a
            href="mailto:kashyap.education2234@gmail.com?subject=Let's%20Work%20Together"
            className="block lg:hidden rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-violet-400"
          >
            Let's Talk ↗
          </a>
          {/* For laptop */}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=kashyap.education2234@gmail.com&su=Let's%20Work%20Together"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:block rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-violet-400"
          >
            Let's Talk ↗
          </a>
        </div>
      </section>
    </div>
  );
};

export default KineticFooter;
