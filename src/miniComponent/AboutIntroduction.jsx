import FlowButton from "../miniComponent/FlowButton";

const AboutIntroduction = () => {
  return (
    <div className="bg-[#0A0A0C]">
      <div className="flex items-center justify-center pt-4">
        <h1 className="home-hero text-white text-5xl w-[75%] text-center font-light lg:text-7xl lg:w-[70%]">
          I build digital <span className="text-violet-500">experiences </span>
          that <span className="text-violet-500">work</span> as good as they
          look.
        </h1>
      </div>

      <div className="w-full h-fit flex gap-x-[8vw] items-center justify-center mt-2">
        {/* marque 1 */}
        <div className="hidden lg:flex lg:gap-y-10 lg:flex-col text-white">
          <h1 className="home-sideFont font-black text-center text-2xl">
            Fontend Developer
          </h1>
          <h1 className="home-sideFont font-black text-center text-2xl">
            Backend Developer
          </h1>
          <h1 className="home-sideFont font-black text-center text-2xl">
            AI ML Developer
          </h1>
        </div>
        {/* profile picture */}
        <div className="profile-picture w-[60vw] h-[40vh] overflow-hidden lg:w-[15vw] lg:h-[40vh] cursor-pointer">
          <img
            src="/images/profilePicture.jpg"
            className="w-full h-full object-cover"
          />
        </div>
        {/* marque 2 */}
        <div className="hidden lg:flex lg:gap-y-10 lg:flex-col text-white">
          <h1 className="home-sideFont font-black text-center text-2xl">
            Blockchain Developer
          </h1>
          <h1 className="home-sideFont font-black text-center text-2xl">
            Prompt Engineer
          </h1>
          <h1 className="home-sideFont font-black text-center text-2xl">
            Web Designer
          </h1>
        </div>
      </div>

      <div className="w-full flex flex-col items-center justify-center mt-4 lg:mt-8">
        <h1 className="home-subtitle w-full text-white text-[1.9vh] font-black text-center pl-8 pr-8 lg:text-2xl lg:w-[80%]">
          I’m Kashyap Jyoti Das, a software engineer and freelancer from Assam,
          India. I enjoy turning ideas into useful digital products—whether that
          means shaping an interface, solving a backend problem or experimenting
          with a new developer tool. I care about how a product feels to use,
          but I’m equally interested in how it works behind the scenes. That
          balance is what draws me to full-stack development.
        </h1>
        {/* lest talk button */}
        <div className="mt-2">
          <FlowButton />
        </div>
      </div>
    </div>
  );
};

export default AboutIntroduction;
