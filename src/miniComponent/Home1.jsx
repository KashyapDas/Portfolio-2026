import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const socialLinks = [
  {
    staticText: 'INTERACTIVE FRONTENDS',
    hoverText: 'React interfaces with considered layouts, responsive behaviour and GSAP-powered motion.',
    href: '#',
  },
  {
    staticText: 'FULL-STACK SYSTEMS',
    hoverText: 'APIs, authentication, data modelling and database-backed application features.',
    href: '#',
  },
  {
    staticText: 'ENGINEERING EXPERIMENTS',
    hoverText: 'Developer-focused work such as StrawberryDB, alongside exploration in Python and AI/ML.',
    href: '#',
  },
  {
    staticText: 'BUILT FOR REAL USE',
    hoverText: 'A focus on usability, maintainability and the details that make a product dependable.',
    href: '#',
  },
];

function SocialItem({ staticText, hoverText, href }) {
  const containerRef = useRef(null);
  const marqueeTrackRef = useRef(null);
  const marqueeTl = useRef(null);
  const hoverTl = useRef(null);

  useGSAP(
    () => {
      // 1. Continuous marquee animation
      marqueeTl.current = gsap.to(marqueeTrackRef.current, {
        xPercent: -50,
        ease: 'none',
        duration: 70,
        repeat: -1,
      });

      // 2. Reveal timeline
      hoverTl.current = gsap
        .timeline({ paused: true })
        .to('.hover-bg', {
          scaleY: 1,
          duration: 0.35,
          ease: 'power3.out',
        })
        .to(
          '.static-content',
          {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.out',
          },
          '<0.05'
        )
        .to(
          '.hover-marquee',
          {
            opacity: 1,
            duration: 0.2,
            ease: 'power2.out',
          },
          '<'
        );
    },
    { scope: containerRef }
  );

  // Play animation on mouse enter or touch start
  const handleActivate = () => {
    hoverTl.current?.play();
  };

  // Reverse animation on mouse leave, touch end, or cancelled touch
  const handleDeactivate = () => {
    hoverTl.current?.reverse();
  };

  const handleClick = (e) => {
    if (href === '#' || !href) {
      e.preventDefault(); // Prevents jumping to top of viewport
    }
  };

  const marqueeItems = Array.from({ length: 12 });

  return (
    <a
      href={href}
      ref={containerRef}
      onClick={handleClick}
      onMouseEnter={handleActivate}
      onMouseLeave={handleDeactivate}
      onTouchStart={handleActivate}
      onTouchEnd={handleDeactivate}
      onTouchCancel={handleDeactivate}
      className="group relative block w-full overflow-hidden select-none touch-manipulation"
    >
      {/* Expanding Accent Background */}
      <div className="hover-bg pointer-events-none absolute inset-0 origin-center scale-y-0 bg-[#e0fd60]" />

      {/* Marquee Overlay */}
      <div className="hover-marquee pointer-events-none absolute inset-0 z-10 flex items-center overflow-hidden opacity-0">
        <div ref={marqueeTrackRef} className="flex shrink-0 items-center whitespace-nowrap">
          {marqueeItems.map((_, index) => (
            <span
              key={index}
              className="inline-flex items-center text-2xl sm:text-4xl lg:text-5xl font-black text-black uppercase tracking-wider"
            >
              <span className="mx-4 sm:mx-6">{hoverText}</span>
              <ArrowUpRight className="h-6 w-6 sm:h-9 sm:w-9 stroke-[2.5]" />
            </span>
          ))}
        </div>
      </div>

      {/* Static Base Content */}
      <div className="static-content relative z-0 flex items-center justify-between px-6 sm:px-16 lg:px-24 py-8">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-wider">
          {staticText}
        </h2>
        <ArrowUpRight className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white stroke-[2.5]" />
      </div>
    </a>
  );
}

export default function Home1() {
  return (
    <footer className="w-full bg-black">
      <div className="flex flex-col divide-y divide-white/20 border-y border-white/20">
        {socialLinks.map((item, index) => (
          <SocialItem
            key={index}
            staticText={item.staticText}
            hoverText={item.hoverText}
            href={item.href}
          />
        ))}
      </div>
    </footer>
  );
}