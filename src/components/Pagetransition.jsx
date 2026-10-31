
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

const TransitionContext = createContext(null);

const DURATION = 0.7;
const EASE = "power4.inOut";

function waitForImages(container) {
  if (!container) return Promise.resolve();

  const images = [...container.querySelectorAll("img")];

  return Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();

      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    })
  );
}

export function PageTransitionProvider({ children }) {
  const overlayRef = useRef(null);
  const pageRef = useRef(null);

  const busy = useRef(false);
  const awaitingExit = useRef(false);

  const pageReady = useRef(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const markPageReady = useCallback(() => {
    pageReady.current = true;
  }, []);

  useLayoutEffect(() => {
    gsap.set(overlayRef.current, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    return () => {
      gsap.killTweensOf(overlayRef.current);
    };
  }, []);

  // Cover screen and navigate
  const go = useCallback(
    (to) => {
      if (busy.current || to === pathname) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        navigate(to);
        return;
      }

      const overlay = overlayRef.current;

      busy.current = true;
      pageReady.current = false;

      overlay.style.pointerEvents = "auto";

      gsap.timeline({
        onComplete: () => {
          awaitingExit.current = true;
          window.scrollTo(0, 0);
          navigate(to);
        },
      })
        .set(overlay, { transformOrigin: "left center" })
        .to(overlay, {
          scaleX: 1,
          duration: DURATION,
          ease: EASE,
        });
    },
    [navigate, pathname]
  );

  // Wait for page resources AND page entrance animations
  useEffect(() => {
    if (!awaitingExit.current) return;

    awaitingExit.current = false;

    const overlay = overlayRef.current;
    const page = pageRef.current;

    let cancelled = false;

    async function revealPage() {
      // Wait for images
      await waitForImages(page);

      // Wait until page explicitly reports animation completion
      while (!pageReady.current && !cancelled) {
        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        });
      }

      if (cancelled) return;

      // Allow browser to paint
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      if (cancelled) return;

      gsap.timeline({
        onComplete: () => {
          busy.current = false;
          overlay.style.pointerEvents = "none";
        },
      })
        .set(overlay, { transformOrigin: "right center" })
        .to(overlay, {
          scaleX: 0,
          duration: DURATION,
          ease: EASE,
        });
    }

    revealPage();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ go, markPageReady }}>
      <div ref={pageRef} className="page-content">
        {children}
      </div>

      <div
        ref={overlayRef}
        className="transition-overlay"
        aria-hidden="true"
      />
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(TransitionContext);

  if (!ctx) {
    throw new Error(
      "usePageTransition must be used inside PageTransitionProvider"
    );
  }

  return ctx;
}

export function TransitionLink({ to, children, onClick, ...props }) {
  const { go } = usePageTransition();

  const handleClick = (e) => {
    onClick?.(e);

    if (e.defaultPrevented || e.button !== 0) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    go(to);
  };

  return (
    <NavLink to={to} onClick={handleClick} {...props}>
      {children}
    </NavLink>
  );
}
