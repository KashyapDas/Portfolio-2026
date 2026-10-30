import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { TransitionLink } from "./Pagetransition";
import CastList from "./CastList";
import "remixicon/fonts/remixicon.css";
import "../index.css";

function Navbar() {
  const navbarDiv = useRef(null);

  const { contextSafe } = useGSAP({ scope: navbarDiv });

  const enableNavbar = contextSafe(() => {
    // Lock page scrolling while menu is open
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    gsap.to(navbarDiv.current, {
      xPercent: -100,
      autoAlpha: 1, // Animates opacity to 1 and visibility to visible
      duration: 0.8,
      ease: "power4.inOut",
    });
  });

  const disableNavbar = contextSafe(() => {
    gsap.to(navbarDiv.current, {
      xPercent: 0,
      autoAlpha: 0, // Animates opacity to 0 and visibility to hidden
      duration: 0.8,
      ease: "power4.inOut",
      onComplete: () => {
        // Restore page scrolling
        document.body.style.overflow = "";
        document.body.style.overscrollBehavior = "";
      },
    });
  });

  return (
    <nav className="w-full lg:px-7 lg:pt-3 h-fit flex items-center justify-between p-4 relative z-40">
      <button className="logo text-6xl sm:text-8xl">
        KSD
      </button>

      <button
        type="button"
        onClick={enableNavbar}
        aria-label="Open menu"
        className="text-4xl cursor-pointer hover:scale-105 transition-transform duration-150 bg-transparent border-none p-2"
      >
        <i className="ri-menu-line text-black"></i>
      </button>

      {/* Slide-out Menu: Off-screen, invisible, and scroll-locked by default */}
      <div
        ref={navbarDiv}
        className="fixed top-0 left-full w-screen h-dvh bg-[#0C0C0C] z-50 overflow-hidden overscroll-none touch-none invisible opacity-0"
      >
        {/* Close Button: Positioned on top */}
        <button
          type="button"
          onClick={disableNavbar}
          aria-label="Close menu"
          className="absolute top-6 right-6 -mt-3 lg:top-8 lg:right-8 z-30 p-2 text-white text-3xl cursor-pointer hover:scale-110 transition-transform duration-150 bg-transparent border-none"
        >
          <i className="ri-close-line pointer-events-none"></i>
        </button>

        {/* Content Canvas */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <CastList navbarAccess={navbarDiv} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;