import React from 'react'
import "../index.css"
import FlowButton from "../miniComponent/FlowButton"
import Home1 from '../miniComponent/Home1'
import FashionGallery from '../miniComponent/FashionGallery'
import { usePageTransition } from "./Pagetransition";
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const Home = () => {
  const { markPageReady } = usePageTransition();
  
  useGSAP(() => {
  const tl = gsap.timeline({
    onComplete: () => {
      markPageReady();
    }
  });

  tl.from(".hero-title", {
    y: 100,
    opacity: 0,
    duration: 1,
  });

  tl.from(".hero-description", {
    y: 50,
    opacity: 0,
    duration: 0.8,
  });

}, []);

  return (
    <div className='w-full bg-black select-none'>
      <div className="relative z-20 h-[60vh] lg:h-[90vh] w-full">
        <FashionGallery onReady={markPageReady} />
      </div>

      <div className='w-full h-fit mt-10'>
          <Home1 />
      </div>


    </div>
  )
}

export default Home
