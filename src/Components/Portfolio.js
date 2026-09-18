import React, { Component } from "react";
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import { galerie } from "../images/bilder";

class Slider extends Component {
  render() {
    /* Noch nicht gefuellte Plaetze aus src/images/bilder.js ueberspringen. */
    const bilder = galerie.filter(Boolean);

    return (
      <section id="portfolio">
        <AwesomeSlider bullets={false}>
          {bilder.map((bild, i) => (
            <div key={i} data-src={bild} style={{ maxHeight: '1200px' }} />
          ))}
        </AwesomeSlider>
      </section>
    );
  }
}

export default Slider;
