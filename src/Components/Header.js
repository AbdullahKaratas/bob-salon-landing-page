import React, { Component } from "react";
import hmeImg from "../images/home.jpg"
import hmeImgMobil from "../images/home2.jpg"
import MediaQuery from 'react-responsive'

class Header extends Component {
  render() {
    if (!this.props.data) return null;

    return (
      <div>
        <MediaQuery maxWidth={1224}>
          <header id="home" style={{ backgroundImage: `url(${hmeImgMobil})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'}} >
              {/* <ParticlesBg type="circle" bg={true} /> */}

              <nav id="nav-wrap">
                <a className="mobile-btn" href="#nav-wrap" title="Show navigation">
                  Show navigation
                </a>
                <a className="mobile-btn" href="#home" title="Hide navigation">
                  Hide navigation
                </a>

                <ul id="nav" className="nav">
                  <li className="current">
                    <a className="smoothscroll" href="#home">
                      Home
                    </a>
                  </li>

                  <li>
                    <a className="smoothscroll" href="#about">
                      Über bob-salon
                    </a>
                  </li>

                  <li>
                    <a className="smoothscroll" href="#resume">
                      Preisliste
                    </a>
                  </li>

                  <li>
                    <a className="smoothscroll" href="#portfolio">
                      Gallerie
                    </a>
                  </li>

                  <li>
                    <a className="smoothscroll" href="#contact">
                      Kontakt
                    </a>
                  </li>
                </ul>
              </nav>
              <p className="scrolldown">
                <a className="smoothscroll" href="#about">
                  <i className="icon-down-circle"></i>
                </a>
              </p>
            </header>
        </MediaQuery>
        <MediaQuery minWidth={1224}>
        <header id="home" style={{ backgroundImage: `url(${hmeImg})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'}} >
              {/* <ParticlesBg type="circle" bg={true} /> */}

              <nav id="nav-wrap">
                <a className="mobile-btn" href="#nav-wrap" title="Show navigation">
                  Show navigation
                </a>
                <a className="mobile-btn" href="#home" title="Hide navigation">
                  Hide navigation
                </a>

                <ul id="nav" className="nav">
                  <li className="current">
                    <a className="smoothscroll" href="#home">
                      Home
                    </a>
                  </li>

                  <li>
                    <a className="smoothscroll" href="#about">
                      Über bob-salon
                    </a>
                  </li>

                  <li>
                    <a className="smoothscroll" href="#resume">
                      Preisliste
                    </a>
                  </li>

                  <li>
                    <a className="smoothscroll" href="#portfolio">
                      Gallerie
                    </a>
                  </li>

                  <li>
                    <a className="smoothscroll" href="#contact">
                      Kontakt
                    </a>
                  </li>
                </ul>
              </nav>

              <p className="scrolldown">
                <a className="smoothscroll" href="#about">
                  <i className="icon-down-circle"></i>
                </a>
              </p>
            </header>
        </MediaQuery>
      </div>
    );
  }
}

export default Header;
