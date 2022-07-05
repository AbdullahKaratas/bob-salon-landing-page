import React, { Component } from "react";
import Slide from "react-reveal";

class Resume extends Component {
  getRandomColor() {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  render() {
    if (!this.props.data) return null;

    const skillmessage = this.props.data.skillmessage.toLowerCase();
    const leistungen = this.props.data.leistungen.map(function (leistung) {
      return (
        <div key={leistung.leistung.toLowerCase()}>
          <p className="info">
          {leistung.leistung.toLowerCase()}<span>&bull;</span>
            <em className="date">{leistung.preis.toLowerCase()}</em>
          </p>
        </div>
      );
    });

    const paintings = this.props.data.paintings.map(function (painting) {
      return (
        <div key={painting.leistung.toLowerCase()}>
          <p className="info">
          {painting.leistung.toLowerCase()}<span>&bull;</span>
            <em className="date">{painting.preis.toLowerCase()}</em>
          </p>
        </div>
      );
    });

    const elsecases = this.props.data.elsecases.map((elsecase) => {
      return (
        <div key={elsecase.leistung.toLowerCase()}>
          <p className="info">
          {elsecase.leistung.toLowerCase()}<span>&bull;</span>
            <em className="date">{elsecase.preis.toLowerCase()}</em>
          </p>
        </div>
      );
    });

    return (
      <section id="resume">
        <Slide left duration={1300}>
          <div className="row education">
            <div className="three columns header-col">
              <h1>
                <span>haarschnitt</span>
              </h1>
            </div>

            <div className="nine columns main-col">
              <div className="row item">
                <div className="twelve columns">{leistungen}</div>
              </div>
            </div>
          </div>
        </Slide>

        <Slide left duration={1300}>
          <div className="row work">
            <div className="three columns header-col">
              <h1>
                <span>färben</span>
              </h1>
            </div>

            <div className="nine columns main-col">{paintings}</div>
          </div>
        </Slide>

        <Slide left duration={1300}>
          <div className="row skill">
            <div className="three columns header-col">
              <h1>
                <span>weitere leistungen</span>
              </h1>
            </div>

            <div className="nine columns main-col">
              <div className="three columns header-col">
                <ul className="skills">{elsecases}</ul>
              </div>
            </div>
          </div>
        </Slide>
      </section>
    );
  }
}

export default Resume;
