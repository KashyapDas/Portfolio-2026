import { useCallback, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import SingleCase from "./SingleCase";

const showCase = [
  {title : "Web Development", description : "Transforming innovative ideas into seamless digital experiences, I craft responsive web solutions that merge cutting-edge technology with intuitive design. From pixel-perfect interfaces to robust backend architecture, my work delivers impactful results that help businesses thrive in the digital landscape.", firstButton : true , secondButton : false},
  {title : "AI & ML", description : "Pioneering intelligent solutions through advanced machine learning algorithms and artificial intelligence innovation. From predictive analytics to deep learning architectures, we transform complex data into actionable insights. Specializing in custom AI models that drive efficiency, automation, and decision-making across industries.", firstButton : true , secondButton : false},
  {title : "Data Science", description : "Transforming raw information into actionable insights. Leveraging advanced analytics and machine learning to uncover hidden patterns, forecast trends, and drive data-driven decisions. From exploratory analysis to predictive modeling, turning complex data challenges into powerful business solutions", firstButton : true , secondButton : true},
  {title : "Blockchain", description : "Architecting decentralized solutions that revolutionize digital trust. From smart contracts to DeFi protocols, I transform complex blockchain concepts into seamless applications. Building secure, transparent, and scalable systems that bridge the gap between cutting-edge technology and real-world utility, empowering the future of Web3.", firstButton : true , secondButton : false},
  {title : "Internet of Things (IOT)", description : "Pioneering the future of connected living through Internet of Things innovations. From smart sensors to intelligent automation, we transform everyday objects into interconnected solutions that enhance efficiency, streamline operations, and create seamless experiences in our increasingly connected world.", firstButton : true , secondButton : false},
  {title : "Devops", description : "Orchestrating seamless infrastructure through automation and innovation. From continuous integration to robust deployment pipelines, I transform development workflows into efficient, scalable operations. Leveraging modern tools and cloud technologies to bridge the gap between development and operations, ensuring reliable, high-performance software delivery at enterprise scale.", firstButton : true , secondButton : false},
  {title : "Virtual Reality (VR)", description : "Pioneering Virtual Realities: Where Digital Dreams Take Shape. Through immersive experiences and cutting-edge VR technology, I craft virtual worlds that push the boundaries of human interaction. Each project is a gateway to new dimensions, blending innovation with seamless user experiences.", firstButton : true , secondButton : true},
  {title : "Cloud Computing", description : "Utilizing cloud-based platforms to manage and deliver online advertising campaigns, allowing for scalability, real-time data analysis, and efficient campaign optimization, where advertisers can access a vast pool of computing power to target audiences across various digital channels without needing to manage their own physical infrastructure.", firstButton : true , secondButton : true},
];

const images = [
  "https://i.pinimg.com/1200x/f5/57/89/f55789498775ddade8656ef5e3546ac0.jpg",
  "https://i.pinimg.com/736x/25/18/11/251811f54bdb444d134cfc9a8d34a642.jpg",
  "https://i.pinimg.com/736x/24/7d/66/247d668068ecfcfce5657a6e64fbe2e6.jpg",
  "https://i.pinimg.com/736x/23/ef/a7/23efa724d8662095e87106e7d1cc2c14.jpg",
  "https://i.pinimg.com/736x/bf/63/2c/bf632c98228887e12294799bf7a660ba.jpg",
  "https://i.pinimg.com/1200x/e0/9d/fa/e09dfaf97cc1cb87a36fb9c252d0242a.jpg",
  "https://i.pinimg.com/736x/11/15/87/1115870a18bd479d41de3ef920589592.jpg",
  "https://i.pinimg.com/736x/e1/ed/22/e1ed229ae6bc09c02bea0f85bce461b4.jpg",
];

const Showcase = () => {
  const rootRef = useRef(null);
  const windowRef = useRef(null);
  const ctxRef = useRef(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  // Initial state (same as pos = -35 in the Framer version):
  // the window is parked above, scenes are pushed down so nothing shows yet.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(windowRef.current, { y: isMobile ? -35 : "-35vh" });
      gsap.set(".scence", { y: "35vh" });
    }, rootRef);
    ctxRef.current = ctx;
    return () => ctx.revert();
  }, [isMobile]);

  // Called by <SingleCase /> with its index
  const mover = useCallback(
    (count) => {
      const pos = count * (isMobile ? 250 : 35); // 250px per section on mobile, 35vh on desktop

      ctxRef.current?.add(() => {
        // the clipping window slides to the hovered row  (was: ease [0.76,0,0.24,1], 0.9s)
        gsap.to(windowRef.current, {
          y: isMobile ? pos : `${pos}vh`,
          duration: 0.9,
          ease: "power4.inOut",
          overwrite: "auto",
        });

        // the image strip slides the opposite way so the right image lines up  (was: ease [0.16,1,0.3,1], 0.4s)
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

  return (
    <div
      ref={rootRef}
      className="w-full h-fit text-white mt-16 lg:mt-40 flex flex-col gap-22 lg:gap-0 relative overflow-hidden"
    >
      {showCase.map((elem, index) => (
        <SingleCase key={index} data={elem} mover={mover} index={index} />
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
