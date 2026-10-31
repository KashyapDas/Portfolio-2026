import { useMemo } from "react";
import KineticFooter from "../miniComponent/KineticFooter";


function Footer() {
  const images = useMemo(
  () => [
    "/images/footer1.jpg",
    "/images/footer2.jpg",
    "/images/footer3.jpg",
    "/images/footer4.jpg",
    "/images/footer5.jpg",
  ],
  []
);

  return (
    <footer className="bg-[#09090b] z-10 h-fit">
      <KineticFooter
        title="THE WORLD DOESN'T NEED ANOTHER WEBSITE. IT NEED A REASON TO REMEMBER."
        images={images}
      />
    </footer>
  );
}

export default Footer;
