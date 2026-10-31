import { useRef } from "react";
import LiquidText from "../miniComponent/LiquidText";
import ProcessList from "../miniComponent/ProcessList";
import SwipeCards from "../miniComponent/SwipeCards";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

function Works() {
  const verticalLineStyle = useRef();
  const {contextSafe} = useGSAP();

  const enableLineAnimation = contextSafe(()=>{
    gsap.to(verticalLineStyle.current,{
      width : "80%",
      duration : 0.3,
      ease : "power2.inOut"
    })
  })

  const disableLineAnimation = contextSafe(()=>{
    gsap.to(verticalLineStyle.current,{
      width : "0%",
      duration : 0.3,
      ease : "power2.inOut"
    })
  })


  return (
    <div className="w-full bg-[#09090B] select-none overflow-hidden">
      <LiquidText image="/img/liquid.jpg" />

      <div className="w-full flex items-center justify-center">
          <h1 className="text-center w-[98%] pt-8 lg:pt-2 lg:w-[70%] knife text-6xl lg:text-9xl uppercase text-violet-400">prove your capabilities through real projects. This is the right place for project videos, screenshots, links and concise case studies.</h1>
      </div>
      {/* Projcet markdown */}
      <div>
        <ProcessList />
      </div>
      {/* What I have build */}
      <div className="w-full h-fit">
        <div className="w-full flex flex-col items-center justify-center">
          <h1 onMouseEnter={enableLineAnimation} onMouseLeave={disableLineAnimation} className="text-violet-400 knife text-center text-6xl lg:text-9xl cursor-pointer">A SELECTION OF THINGS I’VE BUILT.</h1>
          <div ref={verticalLineStyle}  className="w-[0%] h-1 bg-pink-500"></div>
          
          <div className="w-[98%] overflow-hidden lg:pt-5">
            <SwipeCards />
          </div>

        </div>

      </div>

    </div>
  );
}

export default Works;
