import React, { Component } from "react";
import Fade from "react-reveal";
import abtImg from "../images/aboutbob.jpg"

class About extends Component {
  render() {
    if (!this.props.data) return null;

    const name = this.props.data.name.toLowerCase();
    const bio = this.props.data.bio.toLowerCase();
    const street = this.props.data.address.street.toLowerCase();
    const city = this.props.data.address.city.toLowerCase();
    const state = this.props.data.address.state.toLowerCase();
    const zip = this.props.data.address.zip.toLowerCase();
    const phone = this.props.data.phone.toLowerCase();
    const email = this.props.data.email.toLowerCase();

    return (
      <section id="about">
        <Fade duration={1000}>
          <div className="row">
            <div className="three columns">
              <img
                style={{borderRadius: '12px'}}
                src={abtImg}
              />
            </div>
            <div className="nine columns main-col">
              <h2>über bob-salon</h2>

              <p>{bio}</p>
              <div className="row">
                <div className="columns contact-details">
                  <h2>details</h2>
                  <p className="address">
                    <span>{name}</span>
                    <br />
                    <span>
                      {street}
                      <br />
                      {zip} {city}, {state}
                    </span>
                    <br />
                    <span>{phone}</span>
                    <br />
                    <span>{email}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </section>
    );
  }
}

export default About;
