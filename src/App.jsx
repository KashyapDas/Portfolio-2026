import './index.css'
import { PageTransitionProvider, TransitionLink } from "./components/Pagetransition";
import Home from './components/Home';
import About from "./components/About";
import Skills from "./components/Skills";
import Works from "./components/Works";
import Contact from "./components/Contact";
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from "./components/Preloader";


function App() {

  return (
    <Preloader>
    <PageTransitionProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/works" element={<Works />} />
          <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </PageTransitionProvider>
    </Preloader>
  );
}

export default App
