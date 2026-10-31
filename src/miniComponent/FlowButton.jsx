'use client';
import { ArrowRight } from 'lucide-react';
import {TransitionLink} from "../components/Pagetransition"

function FlowButton({ text = "Explore my works" }) {
  return (
    <TransitionLink to="/works">
        <button className="group relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-white bg-transparent px-8 py-3 text-sm font-semibold text-[#111111] cursor-pointer transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)]  hover:text-white hover:border-white hover:rounded-[100px] active:scale-[0.95]">
          {/* Left arrow (arr-2) */}
          <ArrowRight 
            className="absolute  w-4 h-4 left-[-25%] stroke-white text-white fill-none z-9 group-hover:left-4 group-hover:stroke-white transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
          />

          {/* Text */}
          <span className="relative z-1 -translate-x-3 group-hover:translate-x-3 transition-all duration-800 ease-out text-white">
            {text}
          </span>

          {/* Circle */}
          <span className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111111] rounded-[50%] opacity-0 group-hover:w-55 group-hover:h-55 group-hover:opacity-100 transition-all duration-800 ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

          {/* Right arrow (arr-1) */}
          <ArrowRight 
            className="absolute w-4 h-4 right-4 stroke-white fill-white z-9 group-hover:right-[-25%] group-hover:stroke-white transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
          />
        </button>
    </TransitionLink>
  );
}

export default FlowButton; 