import { useEffect } from "react";
import ActionButtons from "../miniComponent/ActionButtons";
import { usePageTransition } from "./Pagetransition";

function Contact() {

  const { markPageReady } = usePageTransition();
  
    useEffect(() => {
      markPageReady();
    }, [markPageReady]);

  return (
    <div className='w-full h-fit overflow-hidden bg-[#09090B] select-none'>

      <div className='w-full h-fit flex items-center justify-center pt-5'>
          <h1 className='knife w-full lg:w-1/2 text-center text-violet-400 text-7xl lg:text-9xl'>HAVE AN IDEA? LET’S BUILD IT.</h1>
      </div>
      <div className='w-full h-fit flex items-center justify-center pt-2'>
        <p className='modernist w-[90%] lg:w-[55%] text-center text-white text-sm lg:text-xl'>Need a modern website, an interactive frontend or a complete web application? Tell me what you’re planning, what problem you want to solve and where you are in the process.</p>
      </div>

      <div className='w-full h-fit flex items-center justify-center pt-15 lg:pt-25'>
          <h1 className='knife w-full lg:w-1/2 text-center text-violet-400 text-7xl lg:text-9xl'>Good reasons to reach out.</h1>
      </div>
      <div className='w-full h-fit flex flex-col items-center justify-center pt-2'>
        <p className='modernist w-[95%] lg:w-[55%] text-center text-white text-[1.3vh] lg:text-xl'>You want a distinctive React frontend with thoughtful motion and interaction.</p>
        <p className='modernist w-[95%] lg:w-[55%] text-center text-white text-[1.3vh] lg:text-xl'>You are exploring a product idea that may benefit from AI integration.</p>
        <p className='modernist w-[95%] lg:w-[55%] text-center text-white text-[1.3vh] lg:text-xl'>You need backend APIs, authentication or database integration.</p>
        <p className='modernist w-[95%] lg:w-[55%] text-center text-white text-[1.3vh] lg:text-xl'>You need a responsive website or a redesign</p>
      </div>

      <div className="w-full flex items-center justify-center pt-10">
        <div className='w-1/2 flex flex-wrap items-center justify-center gap-x-5 gap-y-5'>
            <ActionButtons
              text="Connect on Github"
              link="https://github.com/KashyapDas"
              variant="primary"
            />

            <ActionButtons
              text="Connect on LinkedIn"
              link="https://www.linkedin.com/in/kashyap-jyoti-das-a36769290"
              variant="primary"
            />

            <ActionButtons
              text="Follow me on X"
              link="https://x.com/kashyap_builds"
              variant="primary"
            />

            <div className="for-laptop hidden lg:block">
                <ActionButtons
                  text="Email Me"
                  link="https://mail.google.com/mail/?view=cm&fs=1&to=kashyap.education2234@gmail.com"
                  variant="primary"
                />
            </div>
            <div className="for-mobile block lg:hidden">
                <ActionButtons
                  text="Email Me"
                  link="mailto:kashyap.education2234@gmail.com"
                  variant="primary"
                />
            </div>

        </div>
      </div>

      <div className='w-full h-fit flex items-center justify-center pt-25 lg:pt-40'>
          <h1 className='knife w-full text-center text-white text-7xl lg:text-[15vw]'>LET’S MAKE SOMETHING USEFUL.</h1>
      </div>
      

    </div>
  );
}

export default Contact;
