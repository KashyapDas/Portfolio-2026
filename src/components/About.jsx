import CylinderScroll from "../miniComponent/CylinderScroll";
import AboutIntroduction from "../miniComponent/AboutIntroduction";
import Showcase from "../miniComponent/Showcase";
import { usePageTransition } from "./Pagetransition";
import { useEffect } from "react";
import { usePreloader } from "./Preloader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
function About() {

  const { markPageReady } = usePageTransition();

  const { completeLoading } = usePreloader();

  useEffect(() => {
    completeLoading("/about");
    markPageReady();
  }, [markPageReady]);
  
  return (
    <div className="w-full h-fit bg-[#0A0A0C] select-none">
      {/* Introduction of mine */}
      <div className="z-20 w-full">
        <AboutIntroduction />
      </div>


      {/* Scroll effect of the about page */}
      <div className="relative z-20 w-full h-fit overflow-hidden">
        <CylinderScroll />
      </div>
      
      {/* Some extra of me */}
      <div className=" z-20 h-fit overflow-hidden">
          <Showcase />
      </div>

    </div>
  );
}

export default About;
