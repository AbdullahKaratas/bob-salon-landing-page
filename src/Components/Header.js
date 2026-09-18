import React, { Component } from "react";
import { startbild, startbildMobil } from "../images/bilder";

const menue = [
  { ziel: "#home", text: "home" },
  { ziel: "#about", text: "über bob-salon" },
  { ziel: "#resume", text: "preisliste" },
  { ziel: "#portfolio", text: "galerie" },
  { ziel: "#contact", text: "kontakt" },
];

class Header extends Component {
  render() {
    if (!this.props.data) return null;

    return (
      <header id="home">
        {/* Das Startfoto liegt als eigenes Bild hinter dem Schriftzug.
            Welches Foto das ist, steht in src/images/bilder.js. */}
        <picture className="hero-bild">
          <source media="(max-width: 767px)" srcSet={startbildMobil} />
          <img src={startbild} alt="" />
        </picture>
        <div className="hero-schleier" />

        <nav id="nav-wrap">
          <a className="mobile-btn" href="#nav-wrap" title="Show navigation">
            Show navigation
          </a>
          <a className="mobile-btn" href="#home" title="Hide navigation">
            Hide navigation
          </a>

          <ul id="nav" className="nav">
            {menue.map((punkt, i) => (
              <li className={i === 0 ? "current" : ""} key={punkt.ziel}>
                <a className="smoothscroll" href={punkt.ziel}>
                  {punkt.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="banner">
          <div className="banner-text">
            <h1 className="wortmarke">bob</h1>
            <p className="wortmarke-name">francisco guerrero lopera</p>
          </div>
        </div>

        <p className="scrolldown">
          <a className="smoothscroll" href="#about">
            <i className="icon-down-circle"></i>
          </a>
        </p>
      </header>
    );
  }
}

export default Header;
