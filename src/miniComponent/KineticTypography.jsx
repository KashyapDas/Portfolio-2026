
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const KineticFooter = ({
  title = "THE WORLD DOESN'T NEED ANOTHER WEBSITE. IT NEEDS A REASON TO REMEMBER.",
  images = [],
}) => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const letterRefs = useRef([]);
  const imageRefs = useRef([]);

  useGSAP(
    () => {
      if (!images.length) return;

      const letters = letterRefs.current.filter(Boolean);
      const cards = imageRefs.current.filter(Boolean);

      let letterPositions = [];
      let cancelled = false;

      // Calculate the original position of every letter.
      const calculateLetterPositions = () => {
        letterPositions = letters.map((letter) => {
          const rect = letter.getBoundingClientRect();

          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        });
      };

      // Restore all letters to their original positions.
      const resetLetters = () => {
        gsap.set(letters, {
          x: 0,
          y: 0,
          rotation: 0,
        });
      };

      // Push letters away from the approaching image.
      const repelLetters = (card) => {
        if (!letterPositions.length) return;

        const imageRect = card.getBoundingClientRect();

        const imageX = imageRect.left + imageRect.width / 2;
        const imageY = imageRect.top + imageRect.height / 2;

        const radius = 300;
        const strength = 55;
        const verticalStrength = 115;

        letters.forEach((letter, index) => {
          const original = letterPositions[index];

          if (!original) return;

          const dx = original.x - imageX;
          const dy = original.y - imageY;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < radius) {
            const force = Math.pow(
              1 - distance / radius,
              1.6
            );

            const safeDistance = Math.max(distance, 1);

            const moveX =
              (dx / safeDistance) * strength * force;

            const moveY =
              (dy / safeDistance) * verticalStrength * force;

            gsap.set(letter, {
              x: moveX,
              y: moveY,
              rotation:
                (dx > 0 ? 1 : -1) * force * 16,
            });
          } else {
            gsap.set(letter, {
              x: 0,
              y: 0,
              rotation: 0,
            });
          }
        });
      };

      // Initial position calculation.
      calculateLetterPositions();
      resetLetters();

      // Create the animation timeline.
      const timeline = gsap.timeline({
        defaults: {
          ease: "none",
        },

        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${images.length * 100}%`,
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,

          // Recalculate when the footer enters the viewport.
          onEnter: () => {
            resetLetters();
            calculateLetterPositions();
          },

          // Recalculate when scrolling backwards.
          onEnterBack: () => {
            resetLetters();
            calculateLetterPositions();
          },

          // Recalculate after ScrollTrigger refreshes.
          onRefresh: (self) => {
            if (self.isActive) {
              resetLetters();
              calculateLetterPositions();
            }
          },
        },
      });

      // Animate each image sequentially.
      cards.forEach((card, index) => {
        const position = index * 1.15;

        gsap.set(card, {
          x: "110vw",
          scale: 0.35,
          opacity: 1,
        });

        // Image travels from right to left.
        timeline.to(
          card,
          {
            x: "-110vw",
            duration: 1,
            ease: "none",

            onUpdate: () => {
              repelLetters(card);
            },
          },
          position
        );

        // Scale image up.
        timeline.to(
          card,
          {
            scale: 1.4,
            duration: 0.4,
            ease: "power2.out",
          },
          position
        );

        // Shrink image as it leaves.
        timeline.to(
          card,
          {
            scale: 0.15,
            duration: 0.6,
            ease: "power2.in",
          },
          position + 0.4
        );

        // Fade image away.
        timeline.to(
          card,
          {
            opacity: 0,
            duration: 0.15,
          },
          position + 0.85
        );
      });

      // Reset text when animation finishes.
      timeline.eventCallback("onComplete", resetLetters);
      timeline.eventCallback("onReverseComplete", resetLetters);

      // Wait for fonts and images before refreshing.
      const refreshAfterLayout = async () => {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }

        await Promise.all(
          cards.map((card) => {
            const img = card.querySelector("img");

            if (!img || img.complete) {
              return Promise.resolve();
            }

            return new Promise((resolve) => {
              img.addEventListener("load", resolve, {
                once: true,
              });

              img.addEventListener("error", resolve, {
                once: true,
              });
            });
          })
        );

        if (cancelled) return;

        calculateLetterPositions();

        requestAnimationFrame(() => {
          if (!cancelled) {
            ScrollTrigger.refresh();
          }
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
      dependencies: [images, title],
      revertOnUpdate: true,
    }
  );

  // Split title into individual characters.
  const words = title.split(" ");

  let letterIndex = 0;

  return (
    <div className="w-full">

      {/* GSAP Animated Section */}
      <section
        ref={sectionRef}
        className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden bg-[#09090b] text-white"
      >
        {/* Typography */}
        <div
          ref={textRef}
          className="relative z-10 flex w-full lg:w-[80vw] max-w-275 flex-wrap items-center justify-center gap-x-[0.22em] gap-y-1 px-5 text-[4.6vw] lg:text-6xl text-center font-normal leading-[0.95] tracking-[-0.075em]"
        >
          {words.map((word, wordIndex) => (
            <span
              key={wordIndex}
              className="inline-flex whitespace-nowrap"
            >
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

      {/* Bottom CTA Section - At least 30vh */}
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
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kashyap.education2234@gmail.com&su=Let's%20Work%20Together" target="_blank" rel="noopener noreferrer" className="hidden lg:block rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-violet-400">Let's Talk ↗</a>
          
        </div>

      </section>
    </div>
  );
};

export default KineticFooter;
