import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/custom-animations/cube-animation.css';
import hand from "../images/hand.jpg"
import innerPlace from "../images/innerPlace.jpg"
import lights from "../images/lights.jpg"
import green from "../images/green.jpg"

const Slider = (
  <section id="portfolio">
    <AwesomeSlider animation="cubeAnimation">
      <div data-src= `url(${hand})` />
      <div data-src="/path/to/image-1.png" />
      <div data-src="/path/to/image-2.jpg" />
    </AwesomeSlider>
  </section>

);

export default Slider;