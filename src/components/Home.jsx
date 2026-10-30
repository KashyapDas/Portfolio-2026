import React from 'react'
import "../index.css"
import FlowButton from "../miniComponent/FlowButton"
import Home1 from '../miniComponent/Home1'

const Home = () => {
  return (
    <div className='w-full'>

      <div className='flex items-center justify-center mt-4'>
        <h1 className='home-hero text-5xl w-[75%] text-center font-light lg:text-7xl lg:w-[70%]'>I build digital <span className='text-violet-500'>experiences </span>that <span className='text-violet-500'>work</span> as good as they look.</h1>
      </div>

      <div className='w-full h-fit flex gap-x-[8vw] items-center justify-center mt-2'>
        {/* marque 1 */}
        <div className='hidden lg:flex lg:gap-y-10 lg:flex-col'>
          <h1 className='home-sideFont font-black text-center text-2xl'>Fontend Developer</h1>
          <h1 className='home-sideFont font-black text-center text-2xl'>Backend Developer</h1>
          <h1 className='home-sideFont font-black text-center text-2xl'>AI ML Developer</h1>
        </div>
        {/* profile picture */}
        <div className='profile-picture w-[60vw] h-[40vh] overflow-hidden lg:w-[15vw] lg:h-[40vh] cursor-pointer'>
          <img src="/images/profilePicture.jpg" className='w-full h-full object-cover' />
        </div>  
        {/* marque 2 */}
        <div className='hidden lg:flex lg:gap-y-10 lg:flex-col'>
          <h1 className='home-sideFont font-black text-center text-2xl'>Blockchain Developer</h1>
          <h1 className='home-sideFont font-black text-center text-2xl'>Prompt Engineer</h1>
          <h1 className='home-sideFont font-black text-center text-2xl'>Web Designer</h1>
        </div>
      </div>

      <div className='w-full flex flex-col items-center justify-center mt-4 lg:mt-8'>
        <h1 className='home-subtitle w-full text-[1.9vh] font-black text-center pl-8 pr-8 lg:text-2xl lg:w-[80%]'>I’m Kashyap Jyoti Das, a full-stack freelancer building modern web applications with React, TypeScript and scalable backend technologies. I bring interfaces to life with GSAP motion and build the systems behind them with databases, APIs and thoughtful architecture.</h1>
        {/* lest talk button */}
        <div className='mt-2'><FlowButton /></div>
      </div>

      <div className='w-full h-fit mt-3'>

          <Home1 />
      </div>


    </div>
  )
}

export default Home
