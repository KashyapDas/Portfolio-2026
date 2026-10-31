
import { useRef } from "react";
import gsap from "gsap";

const AnimatedButton = ({
  text = "Explore More",
  link,
  variant = "primary",
}) => {
  const buttonRef = useRef(null);
  const isPrimary = variant === "primary";

  const handleMouseEnter = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      gsap.to(buttonRef.current, {
        scale: 1.04,
        y: -3,
        duration: 0.3,
        ease: "power3.out",
      });
    }
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  return (
    <a
      ref={buttonRef}
      href={link}
      rel="noopener noreferrer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        inline-flex items-center justify-center gap-1.5
        px-3 py-2
        sm:px-4 sm:py-2.5
        md:px-5 md:py-3
        text-xs sm:text-sm
        font-medium tracking-wide
        whitespace-nowrap
        cursor-pointer
        transition-colors duration-300
        focus-visible:outline-2 focus-visible:outline-offset-4
        focus-visible:outline-violet-500
        ${
          isPrimary
            ? "bg-violet-400 text-black hover:bg-violet-700 hover:text-white"
            : "bg-transparent text-black border border-black hover:bg-black hover:text-white"
        }
      `}
    >
      <span>{text}</span>

      <span className="flex items-center justify-center text-sm sm:text-base leading-none">
        ↗
      </span>
    </a>
  );
};

export default AnimatedButton;
