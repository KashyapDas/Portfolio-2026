import React, { useRef } from 'react'
import "../index.css"
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollPathText from "../miniComponent/ScrollPathText";
import CardMarquee from "../miniComponent/CardMarquee";

function Skills() {

  const cardsStack = [
    {
      title : "FRONTEND",
      description : [
        {desc : "React - Typescript - Javascript"},
        {desc : "HTML - CSS - TailwindCSS"},
        {desc : "GSAP - ScrollTrigger - FramerMotion - ThreeJS"},
        
      ]
    },
    {
      title : "BACKEND",
      description : [
        {desc : "Node.js - Express - Svelte"},
        {desc : "REST APIs - Authentication"},
        {desc : "Python - FAST API - Django"},
      ]
    },
    {
      title : "DATABASE & DATA",
      description : [
        {desc : "MongoDB - PostgreSQL - MySQL"},
        {desc : "Prisma - Supabase - Firebase"},
        {desc : "Redis - DSL"},
        
      ]
    },
    {
      title : "AI / MACHINE LEARNING",
      description : [
        {desc : "Python - LangChain - LangGraph"},
        {desc : "PyTorch - RAG - Embeddings"},
        {desc : "Training - Testing - Validation"},
        
      ]
    },
  ]

  const individualStack = useRef(null);

  const {contextSafe} = useGSAP();

  const enableStackAnimation = contextSafe((e)=>{
    const card = e.currentTarget
    gsap.to(card,{
      backgroundColor : "#6308CC",
      scale : 1.05,
      duration : 0.5,
      ease : "cubic-bezier(0.87, 0, 0.13, 1)"
    })
  })

  const disableStackAnimation = contextSafe((e)=>{
    const card = e.currentTarget
    gsap.to(card,{
      backgroundColor : "#8E51FF",
      scale : 1,
      duration : 0.5,
      ease : "cubic-bezier(0.87, 0, 0.13, 1)"
    })
  })

  return (
    <div className='w-full h-fit bg-[#09090B] pl-7 pr-7'>

        {/* The skill cards */}
        <h1 className='morganoBold text-white text-8xl lg:text-[15vw]'>The<span className='text-violet-500 text-6xl lg:text-[8vw]'> Tools Behind The Build.</span></h1>
        <div className='w-full h-fit flex items-center justify-between flex-wrap gap-y-10 p-5'>

          {cardsStack.map((elem,index)=>{
              return <div ref={individualStack} onMouseEnter={enableStackAnimation} onMouseLeave={disableStackAnimation} onTouchStart={enableStackAnimation} onTouchEnd={disableStackAnimation} key={index} className='w-full lg:w-[48%] min-h-[30vh] flex flex-col pl-3 pt-3 cursor-pointer bg-violet-600 text-white rounded-xs'>
                <h1 className='modernist font-semibold text-2xl lg:text-5xl'>{elem.title}</h1>
                <div className='pt-10 font-sans text-lg lg:text-2xl flex flex-col'>
                {elem.description.map((subElem,subIndex)=>{
                  return <h3 key={subIndex}>{subElem.desc}</h3>
                })}
                </div>
              </div>
          })}

        </div>

        {/* The 2nd effect */}
        <div className='w-full h-fit pt-15 lg:pt-30'>
            <ScrollPathText
              items={[
                "One Unified Product,",
                { type: "image", src: "/images/skill1.jpg" },
                "Bringing Every Layer Together",
                { type: "image", src: "/images/skill2.jpg" },
                "Into One Seamless Experience.",
              ]}
            />
        </div>

        <div className='w-full h-fit flex items-center justify-center pt-20 lg:pt-30'>
              <h1 className='w-[80%] knife text-6xl lg:text-9xl text-center text-violet-300 cursor-pointer'>I can work across the main layers of a web product: shape the user experience, build the application logic, connect persistent data and explore intelligent features where they make sense.</h1>
        </div>

        <div className="w-full py-10">
            <CardMarquee />
        </div>

    </div>
  );
}

export default Skills;
