import React, { Component } from "react";
import Fade from "react-reveal";
import { portrait, salon } from "../images/bilder";

class About extends Component {
  render() {
    if (!this.props.data) return null;

    const name = this.props.data.name.toLowerCase();
    const bio = this.props.data.bio.toLowerCase();
    const street = this.props.data.address.street.toLowerCase();
    const city = this.props.data.address.city.toLowerCase();
    const zip = this.props.data.address.zip.toLowerCase();
    const phone = this.props.data.phone.toLowerCase();
    const email = this.props.data.email.toLowerCase();

    return (
      <section id="about">
        <Fade duration={600}>
          <div className="row">
            <div className="four columns about-bilder">
              {/* Das Portrait erscheint nur, wenn in src/images/bilder.js
                  eines eingetragen ist. */}
              {portrait && (
                <img className="about-portrait" src={portrait} alt={name} />
              )}
              <img className="about-salon" src={salon} alt="bob salon" />
            </div>

            <div className="eight columns main-col">
              <h2>über bob-salon</h2>

              <p>{bio}</p>

              <div className="contact-details">
                <h2>kontakt</h2>
                <p className="address">
                  <span>{name}</span>
                  <br />
                  <span>
                    {street}
                    <br />
                    {zip} {city}
                  </span>
                  <br />
                  <span>{phone}</span>
                  <br />
                  <span>{email}</span>
                </p>
              </div>
            </div>
          </div>
        </Fade>
      </section>
    );
  }
}

export default About;
