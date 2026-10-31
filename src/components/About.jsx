import CylinderScroll from "../miniComponent/CylinderScroll";
import AboutIntroduction from "../miniComponent/AboutIntroduction";
import Showcase from "../miniComponent/Showcase";
function About() {
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
