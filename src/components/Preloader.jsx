
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useLocation } from "react-router-dom";

import "../index.css";

const PreloaderContext = createContext(null);

export function usePreloader() {
  const context = useContext(PreloaderContext);

  if (!context) {
    throw new Error("usePreloader must be used inside Preloader");
  }

  return context;
}

const VALID_ROUTES = [
  "/",
  "/about",
  "/works",
  "/skills",
  "/contact",
];

export default function Preloader({ children }) {
  const { pathname } = useLocation();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const completed = useRef(false);
  const timers = useRef([]);

  // Normalize the current route
  const currentRoute =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : "/";

  // Progress animation: 0 to 95
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 95) return 95;
        return current + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Complete loading only for the currently active route
  const completeLoading = useCallback(
    (completedRoute) => {
      const route =
        completedRoute.length > 1
          ? completedRoute.replace(/\/$/, "")
          : "/";

      if (route !== currentRoute) return;
      if (!VALID_ROUTES.includes(route)) return;
      if (completed.current) return;

      completed.current = true;

      setProgress(100);

      const showComplete = setTimeout(() => {
        setExiting(true);

        const removeLoader = setTimeout(() => {
          setVisible(false);
        }, 1000);

        timers.current.push(removeLoader);
      }, 600);

      timers.current.push(showComplete);
    },
    [currentRoute]
  );

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <PreloaderContext.Provider
      value={{ completeLoading, currentRoute }}
    >
      {children}

      {visible && (
        <div
          className={`fixed inset-0 z-99999 flex items-center justify-center
          bg-[#09090B] text-white
          transition-transform duration-1000
          ease-[cubic-bezier(0.76,0,0.24,1)]
          ${exiting ? "-translate-y-full" : "translate-y-0"}`}
        >
          <div className="flex items-start font-bold
          modernist text-[25vw] leading-8 tracking-wide">
            <span>{progress}</span>

            <span className="mt-2 text-[0.25em] tracking-normal">
              %
            </span>
          </div>

          <div className="absolute bottom-8.75 left-[5%] right-[5%]
          flex justify-between text-[10px] sm:text-xs
          font-medium tracking-[2px] text-white/70">

            <span className="modernist">LOADING EXPERIENCE</span>
            <span className="modernist">{progress}/100</span>

          </div>
        </div>
      )}
    </PreloaderContext.Provider>
  );
}
