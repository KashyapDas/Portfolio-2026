import React from 'react'
import "../index.css"
import FlowButton from "../miniComponent/FlowButton"
import Home1 from '../miniComponent/Home1'
import FashionGallery from '../miniComponent/FashionGallery'

const Home = () => {
  return (
    <div className='w-full bg-black'>
      <div className="relative z-20 h-[60vh] lg:h-[90vh] w-full">
        <FashionGallery />
      </div>

      <div className='w-full h-fit mt-10'>
          <Home1 />
      </div>


    </div>
  )
}

export default Home
