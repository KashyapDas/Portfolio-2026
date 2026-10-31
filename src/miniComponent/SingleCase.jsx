import React from "react";

const btn =
  "bg-white text-black font-[Satoshi] font-bold py-1 px-4 text-sm lg:text-base rounded-full lg:cursor-pointer";

const SingleCase = ({ data, mover, index }) => {
  return (
    <div
      onMouseEnter={() => mover(index)}
      onTouchStart={() => mover(index)}
      onMouseLeave={() => mover(-7)}
      className="w-full h-fit lg:h-[35vh] bg-[#0A0A0C] hover:bg-violet-600 transition-colors duration-300 flex flex-col lg:flex-row p-2 overflow-hidden cursor-pointer"
    >
      <div className="px-2 lg:w-1/2 lg:flex lg:items-center lg:p-10">
        <h1 className="text-white font-[Satoshi] font-bold text-4xl lg:text-5xl">
          {data.title}
        </h1>
      </div>

      <div className="p-2 lg:w-1/2 lg:flex lg:flex-col lg:justify-center lg:items-end lg:p-10">
        <h2 className="text-white font-[Satoshi] font-medium md:text-sm lg:text-[2vh] lg:w-[70%]">
          {data.description}
        </h2>

        <div className="flex gap-5 mt-3 lg:w-[70%]">
          {data.firstButton && <button className={btn}>Live Website</button>}
          {data.secondButton && (
            <button className={`${btn} lg:py-2`}>Research Paper</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleCase;
