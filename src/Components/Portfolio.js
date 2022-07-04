import React, { Component } from "react";
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import hand from "../images/hand.jpg"
import innerPlace from "../images/innerplace.jpg"
import lights from "../images/lights.jpg"
import green from "../images/green.jpg"

class Slider extends Component {
  render() {
    return (
      <section id="portfolio">
        <AwesomeSlider bullets={false} >
          <div data-src= {hand} style={{maxHeight: '1200px'}}/>
          <div data-src={innerPlace} style={{maxHeight: '1200px'}}/>
          <div data-src={lights} style={{maxHeight: '1200px'}}/>
          <div data-src={green} style={{maxHeight: '1200px'}}/>
        </AwesomeSlider>
      </section>
    );
  }
}

export default Slider;
