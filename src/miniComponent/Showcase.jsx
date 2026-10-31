import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import SingleCase from "./SingleCase";

const showCase = [
  {title : "2024", description : "Completed BCA and strengthened the foundations of software development."},
  {title : "2025", description : "Started MCA and continued exploring full-stack engineering and applied technology."},
  {title : "Building", description : "Developed projects across interactive frontend experiences, full-stack applications and developer tooling."},
  {title : "Now", description : "Focused on freelance work, stronger engineering practices and building StrawberryDB."},
];

const images = [
  "https://i.pinimg.com/1200x/f5/57/89/f55789498775ddade8656ef5e3546ac0.jpg",
  "https://i.pinimg.com/736x/25/18/11/251811f54bdb444d134cfc9a8d34a642.jpg",
  "https://i.pinimg.com/736x/24/7d/66/247d668068ecfcfce5657a6e64fbe2e6.jpg",
  "https://i.pinimg.com/736x/23/ef/a7/23efa724d8662095e87106e7d1cc2c14.jpg",
];

const Showcase = () => {
  const rootRef = useRef(null);
  const windowRef = useRef(null);
  const ctxRef = useRef(null);

  // index of the card that is hovered / touched (-1 = none)
  const [active, setActive] = useState(-1);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  // Initial state: the window is parked above, scenes are pushed down so nothing shows yet.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(windowRef.current, { y: isMobile ? -35 : "-35vh" });
      gsap.set(".scence", { y: "35vh" });
    }, rootRef);
    ctxRef.current = ctx;
    return () => ctx.revert();
  }, [isMobile]);

  // Called by <SingleCase /> with its index (-7 = pointer left everything)
  const mover = useCallback(
    (count) => {
      setActive(count);

      const pos = count * (isMobile ? 250 : 35); // 250px per section on mobile, 35vh on desktop

      ctxRef.current?.add(() => {
        gsap.to(windowRef.current, {
          y: isMobile ? pos : `${pos}vh`,
          duration: 0.9,
          ease: "power4.inOut",
          overwrite: "auto",
        });

        gsap.to(".scence", {
          y: `${-pos}vh`,
          duration: 0.4,
          ease: "expo.out",
          overwrite: "auto",
        });
      });
    },
    [isMobile]
  );

  // Touch screens never fire mouseleave, so a tap outside the list clears the active card.
  useEffect(() => {
    const onOutsideTouch = (e) => {
      if (!rootRef.current?.contains(e.target)) mover(-7);
    };
    document.addEventListener("touchstart", onOutsideTouch, { passive: true });
    return () => document.removeEventListener("touchstart", onOutsideTouch);
  }, [mover]);

  return (
    <div
      ref={rootRef}
      className="w-full h-fit text-white mt-16 lg:mt-40 flex flex-col gap-22 lg:gap-0 relative overflow-hidden"
    >
      {showCase.map((elem, index) => (
        <SingleCase
          key={index}
          data={elem}
          mover={mover}
          index={index}
          isActive={active === index}
        />
      ))}

      <div className="w-full h-full absolute top-0 left-0 pointer-events-none hidden lg:block">
        <div
          ref={windowRef}
          className="window absolute left-1/2 -translate-x-1/2 overflow-hidden w-[90%] sm:w-[80%] md:w-[60%] lg:w-80 h-62.5 sm:h-75 md:h-87.5 lg:h-[35vh]"
        >
          {images.map((src, i) => (
            <div key={i} className="scence h-full w-full">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Showcase;
