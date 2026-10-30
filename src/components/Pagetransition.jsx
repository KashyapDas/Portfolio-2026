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

export function PageTransitionProvider({ children }) {
  const overlayRef = useRef(null);
  const busy = useRef(false); // true while a transition is running
  const awaitingExit = useRef(false); // true after the route was changed, before the exit animation
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Start with the overlay collapsed on the left
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    gsap.set(overlay, { scaleX: 0, transformOrigin: "left center" });
    return () => gsap.killTweensOf(overlay);
  }, []);

  // Step 1: cover the screen (left -> right), then change the route
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
      overlay.style.pointerEvents = "auto"; // block clicks during the transition

      gsap
        .timeline({
          onComplete: () => {
            awaitingExit.current = true;
            window.scrollTo(0, 0);
            navigate(to);
          },
        })
        .set(overlay, { transformOrigin: "left center" })
        .to(overlay, { scaleX: 1, duration: DURATION, ease: EASE });
    },
    [navigate, pathname]
  );

  // Step 2: the new page is mounted, reveal it (right -> left)
  useEffect(() => {
    if (!awaitingExit.current) return;
    awaitingExit.current = false;

    const overlay = overlayRef.current;
    gsap
      .timeline({
        delay: 0.1, // let the new page paint underneath the overlay
        onComplete: () => {
          busy.current = false;
          overlay.style.pointerEvents = "none";
        },
      })
      .set(overlay, { transformOrigin: "right center" })
      .to(overlay, { scaleX: 0, duration: DURATION, ease: EASE });
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ go }}>
      {children}
      <div ref={overlayRef} className="transition-overlay" aria-hidden="true" />
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("usePageTransition must be used inside <PageTransitionProvider>");
  }
  return ctx;
}

// Drop-in replacement for <NavLink> / <Link>
export function TransitionLink({ to, children, onClick, ...props }) {
  const { go } = usePageTransition();

  const handleClick = (e) => {
    onClick?.(e);
    // let the browser handle new-tab / modified clicks
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